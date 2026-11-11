/**
 * Testes de integração do módulo de autenticação: services reais sobre PGlite em memória (mesmas migrações
 * do drizzle-kit usadas em produção), com relógio injetado para testar expiração sem esperar.
 * Rodar: npm run test:auth
 *
 * As rotas em src/app/api/auth são finas (parse + service + resposta) e dependem de cookies() do Next, que só
 * existe dentro de uma requisição; aqui cobrimos os services e a camada HTTP compartilhada (src/server/http.ts).
 */
process.env.APP_URL = "http://localhost:3000";
(process.env as Record<string, string>).NODE_ENV = "test";

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { parseOptions } from "@node-rs/argon2";

import { migratePglite } from "../src/server/db/migrate.ts";
import { passwordResetTokens, pendingRegistrations, rateLimits, sessions as sessionsTable, users } from "../src/server/db/schema/auth.ts";
import {
  AuthService,
  PasswordResetService,
  PostgresRateLimiter,
  RegistrationService,
  VERIFICATION_TOKEN_TTL_MS,
  emailVerificationMessage,
  accountExistsMessage,
  RATE_LIMITS,
  enforceRateLimits,
  RESET_TOKEN_TTL_MS,
  SESSION_TTL_MS,
  SessionService,
  getClientIp,
  isAllowedOrigin,
  sessionCookieName,
  sessionCookieOptions,
  type AuthDb,
  type Logger,
  type MailService,
  AcsMailService,
  ConsoleMailService,
  DisabledMailService,
  createMailService,
  passwordResetMessage,
} from "../src/server/auth/index.ts";
import { DUMMY_PASSWORD_HASH, PASSWORD_HASH_PARAMS } from "../src/server/auth/password.ts";
import { hashToken } from "../src/server/auth/tokens.ts";
import { AppError } from "../src/server/errors.ts";
import { assertSameOrigin, parseJson, toErrorResponse } from "../src/server/http.ts";
import { ForgotPasswordInput, LoginInput, PublicUser, RegisterInput } from "../src/contracts/api.ts";

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

const PASSWORD = "senha1234";
const IP = "203.0.113.10";

interface SentMail {
  to: string;
  resetUrl: string;
}

interface Verification {
  to: string;
  name: string;
  verifyUrl: string;
}

async function setup(
  opts: { registrationOpen?: boolean; allowlist?: string[]; failingMailer?: boolean; failingVerificationMail?: boolean } = {},
) {
  const client = new PGlite();
  await migratePglite(client);
  const db = drizzle(client) as unknown as AuthDb;

  let now = new Date("2026-11-10T12:00:00.000Z");
  const clock = () => now;
  const advance = (ms: number) => {
    now = new Date(now.getTime() + ms);
  };

  const sent: SentMail[] = []; // só os e-mails de redefinição
  const verifications: Verification[] = [];
  const notices: string[] = []; // avisos de "você já tem conta" (destinatários)
  const logged: string[] = [];
  const logger: Logger = {
    info: (m, meta) => logged.push(`${m} ${JSON.stringify(meta ?? {})}`),
    warn: (m, meta) => logged.push(`${m} ${JSON.stringify(meta ?? {})}`),
    error: (m, meta) => logged.push(`${m} ${JSON.stringify(meta ?? {})}`),
  };
  const mailer: MailService = {
    async sendPasswordReset(mail) {
      if (opts.failingMailer) throw new Error("SMTP fora do ar");
      sent.push({ to: mail.to, resetUrl: mail.resetUrl });
    },
    async sendEmailVerification(mail) {
      if (opts.failingVerificationMail) throw new Error("SMTP fora do ar");
      verifications.push({ to: mail.to, name: mail.name, verifyUrl: mail.verifyUrl });
    },
    async sendAccountExists(mail) {
      notices.push(mail.to);
    },
  };
  const pending: Promise<void>[] = [];
  const flush = async () => {
    while (pending.length) await pending.shift();
  };

  const sessions = new SessionService(db, clock);
  const rateLimiter = new PostgresRateLimiter(db, clock);
  const auth = new AuthService({ db, sessions, rateLimiter });
  const defer = (job: () => Promise<void>) => void pending.push(job());
  const registration = new RegistrationService({
    db,
    sessions,
    rateLimiter,
    registration: { open: opts.registrationOpen ?? true, allowlist: opts.allowlist ?? [] },
    mailer,
    logger,
    appUrl: "http://localhost:3000",
    defer,
    clock,
  });
  const reset = new PasswordResetService({
    db,
    sessions,
    rateLimiter,
    mailer,
    logger,
    appUrl: "http://localhost:3000",
    defer,
    clock,
  });

  /** Só o pedido de cadastro (sem confirmar). */
  const requestRegistration = (email = "ana@exemplo.com", ip = IP, password = PASSWORD, name = "Ana") =>
    registration.register(RegisterInput.parse({ email, password, name }), { ip });
  /** Token do último link de confirmação enviado (para `to`, se dado). */
  const verificationToken = (to?: string) => {
    const v = verifications.filter((m) => !to || m.to === to).at(-1);
    assert.ok(v, `nenhum link de confirmação${to ? ` para ${to}` : ""}`);
    return v.verifyUrl.split("#token=")[1];
  };
  /** Fluxo completo: pede o cadastro, recebe o link e confirma. Devolve conta + sessão. */
  const register = async (email = "ana@exemplo.com", ip = IP) => {
    await requestRegistration(email, ip);
    await flush();
    return registration.verifyEmail({ token: verificationToken(email.trim().toLowerCase()) });
  };
  const tokenFromMail = (i = sent.length - 1) => sent[i].resetUrl.split("#token=")[1];

  return {
    db,
    client,
    auth,
    registration,
    reset,
    sessions,
    rateLimiter,
    sent,
    verifications,
    notices,
    logged,
    flush,
    advance,
    register,
    requestRegistration,
    verificationToken,
    tokenFromMail,
  };
}

/** Espera um AppError com o código (e status) dados. */
async function rejectsWith(p: Promise<unknown>, code: string, status?: number): Promise<AppError> {
  try {
    await p;
  } catch (err) {
    assert.ok(AppError.is(err), `esperava AppError, veio ${String(err)}`);
    assert.equal(err.code, code);
    if (status !== undefined) assert.equal(err.status, status);
    return err;
  }
  assert.fail(`esperava erro ${code}, mas resolveu`);
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// ---------------------------------------------------------------------------
// Validação (contratos Zod)
// ---------------------------------------------------------------------------

describe("contratos", () => {
  test("e-mail é normalizado (trim + lowercase) antes de validar", () => {
    assert.equal(LoginInput.parse({ email: "  Ana@EXEMPLO.com ", password: "x" }).email, "ana@exemplo.com");
  });

  test("e-mail inválido ou com mais de 254 caracteres é recusado", () => {
    assert.equal(ForgotPasswordInput.safeParse({ email: "sem-arroba" }).success, false);
    assert.equal(ForgotPasswordInput.safeParse({ email: `${"a".repeat(250)}@x.com` }).success, false);
  });

  test("política de senha: 8 a 128, ao menos 1 letra e 1 número", () => {
    const ok = (password: string) => RegisterInput.safeParse({ email: "a@b.com", password, name: "A" }).success;
    assert.equal(ok("abc12345"), true);
    assert.equal(ok("abc1234"), false); // 7
    assert.equal(ok("abcdefgh"), false); // sem número
    assert.equal(ok("12345678"), false); // sem letra
    assert.equal(ok(`a1${"x".repeat(127)}`), false); // 129
  });

  test("nome: trim, 1 a 80", () => {
    const parse = (name: string) => RegisterInput.safeParse({ email: "a@b.com", password: PASSWORD, name });
    assert.equal(parse("   ").success, false);
    assert.equal(parse("x".repeat(81)).success, false);
    const r = parse("  Ana  ");
    assert.ok(r.success && r.data.name === "Ana");
  });
});

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------

describe("cadastro com confirmação de e-mail", () => {
  test("pedido não cria conta nem sessão; o link cria a conta (argon2id, e-mail normalizado) e abre a sessão", async () => {
    const t = await setup();
    await t.requestRegistration("  Ana@Exemplo.COM ");
    await t.flush();
    assert.equal((await t.db.select().from(users)).length, 0);
    assert.equal((await t.db.select().from(sessionsTable)).length, 0);
    assert.equal(t.verifications.length, 1);
    assert.equal(t.verifications[0].to, "ana@exemplo.com");
    assert.match(t.verifications[0].verifyUrl, /^http:\/\/localhost:3000\/verify-email#token=[A-Za-z0-9_-]{43}$/);

    const { user, session } = await t.registration.verifyEmail({ token: t.verificationToken() });
    assert.equal(user.email, "ana@exemplo.com");
    assert.equal(user.role, "student");
    assert.ok(PublicUser.safeParse(user).success);
    assert.ok(!("passwordHash" in user) && !("password_hash" in user));
    const [row] = await t.db.select().from(users).where(eq(users.id, user.id));
    assert.match(row.passwordHash, /^\$argon2id\$/);
    assert.equal((await t.sessions.validate(session.token))?.user.id, user.id);
    assert.equal(session.expiresAt.getTime() - Date.parse("2026-11-10T12:00:00.000Z"), SESSION_TTL_MS);
    assert.equal((await t.db.select().from(pendingRegistrations)).length, 0);
  });

  test("antes de confirmar, o login falha como credencial inválida", async () => {
    const t = await setup();
    await t.requestRegistration();
    await t.flush();
    await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP }), "INVALID_CREDENTIALS", 401);
    await t.registration.verifyEmail({ token: t.verificationToken() });
    const { user } = await t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP });
    assert.equal(user.email, "ana@exemplo.com");
  });

  test("o banco guarda só o SHA-256 do token de confirmação", async () => {
    const t = await setup();
    await t.requestRegistration();
    await t.flush();
    const [row] = await t.db.select().from(pendingRegistrations);
    assert.equal(row.tokenHash, hashToken(t.verificationToken()));
  });

  test("e-mail que já tem conta: mesma resposta, nenhum link, e o dono recebe um aviso", async () => {
    const t = await setup();
    await t.register("ana@exemplo.com");
    const before = t.verifications.length;
    await t.requestRegistration("ANA@exemplo.com", IP, "outraSenha9");
    await t.flush();
    assert.equal(t.verifications.length, before);
    assert.deepEqual(t.notices, ["ana@exemplo.com"]);
    assert.equal((await t.db.select().from(pendingRegistrations)).length, 0);
    // A senha da conta não mudou.
    await t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP });
  });

  test("cada pedido tem seu link e sua senha; o primeiro confirmado cria a conta e invalida os outros", async () => {
    const t = await setup();
    await t.requestRegistration("ana@exemplo.com", IP, "senhaDoAtacante1", "Atacante");
    await t.requestRegistration("ana@exemplo.com", IP, "senhaDaAna1", "Ana");
    await t.flush();
    const [linkAtacante, linkAna] = t.verifications.map((v) => v.verifyUrl.split("#token=")[1]);

    const { user } = await t.registration.verifyEmail({ token: linkAna });
    assert.equal(user.name, "Ana");
    await t.auth.login({ email: "ana@exemplo.com", password: "senhaDaAna1" }, { ip: IP });
    await rejectsWith(t.registration.verifyEmail({ token: linkAtacante }), "INVALID_VERIFICATION_TOKEN", 400);
    await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: "senhaDoAtacante1" }, { ip: IP }), "INVALID_CREDENTIALS");
  });

  test("link reutilizado, vencido (24 h) ou malformado → 400 INVALID_VERIFICATION_TOKEN", async () => {
    const t = await setup();
    await t.requestRegistration("a@exemplo.com");
    await t.requestRegistration("b@exemplo.com");
    await t.flush();
    const a = t.verificationToken("a@exemplo.com");
    await t.registration.verifyEmail({ token: a });
    await rejectsWith(t.registration.verifyEmail({ token: a }), "INVALID_VERIFICATION_TOKEN", 400);

    t.advance(VERIFICATION_TOKEN_TTL_MS);
    await rejectsWith(t.registration.verifyEmail({ token: t.verificationToken("b@exemplo.com") }), "INVALID_VERIFICATION_TOKEN", 400);
    await rejectsWith(t.registration.verifyEmail({ token: "curto" }), "INVALID_VERIFICATION_TOKEN", 400);
    await rejectsWith(t.registration.verifyEmail({ token: "x".repeat(43) }), "INVALID_VERIFICATION_TOKEN", 400);
  });

  test("pedidos vencidos são apagados no pedido seguinte", async () => {
    const t = await setup();
    await t.requestRegistration("a@exemplo.com");
    await t.flush();
    t.advance(VERIFICATION_TOKEN_TTL_MS + 1);
    await t.requestRegistration("b@exemplo.com");
    await t.flush();
    assert.deepEqual((await t.db.select().from(pendingRegistrations)).map((r) => r.email), ["b@exemplo.com"]);
  });

  test("dois cliques simultâneos no mesmo link: uma conta só", async () => {
    const t = await setup();
    await t.requestRegistration();
    await t.flush();
    const token = t.verificationToken();
    const results = await Promise.allSettled([t.registration.verifyEmail({ token }), t.registration.verifyEmail({ token })]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await t.db.select().from(users)).length, 1);
  });

  test("banco recusa e-mail não normalizado mesmo se a aplicação falhar (CHECK)", async () => {
    const t = await setup();
    await assert.rejects(
      t.client.query("insert into users (email, password_hash, name) values (' Ana@X.com', 'h', 'A')"),
      /users_email_normalized/,
    );
  });

  test("cadastro fechado: 403, exceto para e-mails da allowlist", async () => {
    const t = await setup({ registrationOpen: false, allowlist: ["liberado@exemplo.com"] });
    await rejectsWith(t.requestRegistration("outro@exemplo.com"), "REGISTRATION_CLOSED", 403);
    const { user } = await t.register("Liberado@Exemplo.com");
    assert.equal(user.email, "liberado@exemplo.com");
  });

  test("rate limit: 10 por IP e 3 por e-mail em 15 min → 429 com Retry-After", async () => {
    const t = await setup();
    for (let i = 0; i < 10; i++) await t.requestRegistration(`u${i}@exemplo.com`);
    const err = await rejectsWith(t.requestRegistration("u10@exemplo.com"), "RATE_LIMITED", 429);
    assert.equal(err.retryAfterSeconds, 15 * 60);
    await t.requestRegistration("u10@exemplo.com", "203.0.113.99"); // outro IP passa

    for (let i = 0; i < 3; i++) await t.requestRegistration("alvo@exemplo.com", `198.51.100.${i}`);
    await rejectsWith(t.requestRegistration("alvo@exemplo.com", "198.51.100.99"), "RATE_LIMITED", 429);
  });

  test("falha no envio do link é só logada, sem token no log", async () => {
    const t = await setup({ failingVerificationMail: true });
    await t.requestRegistration();
    await t.flush();
    const [row] = await t.db.select().from(pendingRegistrations);
    assert.ok(t.logged.some((l) => l.includes("register: falha")));
    assert.ok(!t.logged.join("\n").includes(row.tokenHash));
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

describe("login", () => {
  test("credenciais corretas abrem sessão e devolvem o usuário público", async () => {
    const t = await setup();
    await t.register();
    const { user, session } = await t.auth.login({ email: " ANA@exemplo.com", password: PASSWORD }, { ip: IP });
    assert.equal(user.email, "ana@exemplo.com");
    assert.ok(!("passwordHash" in user));
    assert.ok(await t.sessions.validate(session.token));
  });

  test("senha errada e e-mail inexistente: mesmo erro, mesmo status, mesma mensagem", async () => {
    const t = await setup();
    await t.register();
    const wrong = await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: "errada123" }, { ip: IP }), "INVALID_CREDENTIALS", 401);
    const missing = await rejectsWith(t.auth.login({ email: "nao@exemplo.com", password: "errada123" }, { ip: IP }), "INVALID_CREDENTIALS", 401);
    assert.equal(wrong.message, "Credenciais inválidas");
    assert.deepEqual(
      await toErrorResponse(wrong).json(),
      await toErrorResponse(missing).json(),
    );
  });

  test("e-mail inexistente também roda argon2 (hash dummy com os mesmos parâmetros)", async () => {
    const dummy = parseOptions(DUMMY_PASSWORD_HASH);
    assert.equal(dummy.algorithm, PASSWORD_HASH_PARAMS.algorithm);
    assert.equal(dummy.memoryCost, PASSWORD_HASH_PARAMS.memoryCost);
    assert.equal(dummy.timeCost, PASSWORD_HASH_PARAMS.timeCost);
    assert.equal(dummy.parallelism, PASSWORD_HASH_PARAMS.parallelism);

    const t = await setup();
    await t.register();
    const time = async (email: string, i: number) => {
      const start = performance.now();
      await t.auth.login({ email, password: "errada123" }, { ip: `198.51.100.${i}` }).catch(() => {});
      return performance.now() - start;
    };
    const wrong: number[] = [];
    const missing: number[] = [];
    for (let i = 0; i < 4; i++) {
      wrong.push(await time("ana@exemplo.com", i));
      missing.push(await time(`fantasma${i}@exemplo.com`, i + 100));
    }
    const ratio = median(missing) / median(wrong);
    // Sem o dummy o e-mail inexistente seria dezenas de vezes mais rápido; com ele, os tempos ficam próximos.
    assert.ok(ratio > 0.5 && ratio < 2, `tempos muito diferentes: inexistente/errada = ${ratio.toFixed(2)}`);
  });

  test("rate limit por e-mail: 5 em 15 min, mesmo vindo de IPs diferentes", async () => {
    const t = await setup();
    await t.register();
    for (let i = 0; i < 5; i++) {
      await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: "x" }, { ip: `198.51.100.${i}` }), "INVALID_CREDENTIALS");
    }
    // A 6ª é barrada antes de checar a senha, inclusive com a senha certa.
    const err = await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: "198.51.100.50" }), "RATE_LIMITED", 429);
    assert.ok(err.retryAfterSeconds && err.retryAfterSeconds > 0);
    // Chave do limite guarda hash do e-mail, nunca o e-mail.
    const keys = (await t.db.select({ key: rateLimits.key }).from(rateLimits)).map((r) => r.key);
    assert.ok(keys.every((k) => !k.includes("ana@exemplo.com")));
  });

  test("rate limit por IP: 10 em 15 min; a janela reabre depois de 15 min", async () => {
    const t = await setup();
    for (let i = 0; i < 10; i++) {
      await rejectsWith(t.auth.login({ email: `x${i}@exemplo.com`, password: "x" }, { ip: IP }), "INVALID_CREDENTIALS");
    }
    await rejectsWith(t.auth.login({ email: "y@exemplo.com", password: "x" }, { ip: IP }), "RATE_LIMITED", 429);
    t.advance(15 * 60 * 1000 + 1);
    await rejectsWith(t.auth.login({ email: "y@exemplo.com", password: "x" }, { ip: IP }), "INVALID_CREDENTIALS");
  });
});

// ---------------------------------------------------------------------------
// Sessão (/me e logout)
// ---------------------------------------------------------------------------

describe("sessão", () => {
  test("/me: sessão válida devolve o usuário; sem token, token malformado ou desconhecido → null (401)", async () => {
    const t = await setup();
    const { user, session } = await t.register();
    assert.equal((await t.sessions.validate(session.token))?.user.id, user.id);
    assert.equal(await t.sessions.validate(undefined), null);
    assert.equal(await t.sessions.validate("curto"), null);
    assert.equal(await t.sessions.validate("A".repeat(43)), null);
  });

  test("o banco guarda só o SHA-256 do token", async () => {
    const t = await setup();
    const { session } = await t.register();
    const rows = await t.db.select().from(sessionsTable);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].tokenHash, hashToken(session.token));
    assert.notEqual(rows[0].tokenHash, session.token);
  });

  test("expira em 7 dias; renova (sliding) quando resta menos da metade", async () => {
    const t = await setup();
    const { session } = await t.register();

    t.advance(SESSION_TTL_MS / 2 - 60_000); // ainda resta mais da metade
    assert.equal((await t.sessions.validate(session.token))?.renewed, false);

    t.advance(2 * 60_000); // agora resta menos da metade
    const renewed = await t.sessions.validate(session.token);
    assert.equal(renewed?.renewed, true);
    assert.ok(renewed && renewed.expiresAt.getTime() > session.expiresAt.getTime());

    t.advance(SESSION_TTL_MS + 1); // passou da nova validade sem uso
    assert.equal(await t.sessions.validate(session.token), null);
  });

  test("logout revoga a sessão; logout repetido ou de sessão inválida não é erro", async () => {
    const t = await setup();
    const { session } = await t.register();
    await t.auth.logout(session.token);
    assert.equal(await t.sessions.validate(session.token), null);
    await t.auth.logout(session.token);
    await t.auth.logout(undefined);
    await t.auth.logout("lixo");
  });

  test("logout derruba só a sessão atual; revokeAllForUser derruba todas", async () => {
    const t = await setup();
    const { session: a } = await t.register();
    const { session: b } = await t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP });
    await t.auth.logout(a.token);
    assert.ok(await t.sessions.validate(b.token));

    const { session: c } = await t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP });
    const userId = (await t.sessions.validate(c.token))!.user.id;
    await t.sessions.revokeAllForUser(userId);
    assert.equal(await t.sessions.validate(b.token), null);
    assert.equal(await t.sessions.validate(c.token), null);
  });

  test("apagar o usuário apaga as sessões (cascade)", async () => {
    const t = await setup();
    const { user, session } = await t.register();
    await t.db.delete(users).where(eq(users.id, user.id));
    assert.equal(await t.sessions.validate(session.token), null);
    assert.equal((await t.db.select().from(sessionsTable)).length, 0);
  });

  test("cookie: __Host-session + Secure em produção; session sem Secure em dev; sempre httpOnly/Lax/Path=/", () => {
    const exp = new Date();
    assert.equal(sessionCookieName(true), "__Host-session");
    assert.equal(sessionCookieName(false), "session");
    assert.deepEqual(sessionCookieOptions(true, exp), { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: exp });
    assert.equal(sessionCookieOptions(false, exp).secure, false);
    assert.ok(!("domain" in sessionCookieOptions(true, exp)));
  });
});

// ---------------------------------------------------------------------------
// Recuperação de senha
// ---------------------------------------------------------------------------

describe("recuperação de senha", () => {
  test("fluxo completo: pedido → e-mail → troca da senha → todas as sessões revogadas", async () => {
    const t = await setup();
    const { session: s1 } = await t.register();
    const { session: s2 } = await t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP });

    await t.reset.requestReset({ email: "ANA@exemplo.com" }, { ip: IP });
    await t.flush();
    assert.equal(t.sent.length, 1);
    assert.equal(t.sent[0].to, "ana@exemplo.com");
    assert.match(t.sent[0].resetUrl, /^http:\/\/localhost:3000\/reset-password#token=[A-Za-z0-9_-]{43}$/);

    const token = t.tokenFromMail();
    const [stored] = await t.db.select().from(passwordResetTokens);
    assert.equal(stored.tokenHash, hashToken(token)); // só o hash no banco
    assert.equal(stored.expiresAt.getTime() - Date.parse("2026-11-10T12:00:00.000Z"), RESET_TOKEN_TTL_MS);

    await t.reset.resetPassword({ token, password: "novaSenha99" });

    assert.equal(await t.sessions.validate(s1.token), null);
    assert.equal(await t.sessions.validate(s2.token), null);
    await rejectsWith(t.auth.login({ email: "ana@exemplo.com", password: PASSWORD }, { ip: IP }), "INVALID_CREDENTIALS");
    await t.auth.login({ email: "ana@exemplo.com", password: "novaSenha99" }, { ip: IP });
    const [used] = await t.db.select().from(passwordResetTokens);
    assert.ok(used.usedAt);
  });

  test("e-mail inexistente: mesma resposta, nenhum e-mail, nenhum token", async () => {
    const t = await setup();
    await t.register();
    const existing = await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    const missing = await t.reset.requestReset({ email: "ninguem@exemplo.com" }, { ip: IP });
    assert.equal(existing, missing); // ambos void
    await t.flush();
    assert.equal(t.sent.length, 1);
    assert.equal((await t.db.select().from(passwordResetTokens)).length, 1);
  });

  test("a resposta não espera o envio; falha no e-mail é só logada", async () => {
    const t = await setup({ failingMailer: true });
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP }); // não lança
    await t.flush();
    assert.ok(t.logged.some((l) => l.includes("password-reset: falha") && l.includes("SMTP fora do ar")));
  });

  test("token reutilizado → 400 INVALID_RESET_TOKEN", async () => {
    const t = await setup();
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    const token = t.tokenFromMail();
    await t.reset.resetPassword({ token, password: "novaSenha99" });
    await rejectsWith(t.reset.resetPassword({ token, password: "outra12345" }), "INVALID_RESET_TOKEN", 400);
  });

  test("token expirado (30 min) → 400 INVALID_RESET_TOKEN", async () => {
    const t = await setup();
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    t.advance(RESET_TOKEN_TTL_MS + 1);
    await rejectsWith(t.reset.resetPassword({ token: t.tokenFromMail(), password: "novaSenha99" }), "INVALID_RESET_TOKEN", 400);
  });

  test("token inválido ou malformado → mesma resposta 400", async () => {
    const t = await setup();
    const a = await rejectsWith(t.reset.resetPassword({ token: "x", password: "novaSenha99" }), "INVALID_RESET_TOKEN", 400);
    const b = await rejectsWith(t.reset.resetPassword({ token: "B".repeat(43), password: "novaSenha99" }), "INVALID_RESET_TOKEN", 400);
    assert.equal(a.message, b.message);
  });

  test("novo pedido invalida os tokens anteriores", async () => {
    const t = await setup();
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    const first = t.tokenFromMail(0);
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    const second = t.tokenFromMail(1);
    await rejectsWith(t.reset.resetPassword({ token: first, password: "novaSenha99" }), "INVALID_RESET_TOKEN");
    await t.reset.resetPassword({ token: second, password: "novaSenha99" });
  });

  test("dois resets simultâneos com o mesmo token: só um passa", async () => {
    const t = await setup();
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    const token = t.tokenFromMail();
    const results = await Promise.allSettled([
      t.reset.resetPassword({ token, password: "primeira123" }),
      t.reset.resetPassword({ token, password: "segunda123" }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  });

  test("rate limit: 3 por e-mail e 5 por IP em 15 min → 429 (igual exista ou não o e-mail)", async () => {
    const t = await setup();
    for (let i = 0; i < 3; i++) await t.reset.requestReset({ email: "ninguem@exemplo.com" }, { ip: `198.51.100.${i}` });
    await rejectsWith(t.reset.requestReset({ email: "ninguem@exemplo.com" }, { ip: "198.51.100.9" }), "RATE_LIMITED", 429);

    for (let i = 0; i < 5; i++) await t.reset.requestReset({ email: `n${i}@exemplo.com` }, { ip: IP });
    await rejectsWith(t.reset.requestReset({ email: "n9@exemplo.com" }, { ip: IP }), "RATE_LIMITED", 429);
  });

  test("tokens não aparecem no log (falha do mailer)", async () => {
    const t = await setup({ failingMailer: true });
    await t.register();
    await t.reset.requestReset({ email: "ana@exemplo.com" }, { ip: IP });
    await t.flush();
    const [row] = await t.db.select().from(passwordResetTokens);
    assert.ok(t.logged.every((l) => !l.includes(row.tokenHash) && !/[A-Za-z0-9_-]{43}/.test(l)));
  });
});

// ---------------------------------------------------------------------------
// Rate limiter e tutor
// ---------------------------------------------------------------------------

describe("e-mail", () => {
  const noop: Logger = { info() {}, warn() {}, error() {} };

  test("escolha do serviço: ACS quando configurado; senão Disabled em produção e Console em dev", () => {
    const acs = { acsConnectionString: "endpoint=https://x.communication.azure.com/;accesskey=a2V5", mailFrom: "DoNotReply@x.azurecomm.net" };
    assert.ok(createMailService(true, noop, acs) instanceof AcsMailService);
    assert.ok(createMailService(false, noop, acs) instanceof AcsMailService);
    assert.ok(createMailService(true, noop, { acsConnectionString: acs.acsConnectionString }) instanceof DisabledMailService);
    assert.ok(createMailService(true, noop) instanceof DisabledMailService);
    assert.ok(createMailService(false, noop) instanceof ConsoleMailService);
  });

  test("mensagem: link, validade em horário de Brasília e nome escapado no HTML", () => {
    const resetUrl = "https://app.exemplo.com/reset-password#token=abc";
    const msg = passwordResetMessage({
      to: "a@b.com",
      name: '<img src=x onerror="alert(1)">',
      resetUrl,
      expiresAt: new Date("2026-11-10T12:30:00.000Z"),
    });
    assert.ok(msg.plainText.includes(resetUrl));
    assert.ok(msg.html.includes(`href="${resetUrl}"`));
    assert.ok(msg.plainText.includes("09:30"));
    assert.ok(!msg.html.includes("<img"));
    assert.ok(msg.html.includes("&lt;img"));
  });

  test("confirmação e aviso de conta existente: links presentes e nome escapado", () => {
    const verifyUrl = "https://app.exemplo.com/verify-email#token=abc";
    const v = emailVerificationMessage({ to: "a@b.com", name: "<b>x</b>", verifyUrl, expiresAt: new Date("2026-11-11T12:00:00.000Z") });
    assert.ok(v.plainText.includes(verifyUrl) && v.html.includes(`href="${verifyUrl}"`));
    assert.ok(v.plainText.includes("11/11") && v.plainText.includes("09:00"));
    assert.ok(!v.html.includes("<b>x"));
    const e = accountExistsMessage({ to: "a@b.com", name: "Ana", loginUrl: "https://x/login", forgotUrl: "https://x/forgot-password" });
    assert.ok(e.html.includes('href="https://x/login"') && e.html.includes('href="https://x/forgot-password"'));
  });
});

describe("rate limiter", () => {
  test("janela fixa: conta, bloqueia acima do limite e reabre ao vencer", async () => {
    const t = await setup();
    const rule = { name: "teste", limit: 2, windowMs: 60_000 };
    assert.equal((await t.rateLimiter.consume(rule, "s")).allowed, true);
    assert.equal((await t.rateLimiter.consume(rule, "s")).allowed, true);
    const blocked = await t.rateLimiter.consume(rule, "s");
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 60);
    t.advance(30_000);
    assert.equal((await t.rateLimiter.consume(rule, "s")).retryAfterSeconds, 30);
    t.advance(30_000);
    assert.equal((await t.rateLimiter.consume(rule, "s")).allowed, true);
    assert.equal((await t.rateLimiter.consume(rule, "outro")).allowed, true); // chaves independentes
  });

  test("tutor: limite por usuário configurado", () => {
    assert.ok(RATE_LIMITS.tutorUser.limit > 0 && RATE_LIMITS.tutorUser.windowMs > 0);
  });

  test("execução remota (/api/run): 30 por usuário em 15 min, cada usuário com seu balde", async () => {
    const t = await setup();
    const rule = RATE_LIMITS.runUser;
    for (let i = 0; i < 30; i++) await enforceRateLimits(t.rateLimiter, [[rule, "user-a"]]);
    const err = await rejectsWith(enforceRateLimits(t.rateLimiter, [[rule, "user-a"]]), "RATE_LIMITED", 429);
    assert.ok(err.retryAfterSeconds! > 0 && err.retryAfterSeconds! <= 15 * 60);
    await enforceRateLimits(t.rateLimiter, [[rule, "user-b"]]);
    t.advance(15 * 60 * 1000);
    await enforceRateLimits(t.rateLimiter, [[rule, "user-a"]]);
  });
});

// ---------------------------------------------------------------------------
// Camada HTTP compartilhada
// ---------------------------------------------------------------------------

describe("camada HTTP", () => {
  const post = (headers: Record<string, string>, body = "{}") =>
    new Request("http://localhost:3000/api/auth/login", { method: "POST", headers, body });

  test("formato único de erro e Retry-After no 429", async () => {
    const res = toErrorResponse(new AppError("RATE_LIMITED", 429, "Muitas tentativas.", undefined, 120));
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "120");
    assert.deepEqual(await res.json(), { error: { code: "RATE_LIMITED", message: "Muitas tentativas." } });
  });

  test("erro inesperado vira 500 genérico, sem detalhe na resposta", async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const res = toErrorResponse(new Error("senha do banco: hunter2"));
      assert.equal(res.status, 500);
      const body = await res.json();
      assert.equal(body.error.code, "INTERNAL");
      assert.ok(!JSON.stringify(body).includes("hunter2"));
    } finally {
      console.error = original;
    }
  });

  test("validação: 400 com details por campo; 415 sem JSON; 400 com JSON malformado", async () => {
    const invalid = await parseJson(post({ "content-type": "application/json" }, '{"email":"x"}'), LoginInput).catch((e: unknown) => e);
    assert.ok(AppError.is(invalid) && invalid.status === 400 && invalid.code === "VALIDATION_FAILED");
    const details = invalid.details as Record<string, string[]>;
    assert.ok(details.email?.length && details.password?.length);

    const noJson = await parseJson(post({ "content-type": "text/plain" }), LoginInput).catch((e: unknown) => e);
    assert.ok(AppError.is(noJson) && noJson.status === 415);

    const broken = await parseJson(post({ "content-type": "application/json" }, "{"), LoginInput).catch((e: unknown) => e);
    assert.ok(AppError.is(broken) && broken.status === 400 && broken.code === "BAD_REQUEST");
  });

  test("CSRF: Origin igual a APP_URL passa; ausente, 'null' ou diferente → 403", () => {
    assertSameOrigin(post({ origin: "http://localhost:3000" }));
    for (const origin of [undefined, "null", "https://evil.com", "http://localhost:3000.evil.com", "http://localhost:3001"]) {
      const headers: Record<string, string> = origin ? { origin } : {};
      assert.throws(() => assertSameOrigin(post(headers)), (e: unknown) => AppError.is(e) && e.status === 403);
    }
    // GET não é mutante: não exige Origin.
    assertSameOrigin(new Request("http://localhost:3000/api/auth/me"));
    assert.equal(isAllowedOrigin("http://LOCALHOST:3000", "http://localhost:3000"), true);
  });

  test("IP do cliente: primeiro item do x-forwarded-for; ausente ou inválido → 'unknown'", () => {
    const h = (v?: string) => new Headers(v ? { "x-forwarded-for": v } : {});
    assert.equal(getClientIp(h("203.0.113.7, 10.0.0.1")), "203.0.113.7");
    assert.equal(getClientIp(h("2001:db8::1")), "2001:db8::1");
    assert.equal(getClientIp(h()), "unknown");
    assert.equal(getClientIp(h("não-é-ip")), "unknown");
  });
});
