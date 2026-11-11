/**
 * Backup e restauração do progresso de todos os usuários (destaques, notas, rascunhos, revisão, entrevistas...).
 *
 *   npx tsx --conditions react-server scripts/backup-db.ts export [arquivo.json]
 *   npx tsx --conditions react-server scripts/backup-db.ts import <arquivo.json> [--replace]
 *
 * O banco é escolhido como no app: com DATABASE_URL usa esse Postgres (Azure); sem ela, o PGlite local (.data/pglite).
 * Migrar entre bancos = `export` com o .env de origem, depois `import` com o de destino
 * (ex.: npx tsx --env-file=.env.azure --conditions react-server scripts/backup-db.ts export).
 *
 * - export grava em backups/ por padrão (a pasta está no .gitignore: o arquivo tem suas notas).
 * - import só preenche tabelas VAZIAS; as que já têm dados são puladas. Com --replace, apaga e reimporta
 *   (as tabelas de estudo de TODOS os usuários; as contas nunca são apagadas).
 * - version 2 (atual) leva as contas junto (com o hash da senha) e casa com as do destino pelo e-mail;
 *   version 1 (antes do multiusuário) entrega tudo ao único usuário do destino.
 * - Feche o `npm run dev` / `npm start` antes: o PGlite só aceita um processo por vez.
 */
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../src/db";

// Ordem importa na importação: users antes de tudo; notes referencia highlights.
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
type Row = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowsOf = (r: any): Row[] => (Array.isArray(r) ? r : r.rows);

async function main() {
  const [cmd, arg, flag] = process.argv.slice(2);
  const db = await getDb();
  const where = process.env.DATABASE_URL
    ? `Postgres ${new URL(process.env.DATABASE_URL).hostname}`
    : `PGlite local (${process.env.PGLITE_DIR ?? ".data/pglite"})`;
  const dump = async (query: string): Promise<Row[]> => {
    const j = rowsOf(await db.execute(sql.raw(`SELECT coalesce(jsonb_agg(x), '[]'::jsonb) AS j FROM (${query}) x`)))[0].j;
    return typeof j === "string" ? JSON.parse(j) : j;
  };

  if (cmd === "export") {
    // Contas entram (com o hash argon2 da senha) para o backup restaurar o dono de cada linha; sessões e tokens não.
    const users = await dump("SELECT id, email, password_hash, name, role, created_at, updated_at FROM users");
    console.log(`${"users".padEnd(18)} ${users.length} linhas`);
    const out: Record<string, Row[]> = {};
    for (const t of TABLES) {
      out[t] = await dump(`SELECT * FROM ${t}`);
      console.log(`${t.padEnd(18)} ${out[t].length} linhas`);
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const file = arg ?? path.join("backups", `codeforge-${stamp}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), users, tables: out }, null, 2));
    console.log(`
Exportado de ${where} para ${file}`);
  } else if (cmd === "import" && arg) {
    const data = JSON.parse(fs.readFileSync(arg, "utf8"));
    if (![1, 2].includes(data.version) || !data.tables) throw new Error("Arquivo não é um backup do CodeForge (version 1 ou 2).");
    console.log(`Importando para ${where}${flag === "--replace" ? " (--replace)" : ""}
`);

    // Dono de cada linha: version 2 casa as contas do backup com as do banco pelo e-mail (cria as que faltam);
    // version 1 (modo pessoal, sem user_id) entrega tudo ao único usuário do banco.
    const existing = await dump("SELECT id, email FROM users");
    const idMap = new Map<string, string>(); // id no backup → id no destino (version 2)
    if (data.version === 1 && existing.length !== 1) {
      throw new Error(`Backup version 1 não tem dono: o banco precisa ter exatamente 1 usuário (tem ${existing.length}).`);
    }
    const ownerOf = (row: Row): string => {
      if (data.version === 1) return existing[0].id;
      const id = idMap.get(row.user_id);
      if (!id) throw new Error(`Linha com user_id que não está nas contas do backup: ${row.user_id}`);
      return id;
    };
    if (data.version === 2) {
      const byEmail = new Map(existing.map((u) => [u.email as string, u.id as string]));
      const missing: Row[] = [];
      for (const u of data.users as Row[]) {
        const id = byEmail.get(u.email);
        if (id) idMap.set(u.id, id);
        else {
          missing.push(u);
          idMap.set(u.id, u.id);
        }
      }
      if (missing.length) {
        await db.execute(sql`INSERT INTO users SELECT * FROM jsonb_populate_recordset(null::users, ${JSON.stringify(missing)}::jsonb)`);
      }
      console.log(`${"users".padEnd(18)} ${data.users.length - missing.length} já existiam, ${missing.length} criadas`);
    }

    if (flag === "--replace") {
      // notes antes de highlights por causa da chave estrangeira
      for (const t of [...TABLES].reverse()) await db.execute(sql.raw(`DELETE FROM ${t}`));
    }
    for (const t of TABLES) {
      const rows: Row[] = (data.tables[t] ?? []).map((r: Row) => ({ ...r, user_id: ownerOf(r) }));
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
