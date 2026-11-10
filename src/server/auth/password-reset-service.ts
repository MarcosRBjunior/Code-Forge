import { and, eq, gt, isNull } from "drizzle-orm";
import { passwordResetTokens, users } from "@/server/db/schema/auth";
import type { ForgotPasswordInput, ResetPasswordInput } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { hashPassword } from "./password";
import { emailSubject, enforceRateLimits, RATE_LIMITS, type RateLimiter } from "./rate-limit";
import type { SessionService } from "./session-service";
import { generateToken, hashToken, isWellFormedToken } from "./tokens";
import { normalizeEmail } from "./users";
import type { MailService } from "./mail";
import { systemClock, type AuthDb, type Clock, type Defer, type Logger } from "./deps";
import type { RequestContext } from "./auth-service";

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface PasswordResetServiceDeps {
  db: AuthDb;
  sessions: SessionService;
  rateLimiter: RateLimiter;
  mailer: MailService;
  logger: Logger;
  /** Origem pública (APP_URL) para montar o link. */
  appUrl: string;
  defer: Defer;
  clock?: Clock;
}

export class PasswordResetService {
  private readonly clock: Clock;

  constructor(private readonly deps: PasswordResetServiceDeps) {
    this.clock = deps.clock ?? systemClock;
  }

  /**
   * Resposta e tempo iguais exista ou não o e-mail: depois do rate limit (que vale igual para os dois casos),
   * a busca do usuário, a criação do token e o envio rodam em segundo plano (`defer`), com erro só logado.
   */
  async requestReset(input: ForgotPasswordInput, ctx: RequestContext): Promise<void> {
    const email = normalizeEmail(input.email);
    await enforceRateLimits(this.deps.rateLimiter, [
      [RATE_LIMITS.forgotIp, ctx.ip],
      [RATE_LIMITS.forgotEmail, emailSubject(email)],
    ]);
    this.deps.defer(() =>
      this.issueAndSend(email).catch((err: unknown) => {
        this.deps.logger.error("password-reset: falha ao emitir ou enviar", { error: describe(err) });
      }),
    );
  }

  private async issueAndSend(email: string): Promise<void> {
    const { db, mailer, appUrl } = this.deps;
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) return;

    const token = generateToken();
    const expiresAt = new Date(this.clock().getTime() + RESET_TOKEN_TTL_MS);
    await db.transaction(async (tx) => {
      // Um pedido novo invalida os anteriores: só o último link funciona.
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash: hashToken(token), expiresAt });
    });

    // O token vai no fragmento (#): não aparece em logs de servidor/proxy nem no Referer.
    const resetUrl = `${appUrl}/reset-password#token=${token}`;
    await mailer.sendPasswordReset({ to: user.email, name: user.name, resetUrl, expiresAt });
  }

  /** Troca a senha, consome o token e revoga TODAS as sessões. Qualquer falha de token: 400 INVALID_RESET_TOKEN. */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { db, sessions } = this.deps;
    if (!isWellFormedToken(input.token)) throw Errors.invalidResetToken();
    const tokenHash = hashToken(input.token);
    const now = this.clock();
    const valid = and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    );

    // Checagem barata antes do argon2, para token inválido não custar CPU.
    const [candidate] = await db.select({ id: passwordResetTokens.id }).from(passwordResetTokens).where(valid).limit(1);
    if (!candidate) throw Errors.invalidResetToken();
    const passwordHash = await hashPassword(input.password);

    await db.transaction(async (tx) => {
      // Consumo atômico: de dois pedidos simultâneos com o mesmo token, só um passa.
      const [claimed] = await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(valid)
        .returning({ userId: passwordResetTokens.userId });
      if (!claimed) throw Errors.invalidResetToken();

      await tx.update(users).set({ passwordHash }).where(eq(users.id, claimed.userId));
      await sessions.revokeAllForUser(claimed.userId, tx);
    });
  }
}

/** Só nome e mensagem do erro: nada de objetos que possam carregar dados sensíveis. */
function describe(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : "erro desconhecido";
}
