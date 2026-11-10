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
import { passwordResetTokens, rateLimits, sessions as sessionsTable, users } from "../src/server/db/schema/auth.ts";
import {
  AuthService,
  PasswordResetService,
  PostgresRateLimiter,
  RATE_LIMITS,
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

async function setup(opts: { registrationOpen?: boolean; allowlist?: string[]; failingMailer?: boolean } = {}) {
  const client = new PGlite();
  await migratePglite(client);
  const db = drizzle(client) as unknown as AuthDb;

  let now = new Date("2026-11-10T12:00:00.000Z");
  const clock = () => now;
  const advance = (ms: number) => {
    now = new Date(now.getTime() + ms);
  };

  const sent: SentMail[] = [];
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
  };
  const pending: Promise<void>[] = [];
  const flush = async () => {
    while (pending.length) await pending.shift();
  };

  const sessions = new SessionService(db, clock);
  const rateLimiter = new PostgresRateLimiter(db, clock);
  const auth = new AuthService({
    db,
    sessions,
    rateLimiter,
    registration: { open: opts.registrationOpen ?? true, allowlist: opts.allowlist ?? [] },
  });
  const reset = new PasswordResetService({
    db,
    sessions,
    rateLimiter,
    mailer,
    logger,
    appUrl: "http://localhost:3000",
    defer: (job) => void pending.push(job()),
    clock,
  });

  const register = (email = "ana@exemplo.com", ip = IP) =>
    auth.register(RegisterInput.parse({ email, password: PASSWORD, name: "Ana" }), { ip });
  const tokenFromMail = (i = sent.length - 1) => sent[i].resetUrl.split("#token=")[1];

  return { db, client, auth, reset, sessions, rateLimiter, sent, logged, flush, advance, register, tokenFromMail };
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

describe("cadastro", () => {
  test("cria a conta com hash argon2id, e-mail normalizado e já abre sessão", async () => {
    const t = await setup();
    const { user, session } = await t.register("  Ana@Exemplo.COM ");

    assert.equal(user.email, "ana@exemplo.com");
    assert.equal(user.role, "student");
    assert.ok(PublicUser.safeParse(user).success);
    assert.ok(!("passwordHash" in user) && !("password_hash" in user));

    const [row] = await t.db.select().from(users).where(eq(users.id, user.id));
    assert.match(row.passwordHash, /^\$argon2id\$/);
    assert.notEqual(row.passwordHash, PASSWORD);

    const validated = await t.sessions.validate(session.token);
    assert.equal(validated?.user.id, user.id);
    assert.equal(session.expiresAt.getTime() - Date.parse("2026-11-10T12:00:00.000Z"), SESSION_TTL_MS);
  });

  test("e-mail já cadastrado (em qualquer caixa) → 409 EMAIL_IN_USE", async () => {
    const t = await setup();
    await t.register("ana@exemplo.com");
    await rejectsWith(t.register("ANA@exemplo.com"), "EMAIL_IN_USE", 409);
  });

  test("cadastros simultâneos do mesmo e-mail: um passa, o outro 409 (índice unique)", async () => {
    const t = await setup();
    const results = await Promise.allSettled([t.register("dup@exemplo.com"), t.register("dup@exemplo.com")]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const failed = results.find((r) => r.status === "rejected");
    assert.ok(failed && failed.status === "rejected" && AppError.is(failed.reason) && failed.reason.code === "EMAIL_IN_USE");
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
    await rejectsWith(t.register("outro@exemplo.com"), "REGISTRATION_CLOSED", 403);
    const { user } = await t.register("Liberado@Exemplo.com");
    assert.equal(user.email, "liberado@exemplo.com");
  });

  test("rate limit: 10 por IP em 15 min → 429 com Retry-After", async () => {
    const t = await setup();
    for (let i = 0; i < 10; i++) await t.register(`u${i}@exemplo.com`);
    const err = await rejectsWith(t.register("u10@exemplo.com"), "RATE_LIMITED", 429);
    assert.equal(err.retryAfterSeconds, 15 * 60);
    await t.register("u10@exemplo.com", "203.0.113.99"); // outro IP passa
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
