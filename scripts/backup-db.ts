/**
 * Backup e restauração do progresso (destaques, notas, rascunhos, revisão, entrevistas...).
 *
 *   npx tsx --conditions react-server scripts/backup-db.ts export [arquivo.json]
 *   npx tsx --conditions react-server scripts/backup-db.ts import <arquivo.json> [--replace]
 *
 * O banco é escolhido como no app: com DATABASE_URL usa esse Postgres (Azure); sem ela, o PGlite local (.data/pglite).
 * Migrar entre bancos = `export` com o .env de origem, depois `import` com o de destino
 * (ex.: npx tsx --env-file=.env.azure --conditions react-server scripts/backup-db.ts export).
 *
 * - export grava em backups/ por padrão (a pasta está no .gitignore: o arquivo tem suas notas).
 * - import só preenche tabelas VAZIAS; as que já têm dados são puladas. Com --replace, apaga e reimporta.
 * - Feche o `npm run dev` / `npm start` antes: o PGlite só aceita um processo por vez.
 */
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../src/db";

// Ordem importa na importação: notes referencia highlights.
const TABLES = [
  "chapter_progress",
  "stars",
  "highlights",
  "notes",
  "code_drafts",
  "mock_interviews",
  "review_cards",
  "activity_days",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowsOf = (r: any): any[] => (Array.isArray(r) ? r : r.rows);

async function main() {
  const [cmd, arg, flag] = process.argv.slice(2);
  const db = await getDb();
  const where = process.env.DATABASE_URL ? `Postgres ${new URL(process.env.DATABASE_URL).hostname}` : "PGlite local (.data/pglite)";

  if (cmd === "export") {
    const out: Record<string, unknown[]> = {};
    for (const t of TABLES) {
      const r = rowsOf(await db.execute(sql.raw(`SELECT coalesce(jsonb_agg(x), '[]'::jsonb) AS j FROM ${t} x`)));
      const j = r[0].j;
      out[t] = typeof j === "string" ? JSON.parse(j) : j;
      console.log(`${t.padEnd(18)} ${out[t].length} linhas`);
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = arg ?? path.join("backups", `codeforge-${stamp}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tables: out }, null, 2));
    console.log(`\nExportado de ${where} para ${file}`);
  } else if (cmd === "import" && arg) {
    const data = JSON.parse(fs.readFileSync(arg, "utf8"));
    if (data.version !== 1 || !data.tables) throw new Error("Arquivo não é um backup do CodeForge (version 1).");
    console.log(`Importando para ${where}${flag === "--replace" ? " (--replace)" : ""}\n`);
    if (flag === "--replace") {
      // notes antes de highlights por causa da chave estrangeira
      for (const t of [...TABLES].reverse()) await db.execute(sql.raw(`DELETE FROM ${t}`));
    }
    for (const t of TABLES) {
      const rows: unknown[] = data.tables[t] ?? [];
      const n = Number(rowsOf(await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${t}`)))[0].n);
      if (n > 0) { console.log(`${t.padEnd(18)} pulada (já tem ${n} linhas; use --replace para sobrescrever)`); continue; }
      if (!rows.length) { console.log(`${t.padEnd(18)} vazia no backup`); continue; }
      await db.execute(
        sql`INSERT INTO ${sql.raw(t)} SELECT * FROM jsonb_populate_recordset(null::${sql.raw(t)}, ${JSON.stringify(rows)}::jsonb)`,
      );
      console.log(`${t.padEnd(18)} ${rows.length} linhas importadas`);
    }
  } else {
    console.log("Uso: backup-db.ts export [arquivo] | import <arquivo> [--replace]");
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
