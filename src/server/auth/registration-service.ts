import { and, eq, gt, lte } from "drizzle-orm";
import { pendingRegistrations, users } from "@/server/db/schema/auth";
import type { RegisterInput, VerifyEmailInput } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { hashPassword } from "./password";
import { emailSubject, enforceRateLimits, RATE_LIMITS, type RateLimiter } from "./rate-limit";
import type { SessionService } from "./session-service";
import { generateToken, hashToken, isWellFormedToken } from "./tokens";
import { isUniqueViolation, normalizeEmail, toPublicUser } from "./users";
import type { MailService } from "./mail";
import { systemClock, type AuthDb, type Clock, type Defer, type Logger } from "./deps";
import type { AuthResult, RegistrationPolicy, RequestContext } from "./auth-service";

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export interface RegistrationServiceDeps {
  db: AuthDb;
  sessions: SessionService;
  rateLimiter: RateLimiter;
  registration: RegistrationPolicy;
  mailer: MailService;
  logger: Logger;
  /** Origem pública (APP_URL) para montar os links. */
  appUrl: string;
  defer: Defer;
  clock?: Clock;
}

/**
 * Cadastro com confirmação de e-mail.
 *
 * 1. register: valida, aplica os limites e a política, calcula o hash da senha e responde SEMPRE igual
 *    ("enviamos um link"). Em segundo plano: se o e-mail já tem conta, avisa o dono; senão grava um cadastro
 *    pendente e manda o link de confirmação. Assim a API não revela quais e-mails têm conta.
 * 2. verifyEmail: o link cria a conta com o nome e a senha DAQUELE pedido e já abre a sessão.
 *
 * A conta não existe antes da confirmação: ninguém consegue "reservar" o e-mail de outra pessoa nem ativar,
 * pela caixa de entrada dela, uma conta com uma senha que ela não escolheu.
 */
export class RegistrationService {
  private readonly clock: Clock;

  constructor(private readonly deps: RegistrationServiceDeps) {
    this.clock = deps.clock ?? systemClock;
  }

  async register(input: RegisterInput, ctx: RequestContext): Promise<void> {
    const { rateLimiter, registration } = this.deps;
    const email = normalizeEmail(input.email);

    await enforceRateLimits(rateLimiter, [
      [RATE_LIMITS.registerIp, ctx.ip],
      [RATE_LIMITS.registerEmail, emailSubject(email)],
    ]);
    if (!registration.open && !registration.allowlist.includes(email)) throw Errors.registrationClosed();

    // O argon2 roda sempre, antes de saber se o e-mail existe: o tempo de resposta não denuncia contas.
    const passwordHash = await hashPassword(input.password);
    const name = input.name.trim();
    this.deps.defer(() =>
      this.issueAndSend(email, name, passwordHash).catch((err: unknown) => {
        this.deps.logger.error("register: falha ao emitir ou enviar", { error: describe(err) });
      }),
    );
  }

  private async issueAndSend(email: string, name: string, passwordHash: string): Promise<void> {
    const { db, mailer, appUrl } = this.deps;
    const now = this.clock();

    const [existing] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      await mailer.sendAccountExists({ to: existing.email, name: existing.name, loginUrl: `${appUrl}/login`, forgotUrl: `${appUrl}/forgot-password` });
      return;
    }

    const token = generateToken();
    const expiresAt = new Date(now.getTime() + VERIFICATION_TOKEN_TTL_MS);
    await db.transaction(async (tx) => {
      await tx.delete(pendingRegistrations).where(lte(pendingRegistrations.expiresAt, now));
      await tx.insert(pendingRegistrations).values({ email, name, passwordHash, tokenHash: hashToken(token), expiresAt });
    });

    // O token vai no fragmento (#): não aparece em logs de servidor/proxy nem no Referer.
    await mailer.sendEmailVerification({ to: email, name, verifyUrl: `${appUrl}/verify-email#token=${token}`, expiresAt });
  }

  /** Consome o link, cria a conta e abre a sessão. Link inválido, vencido, usado ou de e-mail que já tem conta: 400. */
  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    const { db, sessions } = this.deps;
    if (!isWellFormedToken(input.token)) throw Errors.invalidVerificationToken();
    const now = this.clock();

    try {
      return await db.transaction(async (tx) => {
        // Consumo atômico: de dois cliques simultâneos no mesmo link, só um encontra a linha.
        const [pending] = await tx
          .delete(pendingRegistrations)
          .where(and(eq(pendingRegistrations.tokenHash, hashToken(input.token)), gt(pendingRegistrations.expiresAt, now)))
          .returning();
        if (!pending) throw Errors.invalidVerificationToken();

        const [user] = await tx
          .insert(users)
          .values({ email: pending.email, name: pending.name, passwordHash: pending.passwordHash })
          .returning();
        // Os outros pedidos para o mesmo e-mail perdem o sentido.
        await tx.delete(pendingRegistrations).where(eq(pendingRegistrations.email, pending.email));
        const session = await sessions.create(user.id, tx);
        return { user: toPublicUser(user), session };
      });
    } catch (err) {
      // Outro link do mesmo e-mail já criou a conta: este não vale mais.
      if (isUniqueViolation(err)) throw Errors.invalidVerificationToken();
      throw err;
    }
  }
}

/** Só nome e mensagem do erro: nada de objetos que possam carregar dados sensíveis. */
function describe(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : "erro desconhecido";
}
