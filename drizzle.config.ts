import { defineConfig } from "drizzle-kit";

/*
 * Todas as tabelas (auth e estudo) são geridas pelo drizzle-kit. A 0001 foi editada à mão (migra o banco antigo); confira
 * o SQL de toda migração gerada antes de commitar.
 * Gerar migração: npm run db:generate (não conecta em banco nenhum).
 * Aplicar: automático na primeira conexão do app (src/server/db/migrate.ts), tanto no Postgres quanto no PGlite.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/server/db/schema/auth.ts", "./src/server/db/schema/study.ts"],
  out: "./drizzle",
});
