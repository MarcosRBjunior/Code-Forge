import { eq, inArray } from "drizzle-orm";
import { passwordResetTokens, pendingRegistrations, rateLimits, sessions, users } from "@/server/db/schema/auth";
import {
  activityDays,
  chapterProgress,
  drafts,
  highlights,
  mockInterviews,
  notes,
  reviewCards,
  stars,
} from "@/server/db/schema/study";
import type { ChangePasswordInput, DeleteAccountInput } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { hashPassword, verifyPassword } from "./password";
import { emailSubject, enforceRateLimits, RATE_LIMITS, type RateLimiter, type RateLimitRule } from "./rate-limit";
import type { SessionService } from "./session-service";
import type { AuthDb } from "./deps";

export interface AccountServiceDeps {
  db: AuthDb;
  sessions: SessionService;
  rateLimiter: RateLimiter;
}

/** Quem está agindo: o usuário da sessão e a própria sessão (a que continua aberta na troca de senha). */
export interface AccountActor {
  userId: string;
  sessionId: string;
}

/**
 * Tabelas de estudo com user_id. Ao criar uma tabela por usuário, inclua-a aqui: o teste de exclusão de conta
 * percorre TODAS as colunas user_id do banco e falha se sobrar alguma linha do usuário apagado.
 * (As FKs também são ON DELETE CASCADE; a lista explícita não depende disso.)
 * notes vem antes de highlights para não disparar o SET NULL da FK composta à toa.
 */
export const STUDY_TABLES = [notes, highlights, chapterProgress, stars, drafts, mockInterviews, reviewCards, activityDays] as const;

/** Chaves de rate limit ligadas a esta pessoa: as por usuário (id) e as por e-mail (hash do e-mail). */
export function personalRateLimitKeys(userId: string, email: string): string[] {
  const rules: RateLimitRule[] = Object.values(RATE_LIMITS);
  return rules.flatMap((r) =>
    r.name.endsWith(":user") ? [`${r.name}:${userId}`] : r.name.endsWith(":email") ? [`${r.name}:${emailSubject(email)}`] : [],
  );
}

/** Página de conta: troca de senha e exclusão da conta, sempre com a senha atual. */
export class AccountService {
  constructor(private readonly deps: AccountServiceDeps) {}

  /**
   * Confere a senha atual, grava a nova, encerra as OUTRAS sessões (a atual continua) e invalida links de
   * redefinição pendentes. Senha atual errada: 400 WRONG_PASSWORD.
   */
  async changePassword(actor: AccountActor, input: ChangePasswordInput): Promise<void> {
    const { db, sessions } = this.deps;
    const user = await this.verifiedUser(actor.userId, input.currentPassword, RATE_LIMITS.changePasswordUser);
    if (input.newPassword === input.currentPassword) throw Errors.unprocessable("A nova senha precisa ser diferente da atual.");

    const passwordHash = await hashPassword(input.newPassword);
    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
      await sessions.revokeOthersForUser(user.id, actor.sessionId, tx);
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    });
  }

  /**
   * Apaga a conta e TODOS os dados ligados a ela, numa transação: dados de estudo, sessões, links de redefinição,
   * cadastros pendentes do mesmo e-mail e as chaves de rate limit da pessoa. Senha errada: 400 WRONG_PASSWORD.
   */
  async deleteAccount(actor: AccountActor, input: DeleteAccountInput): Promise<void> {
    const { db } = this.deps;
    const user = await this.verifiedUser(actor.userId, input.password, RATE_LIMITS.deleteAccountUser);

    await db.transaction(async (tx) => {
      for (const table of STUDY_TABLES) await tx.delete(table).where(eq(table.userId, user.id));
      await tx.delete(sessions).where(eq(sessions.userId, user.id));
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      await tx.delete(pendingRegistrations).where(eq(pendingRegistrations.email, user.email));
      await tx.delete(rateLimits).where(inArray(rateLimits.key, personalRateLimitKeys(user.id, user.email)));
      await tx.delete(users).where(eq(users.id, user.id));
    });
  }

  /** Aplica o limite por usuário e confere a senha. Usuário sumido (sessão de conta já apagada): 401. */
  private async verifiedUser(userId: string, password: string, rule: RateLimitRule) {
    const { db, rateLimiter } = this.deps;
    await enforceRateLimits(rateLimiter, [[rule, userId]]);
    const [user] = await db
      .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw Errors.unauthenticated();
    if (!(await verifyPassword(user.passwordHash, password))) throw Errors.wrongPassword();
    return user;
  }
}
