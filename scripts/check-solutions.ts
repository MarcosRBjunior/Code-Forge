/**
 * Verifica soluções de referência em content/solutions/<curso>/<problema>.md contra os testes do problema.
 *
 *   npx tsx --conditions react-server scripts/check-solutions.ts <problema> [<problema> ...]
 *   npx tsx --conditions react-server scripts/check-solutions.ts --all
 *
 * Python, JavaScript e TypeScript rodam localmente (mesmo harness do navegador, via check-problem.mjs).
 * Java, C++, C# e Go rodam no Judge0 (precisa de internet). Problemas com listas, árvores ou design de
 * classes só têm Python, JavaScript e TypeScript.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { transform } from "sucrase";
import { buildProgram, parseOutput } from "../src/lib/harness";
import { runOnJudge0 } from "../src/lib/judge0";
import { inferSignature, LANGS, REMOTE_LANGS, type Lang, type ProblemShape } from "../src/lib/langs";
import { parseSolution } from "../src/lib/solutions-parse";

const COURSE = "dsa";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const norm = (v: unknown, deep: boolean): unknown =>
  Array.isArray(v) ? v.map((x) => (deep ? norm(x, deep) : x)).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1)) : v;

function local(mdx: string, py: string, js: string): { python: string; javascript: string } {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cf-sol-"));
  const pyF = path.join(tmp, "sol.py");
  const jsF = path.join(tmp, "sol.js");
  fs.writeFileSync(pyF, py);
  fs.writeFileSync(jsF, js);
  let out = "";
  try {
    out = execFileSync("node", ["scripts/check-problem.mjs", mdx, pyF, jsF], { encoding: "utf8", timeout: 60000 });
  } catch (e) {
    out = String((e as { stdout?: string }).stdout ?? e);
  }
  const line = (lang: string) => out.split("\n").find((l) => l.includes(`${lang}:`) && /[✓✗]/.test(l)) ?? `✗ ${lang}: sem resultado\n${out}`;
  return { python: line("python"), javascript: line("javascript") };
}

async function remote(lang: Lang, code: string, fm: ProblemShape & { compare?: string }): Promise<string> {
  const sig = inferSignature(fm)!;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await runOnJudge0(lang, buildProgram(lang, code, fm, sig));
      if (res.status.id === 6) return `✗ ${lang}: erro de compilação\n${(res.compile_output ?? "").slice(0, 600)}`;
      if (res.status.id === 5) return `✗ ${lang}: tempo limite`;
      const parsed = parseOutput(res.stdout ?? "", fm.tests.length);
      const deep = fm.compare === "unordered-deep";
      const bad: string[] = [];
      fm.tests.forEach((t, i) => {
        const p = parsed[i];
        if (!p || p.kind !== "ok") return bad.push(`teste ${i + 1}: ${p ? p.text : (res.stderr ?? "sem saída").slice(0, 200)}`);
        const a = JSON.parse(p.text);
        const ok =
          fm.compare && fm.compare !== "exact"
            ? JSON.stringify(norm(a, deep)) === JSON.stringify(norm(t.expected, deep))
            : JSON.stringify(a) === JSON.stringify(t.expected);
        if (!ok) bad.push(`teste ${i + 1}: esperado ${JSON.stringify(t.expected)}, obtido ${p.text}`);
      });
      return bad.length
        ? `✗ ${lang}: ${fm.tests.length - bad.length}/${fm.tests.length}\n    ${bad.slice(0, 3).join("\n    ")}`
        : `✓ ${lang}: ${fm.tests.length}/${fm.tests.length}`;
    } catch (e) {
      if (attempt === 6) return `✗ ${lang}: ${(e as Error).message}`;
      await sleep(3000 * attempt); // limite de uso ou instabilidade do serviço: espera e tenta de novo
    }
  }
  return `✗ ${lang}: falhou`;
}

async function main() {
  const dir = `content/solutions/${COURSE}`;
  const args = process.argv.slice(2);
  const slugs = args.includes("--all") ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)) : args;
  if (!slugs.length) {
    console.error("uso: check-solutions.ts <problema>... | --all");
    process.exit(2);
  }
  let bad = 0;
  for (const slug of slugs) {
    const mdx = `content/courses/${COURSE}/${slug}.mdx`;
    const file = `${dir}/${slug}.md`;
    if (!fs.existsSync(mdx)) {
      console.log(`✗ ${slug}: problema não existe`);
      bad++;
      continue;
    }
    if (!fs.existsSync(file)) {
      console.log(`✗ ${slug}: sem arquivo de solução`);
      bad++;
      continue;
    }
    const fm = matter(fs.readFileSync(mdx, "utf8")).data as ProblemShape & { compare?: string };
    const sol = parseSolution(fs.readFileSync(file, "utf8"));
    const expected: Lang[] = inferSignature(fm) ? LANGS : ["python", "javascript", "typescript"];
    const lines: string[] = [];
    const missing = expected.filter((l) => !sol.code[l]);
    if (missing.length) lines.push(`✗ faltam linguagens: ${missing.join(", ")}`);
    if (!sol.idea) lines.push("✗ falta a seção Ideia");
    if (!sol.complexity) lines.push("✗ falta a seção Complexidade");
    const extra = (Object.keys(sol.code) as Lang[]).filter((l) => !expected.includes(l));
    if (extra.length) lines.push(`✗ linguagens que este problema não suporta: ${extra.join(", ")}`);

    if (sol.code.python && sol.code.javascript) {
      const r = local(mdx, sol.code.python, sol.code.javascript);
      lines.push(r.python, r.javascript);
    }
    if (sol.code.python && sol.code.typescript) {
      let js = "";
      try {
        js = transform(sol.code.typescript, { transforms: ["typescript"] }).code;
      } catch (e) {
        lines.push(`✗ typescript: ${(e as Error).message}`);
      }
      if (js) lines.push(local(mdx, sol.code.python, js).javascript.replace("javascript:", "typescript:"));
    }
    if (inferSignature(fm)) {
      for (const lang of REMOTE_LANGS) {
        if (!sol.code[lang]) continue;
        lines.push(await remote(lang, sol.code[lang]!, fm));
        await sleep(350);
      }
    }
    const failed = lines.some((l) => l.startsWith("✗"));
    if (failed) bad++;
    console.log(`${failed ? "✗" : "✓"} ${slug}${failed ? "\n  " + lines.filter((l) => l.startsWith("✗")).join("\n  ") : ""}`);
  }
  console.log(bad ? `\n${bad} de ${slugs.length} com problema` : `\n${slugs.length} de ${slugs.length} ok`);
  process.exit(bad ? 1 : 0);
}
main();
