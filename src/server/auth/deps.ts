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

/**
 * Uma linha por evento (meta em JSON): no Log Analytics cada linha do console vira um registro, e um objeto
 * impresso em várias linhas chega picado e fora de ordem. Nunca passe senha, hash ou token em `meta`.
 */
export const oneLine = (message: string, meta?: Record<string, unknown>) =>
  meta && Object.keys(meta).length ? `${message} ${JSON.stringify(meta)}` : message;

export const consoleLogger: Logger = {
  info: (m, meta) => console.info(oneLine(m, meta)),
  warn: (m, meta) => console.warn(oneLine(m, meta)),
  error: (m, meta) => console.error(oneLine(m, meta)),
};

/**
 * Agenda trabalho para depois da resposta (no handler: `after()` do Next).
 * Os testes passam uma implementação que guarda as promessas para poder aguardá-las.
 */
export type Defer = (job: () => Promise<void>) => void;
