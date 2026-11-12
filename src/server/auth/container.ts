import "server-only";
import { after } from "next/server";
import { getDb } from "@/db";
import { getEnv } from "@/server/env";
import { AuthService } from "./auth-service";
import { AccountService } from "./account-service";
import { SessionService } from "./session-service";
import { PasswordResetService } from "./password-reset-service";
import { RegistrationService } from "./registration-service";
import { PostgresRateLimiter, type RateLimiter } from "./rate-limit";
import { createMailService } from "./mail";
import { consoleLogger, systemClock, type AuthDb } from "./deps";

/** Composição dos services com as dependências reais. Os testes montam os services direto, sem passar por aqui. */
export interface AuthContainer {
  auth: AuthService;
  account: AccountService;
  sessions: SessionService;
  passwordReset: PasswordResetService;
  registration: RegistrationService;
  rateLimiter: RateLimiter;
  production: boolean;
}

const globalForAuth = globalThis as unknown as { cfAuth?: Promise<AuthContainer> };

async function build(): Promise<AuthContainer> {
  const env = getEnv();
  const db: AuthDb = await getDb();
  const production = env.NODE_ENV === "production";
  const sessions = new SessionService(db, systemClock);
  const rateLimiter = new PostgresRateLimiter(db, systemClock);
  const mailer = createMailService(production, consoleLogger, { acsConnectionString: env.ACS_CONNECTION_STRING, mailFrom: env.MAIL_FROM });
  // Roda depois de a resposta sair: o tempo de resposta não depende de o e-mail existir.
  const defer = (job: () => Promise<void>) => after(job);
  return {
    sessions,
    rateLimiter,
    production,
    auth: new AuthService({ db, sessions, rateLimiter }),
    account: new AccountService({ db, sessions, rateLimiter }),
    registration: new RegistrationService({
      db,
      sessions,
      rateLimiter,
      registration: { open: env.REGISTRATION_OPEN, allowlist: env.REGISTRATION_ALLOWLIST },
      mailer,
      logger: consoleLogger,
      appUrl: env.APP_URL,
      defer,
      clock: systemClock,
    }),
    passwordReset: new PasswordResetService({
      db,
      sessions,
      rateLimiter,
      mailer,
      logger: consoleLogger,
      appUrl: env.APP_URL,
      defer,
      clock: systemClock,
    }),
  };
}

export function getAuth(): Promise<AuthContainer> {
  globalForAuth.cfAuth ??= build().catch((err) => {
    globalForAuth.cfAuth = undefined;
    throw err;
  });
  return globalForAuth.cfAuth;
}
