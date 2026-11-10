import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";

/**
 * Pasta com as migrações geradas pelo drizzle-kit. No build standalone o cwd é a raiz da imagem (/app),
 * e a pasta drizzle/ vai junto (outputFileTracingIncludes + COPY no Dockerfile).
 */
export const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/** Aplica as migrações pendentes num Postgres real (node-postgres). Idempotente. */
export async function migratePg(pool: Pool): Promise<void> {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
}

/** Aplica as migrações pendentes num PGlite (dev sem DATABASE_URL e testes em memória). Idempotente. */
export async function migratePglite(client: PGlite): Promise<void> {
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
}
