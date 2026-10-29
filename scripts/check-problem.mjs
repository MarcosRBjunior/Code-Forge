#!/usr/bin/env node
/**
 * Roda soluções de referência contra os testes de um problema usando EXATAMENTE o mesmo
 * harness do navegador (extraído de src/components/practice/runner.ts).
 *
 * Uso: node scripts/check-problem.mjs <problema.mdx> <solucao.py> <solucao.js>
 * Sai com código 1 se algum teste falhar em qualquer linguagem.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const [mdxPath, pyPath, jsPath] = process.argv.slice(2);
if (!mdxPath || !pyPath || !jsPath) {
  console.error("uso: node scripts/check-problem.mjs <problema.mdx> <solucao.py> <solucao.js>");
  process.exit(2);
}

const runnerSrc = fs.readFileSync(path.join(process.cwd(), "src/components/practice/runner.ts"), "utf8").replace(/\r\n/g, "\n");
const grab = (name) => {
  const m = new RegExp(`const ${name} = String\\.raw\`([\\s\\S]*?)\`;\\n`).exec(runnerSrc);
  if (!m) throw new Error(`não achei ${name} em runner.ts`);
  return m[1];
};
const PY_HARNESS = grab("PY_HARNESS");
const JS_WORKER = grab("JS_WORKER");

const { data } = matter(fs.readFileSync(mdxPath, "utf8"));
const job = {
  fn: data.fn,
  checkArg: data.checkArg ?? -1,
  compare: data.compare ?? "exact",
  argTypes: data.argTypes ?? [],
  returnType: data.returnType ?? null,
  design: data.design ?? false,
  tests: data.tests,
};

function report(lang, out) {
  if (!Array.isArray(out)) {
    console.log(`✗ ${lang}: erro de compilação: ${out.compile_error}`);
    return false;
  }
  const failed = out.map((c, i) => ({ ...c, i })).filter((c) => !c.ok);
  for (const c of failed) {
    console.log(`✗ ${lang} teste ${c.i + 1}: esperado ${JSON.stringify(job.tests[c.i].expected)}, obtido ${c.error ?? JSON.stringify(c.actual)}`);
  }
  console.log(`${failed.length ? "✗" : "✓"} ${lang}: ${out.length - failed.length}/${out.length}`);
  return failed.length === 0;
}

// --- Python: mesmo harness, executado pelo CPython local ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cf-check-"));
const runner = path.join(tmp, "run.py");
fs.writeFileSync(
  runner,
  [
    "import json, sys",
    "cfg = json.load(open(sys.argv[1], encoding='utf-8'))",
    "g = {'USER_CODE': open(sys.argv[2], encoding='utf-8').read(), 'FN_NAME': cfg['fn'],",
    "     'TESTS_JSON': json.dumps(cfg['tests']), 'ARG_TYPES_JSON': json.dumps(cfg['argTypes']),",
    "     'RETURN_TYPE': cfg['returnType'], 'DESIGN': cfg['design'], 'CHECK_ARG': cfg['checkArg'], 'COMPARE': cfg['compare']}",
    "exec(open(sys.argv[3], encoding='utf-8').read(), g)",
    "sys.stdout.write(json.dumps(g['_out']))",
  ].join("\n"),
);
fs.writeFileSync(path.join(tmp, "job.json"), JSON.stringify(job));
fs.writeFileSync(path.join(tmp, "harness.py"), PY_HARNESS);
let pyOk = false;
try {
  const out = execFileSync("python", ["-I", runner, path.join(tmp, "job.json"), path.resolve(pyPath), path.join(tmp, "harness.py")], {
    encoding: "utf8",
    timeout: 20000,
  });
  pyOk = report("python", JSON.parse(out));
} catch (e) {
  console.log(`✗ python: ${e.message.split("\n").slice(0, 3).join(" ")}`);
}

// --- JavaScript: mesmo código do Web Worker, num contexto vm isolado ---
let jsOk = false;
const ctx = {
  structuredClone,
  performance,
  console: { log() {} },
  postMessage: () => {},
};
ctx.self = ctx;
let result;
ctx.postMessage = (m) => {
  if (m.type === "result") result = m.out;
};
vm.createContext(ctx);
vm.runInContext(JS_WORKER, ctx, { timeout: 5000 });
ctx.onmessage({ data: { ...job, fn: data.fnJs, code: fs.readFileSync(jsPath, "utf8") } });
jsOk = report("javascript", result);

fs.rmSync(tmp, { recursive: true, force: true });
process.exit(pyOk && jsOk ? 0 : 1);
