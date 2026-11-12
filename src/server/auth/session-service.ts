import { and, eq, gt, lt, ne } from "drizzle-orm";
import { sessions, users, type User } from "@/server/db/schema/auth";
import { SESSION_TTL_MS } from "./cookie";
import { generateToken, hashToken, isWellFormedToken } from "./tokens";
import { systemClock, type AuthDb, type Clock } from "./deps";

/** last_used_at é atualizado no máximo a cada 5 min (evita uma escrita por requisição). */
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "createdAt">;

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

export interface ValidatedSession {
  user: SessionUser;
  sessionId: string;
  expiresAt: Date;
  /** true quando a validade foi estendida (sliding): o handler deve reenviar o cookie. */
  renewed: boolean;
}

export class SessionService {
  constructor(
    private readonly db: AuthDb,
    private readonly clock: Clock = systemClock,
  ) {}

  async create(userId: string, db: AuthDb = this.db): Promise<IssuedSession> {
    const token = generateToken();
    const now = this.clock();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt, lastUsedAt: now });
    return { token, expiresAt };
  }

  /** Sessão válida e não expirada, com renovação quando resta menos da metade da validade. */
  async validate(token: string | undefined | null): Promise<ValidatedSession | null> {
    if (!isWellFormedToken(token)) return null;
    const now = this.clock();

    const [row] = await this.db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        lastUsedAt: sessions.lastUsedAt,
        user: { id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt },
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
      .limit(1);
    if (!row) return null;

    const renewed = row.expiresAt.getTime() - now.getTime() < SESSION_TTL_MS / 2;
    const stale = now.getTime() - row.lastUsedAt.getTime() > TOUCH_INTERVAL_MS;
    const expiresAt = renewed ? new Date(now.getTime() + SESSION_TTL_MS) : row.expiresAt;
    if (renewed || stale) {
      await this.db.update(sessions).set({ expiresAt, lastUsedAt: now }).where(eq(sessions.id, row.sessionId));
    }
    return { user: row.user, sessionId: row.sessionId, expiresAt, renewed };
  }

  /** Revoga a sessão do token. Token desconhecido, expirado ou malformado não é erro. */
  async revoke(token: string | undefined | null): Promise<void> {
    if (!isWellFormedToken(token)) return;
    await this.db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  /** Revoga todas as sessões do usuário (reset de senha). Aceita uma transação. */
  async revokeAllForUser(userId: string, db: AuthDb = this.db): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  /** Revoga as sessões do usuário, menos a indicada (troca de senha com a sessão aberta). Aceita uma transação. */
  async revokeOthersForUser(userId: string, keepSessionId: string, db: AuthDb = this.db): Promise<void> {
    await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.id, keepSessionId)));
  }

  /** Limpeza de sessões expiradas (job periódico). */
  async purgeExpired(): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, this.clock()));
  }
}
