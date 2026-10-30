/**
 * Executa os programas completos dos capítulos de um curso: Java, C++, C#, Go e TypeScript no Judge0;
 * SQL num Postgres embutido (PGlite); Python localmente (concorrência, SO, redes e cursos de IA).
 *
 *   npx tsx --conditions react-server scripts/check-lang-course.ts <curso> [<capitulo> ...]
 *
 * Um bloco de código é um programa executável quando tem o ponto de entrada da linguagem:
 *   java: `public static void main` (classe `public class Main`)   cpp: `int main(`
 *   csharp: `static void Main(`                                   go: `func main(`   typescript: `console.log(`
 * Cada programa roda no Judge0 e precisa terminar sem erro. Se o bloco seguinte for um ```text que começa
 * com a linha `Saída:`, o restante dele é comparado com o que o programa imprimiu.
 * Trechos sem ponto de entrada não são executados (use comentários para mostrar resultados neles).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { runOnJudge0 } from "../src/lib/judge0";
import type { Lang } from "../src/lib/langs";

interface CourseRunner {
  runner: "judge0" | "python" | "sql";
  lang?: Lang;
  fence: string[];
  entry: RegExp;
}

// Python roda localmente (biblioteca padrão; sem rede). Um bloco ```python é programa quando tem print(.
const PY: CourseRunner = { runner: "python", fence: ["python", "py"], entry: /\bprint\s*\(/ };

const COURSE_LANG: Record<string, CourseRunner> = {
  java: { runner: "judge0", lang: "java", fence: ["java"], entry: /public\s+static\s+void\s+main\s*\(/ },
  cpp: { runner: "judge0", lang: "cpp", fence: ["cpp", "c++"], entry: /\bint\s+main\s*\(/ },
  csharp: { runner: "judge0", lang: "csharp", fence: ["csharp", "cs"], entry: /static\s+(?:async\s+)?(?:void|int|Task)\s+Main\s*\(/ },
  go: { runner: "judge0", lang: "go", fence: ["go"], entry: /\bfunc\s+main\s*\(/ },
  typescript: { runner: "judge0", lang: "typescript", fence: ["typescript", "ts"], entry: /console\.log\(/ },
  // SQL: todos os blocos ```sql do capítulo rodam em ordem num Postgres novo (PGlite); o estado se acumula.
  // A saída de um bloco é o resultado do ÚLTIMO comando: cabeçalho e linhas com colunas separadas por " | ", NULL como NULL.
  sql: { runner: "sql", fence: ["sql"], entry: /\S/ },
  concorrencia: PY,
  "sistemas-operacionais": PY,
  redes: PY,
  "ai-engineering": PY,
  "genai-system-design": PY,
  "ml-system-design": PY,
};

type Sql = { exec(q: string): Promise<Array<{ fields: Array<{ name: string }>; rows: Array<Record<string, unknown>> }>>; close(): Promise<void> };

async function freshSql(): Promise<Sql> {
  const { PGlite } = await import("@electric-sql/pglite");
  return new PGlite() as unknown as Sql;
}

const cell = (v: unknown) =>
  v === null || v === undefined ? "NULL" : v instanceof Date ? v.toISOString().slice(0, v.toISOString().endsWith("T00:00:00.000Z") ? 10 : 19).replace("T", " ") : typeof v === "object" ? JSON.stringify(v) : String(v);

async function runBlock(cfg: CourseRunner, code: string, sql: Sql | null): Promise<{ stdout: string; error?: string }> {
  try {
    if (cfg.runner === "sql") {
      const results = await sql!.exec(code);
      const last = [...results].reverse().find((r) => r.fields.length) ?? results[results.length - 1];
      if (!last || !last.fields.length) return { stdout: "" };
      const head = last.fields.map((f) => f.name).join(" | ");
      return { stdout: [head, ...last.rows.map((r) => last.fields.map((f) => cell(r[f.name])).join(" | "))].join("\n") };
    }
    if (cfg.runner === "python") {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-py-"));
      const file = path.join(dir, "main.py");
      fs.writeFileSync(file, code);
      // Sem -I: ele faria o Python ignorar PYTHONHASHSEED. -X utf8 garante acentos na saída; -P -s isolam caminhos.
      const r = spawnSync("python", ["-X", "utf8", "-P", "-s", file], { cwd: dir, encoding: "utf8", timeout: 30000, env: { ...process.env, PYTHONHASHSEED: "0" } });
      if (r.error) return { stdout: "", error: r.error.message.includes("ETIMEDOUT") ? "tempo limite (30 s)" : r.error.message };
      if (r.status !== 0) return { stdout: r.stdout ?? "", error: `terminou com erro\n${(r.stderr ?? "").slice(-600)}` };
      return { stdout: r.stdout ?? "" };
    }
    const res = await runOnJudge0(cfg.lang!, code);
    if (res.status.id === 6) return { stdout: "", error: `erro de compilação\n${(res.compile_output ?? "").slice(0, 500)}` };
    if (res.status.id !== 3) return { stdout: "", error: `${res.status.description}\n${(res.stderr ?? res.message ?? "").slice(0, 400)}` };
    return { stdout: res.stdout ?? "" };
  } catch (e) {
    return { stdout: "", error: (e as Error).message };
  }
}

interface Block {
  lang: string;
  code: string;
  expected: string | null;
  line: number;
}

function blocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const raw: Array<{ lang: string; code: string; line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^```(\S*)/.exec(lines[i]);
    if (!open) continue;
    const start = i + 1;
    let j = start;
    while (j < lines.length && !lines[j].startsWith("```")) j++;
    raw.push({ lang: open[1].toLowerCase(), code: lines.slice(start, j).join("\n"), line: start });
    i = j;
  }
  return raw.map((b, idx) => {
    const next = raw[idx + 1];
    const isOut = next && next.lang === "text" && /^Saída/i.test(next.code.trimStart());
    return { ...b, expected: isOut ? next.code.trimStart().split("\n").slice(1).join("\n") : null };
  });
}

const norm = (s: string) => s.replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [course, ...only] = process.argv.slice(2);
  const cfg = COURSE_LANG[course];
  if (!cfg) {
    console.error(`uso: check-lang-course.ts <${Object.keys(COURSE_LANG).join("|")}> [capitulo...]`);
    process.exit(2);
  }
  const dir = path.join("content", "courses", course);
  const slugs = only.length ? only : fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4));
  let bad = 0;
  let programs = 0;
  for (const slug of slugs) {
    const file = path.join(dir, `${slug}.mdx`);
    if (!fs.existsSync(file)) {
      console.log(`✗ ${slug}: arquivo não existe`);
      bad++;
      continue;
    }
    const { content, data } = matter(fs.readFileSync(file, "utf8"));
    const errors: string[] = [];
    let ran = 0;
    const sql = cfg.runner === "sql" ? await freshSql() : null;
    for (const b of blocks(content)) {
      if (!cfg.fence.includes(b.lang) || !cfg.entry.test(b.code)) continue;
      ran++;
      programs++;
      const out = await runBlock(cfg, b.code, sql);
      if (out.error) errors.push(`linha ${b.line}: ${out.error}`);
      else if (b.expected !== null && norm(out.stdout) !== norm(b.expected))
        errors.push(`linha ${b.line}: saída diferente\n  esperado: ${JSON.stringify(norm(b.expected).slice(0, 300))}\n  obtido:   ${JSON.stringify(norm(out.stdout).slice(0, 300))}`);
      if (cfg.runner === "judge0") await sleep(350);
    }
    await sql?.close();
    if (data.kind === "lesson" && ran === 0) errors.push("nenhum programa executável (a aula precisa de pelo menos um)");
    if (errors.length) bad++;
    console.log(`${errors.length ? "✗" : "✓"} ${slug} (${ran} programas)${errors.length ? "\n  " + errors.join("\n  ") : ""}`);
  }
  console.log(bad ? `\n${bad} de ${slugs.length} com problema (${programs} programas executados)` : `\n${slugs.length} de ${slugs.length} ok (${programs} programas executados)`);
  process.exit(bad ? 1 : 0);
}
main();
