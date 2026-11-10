import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

/** Banco usado pelos services: Postgres (node-postgres) ou PGlite, sem schema relacional. */
export type AuthDb = PgDatabase<PgQueryResultHKT>;

/** Relógio injetável (os testes avançam o tempo sem esperar). */
export type Clock = () => Date;
export const systemClock: Clock = () => new Date();

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/** Nunca passe senha, hash ou token em `meta`. */
export const consoleLogger: Logger = {
  info: (m, meta) => console.info(m, meta ?? ""),
  warn: (m, meta) => console.warn(m, meta ?? ""),
  error: (m, meta) => console.error(m, meta ?? ""),
};

/**
 * Agenda trabalho para depois da resposta (no handler: `after()` do Next).
 * Os testes passam uma implementação que guarda as promessas para poder aguardá-las.
 */
export type Defer = (job: () => Promise<void>) => void;
