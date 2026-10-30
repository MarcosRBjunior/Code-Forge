/**
 * Executa os programas completos dos capítulos dos cursos de linguagem (java, cpp, csharp, go, typescript).
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
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { runOnJudge0 } from "../src/lib/judge0";
import type { Lang } from "../src/lib/langs";

const COURSE_LANG: Record<string, { lang: Lang; fence: string[]; entry: RegExp }> = {
  java: { lang: "java", fence: ["java"], entry: /public\s+static\s+void\s+main\s*\(/ },
  cpp: { lang: "cpp", fence: ["cpp", "c++"], entry: /\bint\s+main\s*\(/ },
  csharp: { lang: "csharp", fence: ["csharp", "cs"], entry: /static\s+(?:async\s+)?(?:void|int|Task)\s+Main\s*\(/ },
  go: { lang: "go", fence: ["go"], entry: /\bfunc\s+main\s*\(/ },
  typescript: { lang: "typescript", fence: ["typescript", "ts"], entry: /console\.log\(/ },
};

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
    for (const b of blocks(content)) {
      if (!cfg.fence.includes(b.lang) || !cfg.entry.test(b.code)) continue;
      ran++;
      programs++;
      try {
        const res = await runOnJudge0(cfg.lang, b.code);
        if (res.status.id === 6) errors.push(`linha ${b.line}: erro de compilação\n${(res.compile_output ?? "").slice(0, 500)}`);
        else if (res.status.id !== 3) errors.push(`linha ${b.line}: ${res.status.description}\n${(res.stderr ?? res.message ?? "").slice(0, 400)}`);
        else if (b.expected !== null && norm(res.stdout ?? "") !== norm(b.expected))
          errors.push(`linha ${b.line}: saída diferente\n  esperado: ${JSON.stringify(norm(b.expected).slice(0, 300))}\n  obtido:   ${JSON.stringify(norm(res.stdout ?? "").slice(0, 300))}`);
      } catch (e) {
        errors.push(`linha ${b.line}: ${(e as Error).message}`);
      }
      await sleep(350);
    }
    if (data.kind === "lesson" && ran === 0) errors.push("nenhum programa executável (a aula precisa de pelo menos um)");
    if (errors.length) bad++;
    console.log(`${errors.length ? "✗" : "✓"} ${slug} (${ran} programas)${errors.length ? "\n  " + errors.join("\n  ") : ""}`);
  }
  console.log(bad ? `\n${bad} de ${slugs.length} com problema (${programs} programas executados)` : `\n${slugs.length} de ${slugs.length} ok (${programs} programas executados)`);
  process.exit(bad ? 1 : 0);
}
main();
