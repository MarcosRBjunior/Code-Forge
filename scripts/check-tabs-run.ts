/**
 * Executa cada grupo <CodeTabs> dos capítulos e compara a saída das 7 linguagens com a do Python.
 * Java/C#/Go aparecem no capítulo em formato de aula (métodos soltos, sem classe/pacote); aqui são embrulhados.
 *
 *   npx tsx --conditions react-server scripts/check-tabs-run.ts content/courses/dsa/<aula>.mdx [...]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runOnJudge0 } from "../src/lib/judge0";
import type { Lang } from "../src/lib/langs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// compara ignorando colchetes, aspas, vírgulas e espaços (cada linguagem imprime listas de um jeito)
const norm = (s: string) => s.toLowerCase().replace(/\bmap(?=\[)/g, "").replace(/[\[\]()'",{}:=\s]+/g, " ").trim();

function wrapJava(code: string) {
  if (/class Main\b/.test(code)) return code;
  const imports: string[] = [];
  const body = code.split("\n").filter((l) => (/^import /.test(l) ? (imports.push(l), false) : true)).map((l) => l.replace(/^(class|record|interface|enum) /, "static $1 "));
  return `${imports.join("\n")}\npublic class Main {\n${body.join("\n")}\n}\n`;
}
function wrapCs(code: string) {
  if (/class Program\b|namespace /.test(code)) return code;
  const usings: string[] = [];
  const body = code.split("\n").filter((l) => (/^using [\w.]+;/.test(l) ? (usings.push(l), false) : true));
  return `${usings.join("\n")}\nclass Program {\n${body.join("\n")}\n}\n`;
}
const wrapGo = (code: string) => (/^package /m.test(code) ? code : `package main\n\n${code}\n`);

function runLocal(cmd: string, args: string[], file: string, code: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-tab-"));
  const f = path.join(dir, file);
  fs.writeFileSync(f, code);
  const r = spawnSync(cmd, [...args, f], { cwd: dir, encoding: "utf8", timeout: 30000, env: { ...process.env, PYTHONHASHSEED: "0" } });
  return r.status === 0 ? { out: (r.stdout ?? "").split("\r\n").join("\n") } : { err: (r.stderr || r.error?.message || "erro").slice(-500) };
}

function addStub(lang: string, code: string) {
  if (lang === "java" && !/void main\(/.test(code)) return code + "\npublic static void main(String[] args) {}\n";
  if (lang === "cpp" && !/\bint\s+main\s*\(/.test(code)) return code + "\nint main() {}\n";
  if (lang === "csharp" && !/void Main\(/.test(code)) return code + "\nstatic void Main() {}\n";
  if (lang === "go" && !/func main\(/.test(code)) return code + "\nfunc main() {}\n";
  return code;
}

async function run(lang: string, code: string): Promise<{ out?: string; err?: string }> {
  if (lang === "python") return runLocal("python", ["-X", "utf8", "-P", "-s"], "main.py", code);
  if (lang === "javascript") return runLocal("node", [], "main.js", code);
  const src = lang === "java" ? wrapJava(code) : lang === "csharp" ? wrapCs(code) : lang === "go" ? wrapGo(code) : code;
  try {
    const r = await runOnJudge0(lang as Lang, src);
    if (r.status.id === 6) return { err: "compilação: " + (r.compile_output ?? "").slice(0, 600) };
    if (r.status.id !== 3) return { err: `${r.status.description}: ${(r.stderr ?? r.message ?? "").slice(0, 400)}` };
    return { out: r.stdout ?? "" };
  } catch (e) {
    return { err: (e as Error).message };
  }
}

// Grupos que dependem do anterior (o Python usa uma função definida no bloco de cima): o código do grupo anterior,
// sem o ponto de entrada, é colocado antes.
function stripMain(lang: string, code: string) {
  const re = { java: /^public static void main\(/m, cpp: /^int main\(/m, csharp: /^static void Main\(/m, go: /^func main\(/m }[lang as "java"];
  if (!re) return code;
  const k = code.search(re);
  return k < 0 ? code : code.slice(0, k);
}
function importsGo(code: string) {
  const set = new Set<string>();
  const body = code.replace(/^import\s*\(([\s\S]*?)\)\s*$/gm, (_, inner) => (inner.split("\n").forEach((l: string) => l.trim() && set.add(l.trim())), "")).replace(/^import\s+("[^"]+")\s*$/gm, (_, x) => (set.add(x), ""));
  return { set, body };
}
function chain(lang: string, prev: string, cur: string) {
  if (lang === "go") {
    const a = importsGo(stripMain("go", prev)), b = importsGo(cur);
    const corpo = a.body + b.body;
    // Go recusa import sem uso: mantém só os pacotes que o código junto realmente referencia
    const all = new Set([...a.set, ...b.set].filter((imp) => new RegExp("\\b" + imp.replace(/"/g, "").split("/").pop() + "\\.").test(corpo)));
    return `import (\n${[...all].map((x) => "\t" + x).join("\n")}\n)\n${a.body}\n${b.body}`;
  }
  if (lang === "javascript" || lang === "typescript" || lang === "python") return prev + "\n" + cur;
  return stripMain(lang, prev) + "\n" + cur;
}

async function main() {
  const only = process.env.ONLY_LANGS?.split(",");
  const LANGS = ["javascript", "typescript", "java", "cpp", "csharp", "go"];
  let bad = 0;
  for (const file of process.argv.slice(2)) {
    const lines = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n");
    const errors: string[] = [];
    let groups = 0, ran = 0, skipped = 0;
    // código dos grupos anteriores (sem modelos): blocos posteriores podem depender de classes e funções definidas antes
    const acc: Record<string, string> = {};
    let prev: Record<string, string> | null = null;
    for (let i = 0; i < lines.length; i++) {
      if (!/^<CodeTabs>\s*$/.test(lines[i])) continue;
      groups++;
      const g: Record<string, string> = {};
      const at = i + 1;
      for (i++; !/^<\/CodeTabs>/.test(lines[i]); i++) {
        const m = /^```(\S+)/.exec(lines[i]);
        if (!m) continue;
        const s = i + 1;
        let j = s;
        while (!lines[j].startsWith("```")) j++;
        g[m[1]] = lines.slice(s, j).join("\n");
        i = j;
      }
      const printed = /\bprint\(/.test(g.python ?? ""); // sem print: só confere que compila (acrescenta um main vazio)
      let ref = await run("python", g.python);
      let expected = ref.out ?? "";
      if (ref.err && /(NameError|not defined)/.test(ref.err) && acc.python) {
        const before = await run("python", acc.python);
        const all = await run("python", acc.python + "\n" + g.python);
        ref = all;
        if (!all.err) expected = (all.out ?? "").slice((before.out ?? "").length);
      }
      if (ref.err && /(NameError|not defined)/.test(ref.err)) { skipped++; prev = g; continue; } // modelo de código (usa funções não definidas): não executável
      if (ref.err) { errors.push(`grupo da linha ${at}: python falhou: ${ref.err}`); prev = g; continue; }
      ran++;
      for (const lang of LANGS) {
        if (only && !only.includes(lang)) continue;
        const own = g[lang] ?? "";
        const prep = (code: string) => (printed ? code : addStub(lang, code));
        // 1) sozinho; 2) depois de todo o código anterior; 3) depois só do bloco imediatamente anterior
        const tentativas: (string | null)[] = [null];
        if (acc[lang]) tentativas.push(acc[lang]);
        if (prev && prev[lang] && prev[lang] !== acc[lang]) tentativas.push(prev[lang]);
        let r: { out?: string; err?: string } = { err: "sem tentativa" };
        let prefixo: string | null = null;
        for (const base of tentativas) {
          r = await run(lang, prep(base === null ? own : chain(lang, base, own)));
          prefixo = base;
          if (!r.err) break;
          if (!["javascript"].includes(lang)) await sleep(350);
        }
        let got = r.out ?? "";
        if (prefixo !== null && !r.err && (lang === "javascript" || lang === "typescript")) {
          const pre = await run(lang, prefixo); // o código anterior também imprime
          const k = (pre.out ?? "").length;
          if (!pre.err && norm(got.slice(0, k)) === norm(pre.out ?? "")) got = got.slice(k);
        }
        if (r.err) errors.push(`grupo da linha ${at} [${lang}]: ${r.err}`);
        else if (printed && norm(got) !== norm(expected)) errors.push(`grupo da linha ${at} [${lang}]: saída difere\n    python: ${JSON.stringify(norm(expected).slice(0, 200))}\n    ${lang}: ${JSON.stringify(norm(got).slice(0, 200))}`);
        if (!["javascript"].includes(lang)) await sleep(350);
      }
      for (const l of ["python", ...LANGS]) acc[l] = acc[l] ? chain(l, acc[l], g[l] ?? "") : (g[l] ?? "");
      prev = g;
    }
    if (errors.length) bad++;
    console.log(`${errors.length ? "✗" : "✓"} ${file} (${ran}/${groups} grupos executados${skipped ? `, ${skipped} modelo(s) sem execução` : ""})${errors.length ? "\n  " + errors.join("\n  ") : ""}`);
  }
  process.exit(bad ? 1 : 0);
}
main();
