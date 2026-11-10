import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema/auth";
import type { LoginInput, PublicUser, RegisterInput } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "./password";
import { emailSubject, enforceRateLimits, RATE_LIMITS, type RateLimiter } from "./rate-limit";
import type { IssuedSession, SessionService } from "./session-service";
import { isUniqueViolation, normalizeEmail, toPublicUser } from "./users";
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
  registration: RegistrationPolicy;
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  /**
   * Cria a conta e já abre a sessão.
   *
   * E-mail já cadastrado responde 409 EMAIL_IN_USE, o que permite descobrir se um e-mail tem conta.
   * Decisão consciente de MVP: sem verificação de e-mail, uma resposta genérica deixaria o usuário sem saída.
   * Mitigação: rate limit por IP. EVOLUÇÃO: verificação de e-mail (responder sempre "enviamos um link" e
   * avisar por e-mail o dono de uma conta existente), o que elimina essa enumeração.
   */
  async register(input: RegisterInput, ctx: RequestContext): Promise<AuthResult> {
    const { db, sessions, rateLimiter, registration } = this.deps;
    const email = normalizeEmail(input.email);

    await enforceRateLimits(rateLimiter, [[RATE_LIMITS.registerIp, ctx.ip]]);
    if (!registration.open && !registration.allowlist.includes(email)) throw Errors.registrationClosed();

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) throw Errors.emailInUse();

    const passwordHash = await hashPassword(input.password);
    try {
      return await db.transaction(async (tx) => {
        const [user] = await tx.insert(users).values({ email, name: input.name.trim(), passwordHash }).returning();
        const session = await sessions.create(user.id, tx);
        return { user: toPublicUser(user), session };
      });
    } catch (err) {
      // Dois cadastros simultâneos do mesmo e-mail: o índice unique decide.
      if (isUniqueViolation(err)) throw Errors.emailInUse();
      throw err;
    }
  }

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
