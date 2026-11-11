import "server-only";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { migratePg, migratePglite } from "@/server/db/migrate";

/*
 * Conexão com o banco. Com DATABASE_URL: Postgres (produção: Azure Database for PostgreSQL). Sem ela: PGlite (arquivo em .data/).
 * Todas as tabelas (auth e estudo) são criadas e alteradas pelas migrações do drizzle-kit (pasta drizzle/).
 * Os dados de estudo são por usuário: acesse-os pelos services de src/server/study/, que sempre filtram por user_id.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<PgQueryResultHKT, any>;

const globalForDb = globalThis as unknown as { cfDb?: Promise<Db> };

async function connect(): Promise<Db> {
  let db: Db;
  const url = process.env.DATABASE_URL;
  if (url) {
    // Postgres (Azure Database for PostgreSQL em produção): pool TCP do node-postgres.
    // A Azure exige TLS; use "?sslmode=verify-full" na DATABASE_URL (verifica o certificado do servidor).
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url, max: 5 });
    await migratePg(pool);
    db = drizzle(pool) as unknown as Db;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { mkdirSync } = await import("node:fs");
    const dataDir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dataDir, { recursive: true });
    const client = new PGlite(dataDir);
    await migratePglite(client);
    db = drizzle(client) as unknown as Db;
  }
  return db;
}

/** Conexão única por processo (sobrevive ao hot reload em dev). */
export function getDb(): Promise<Db> {
  globalForDb.cfDb ??= connect().catch((err) => {
    globalForDb.cfDb = undefined;
    throw err;
  });
  return globalForDb.cfDb;
}
