import { defineConfig } from "drizzle-kit";

/*
 * Só as tabelas novas (auth) são geridas pelo drizzle-kit. As do modo pessoal seguem no DDL de src/db/index.ts.
 * Gerar migração: npm run db:generate (não conecta em banco nenhum).
 * Aplicar: automático na primeira conexão do app (src/server/db/migrate.ts), tanto no Postgres quanto no PGlite.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/auth.ts",
  out: "./drizzle",
});
