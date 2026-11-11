import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema/auth";
import type { LoginInput, PublicUser } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password";
import { emailSubject, enforceRateLimits, RATE_LIMITS, type RateLimiter } from "./rate-limit";
import type { IssuedSession, SessionService } from "./session-service";
import { normalizeEmail, toPublicUser } from "./users";
import type { AuthDb } from "./deps";

export interface RegistrationPolicy {
  open: boolean;
  /** E-mails normalizados liberados mesmo com o cadastro fechado. */
  allowlist: readonly string[];
}

export interface RequestContext {
  ip: string;
}

export interface AuthResult {
  user: PublicUser;
  session: IssuedSession;
}

export interface AuthServiceDeps {
  db: AuthDb;
  sessions: SessionService;
  rateLimiter: RateLimiter;
}

/** Login e logout. O cadastro (com confirmação de e-mail) fica no RegistrationService. */
export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  /** Mesma resposta (401 "Credenciais inválidas") e mesmo custo para e-mail inexistente e senha errada. */
  async login(input: LoginInput, ctx: RequestContext): Promise<AuthResult> {
    const { db, sessions, rateLimiter } = this.deps;
    const email = normalizeEmail(input.email);

    await enforceRateLimits(rateLimiter, [
      [RATE_LIMITS.loginIp, ctx.ip],
      [RATE_LIMITS.loginEmail, emailSubject(email)],
    ]);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // Sempre roda um argon2 verify: contra o hash real ou contra o dummy.
    const ok = await verifyPassword(user?.passwordHash ?? DUMMY_PASSWORD_HASH, input.password);
    if (!user || !ok) throw Errors.invalidCredentials();

    const session = await sessions.create(user.id);
    return { user: toPublicUser(user), session };
  }

  async logout(token: string | undefined | null): Promise<void> {
    await this.deps.sessions.revoke(token);
  }
}
