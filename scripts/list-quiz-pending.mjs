/**
 * Lista os quizzes de um curso cuja opção certa ainda é óbvia pelo tamanho (os mesmos critérios de
 * scripts/rebalance-quiz.mjs: a certa é a mais longa sozinha, ou passa de 1,35x a mediana das erradas).
 *
 *   node scripts/list-quiz-pending.mjs <curso> [--part i/n] [--skip k] [--take m]
 *
 * --part i/n  : fica só com os arquivos de índice (ordem alfabética) que satisfazem índice % n == i-1.
 *               Várias pessoas/agentes com partes diferentes nunca editam o mesmo arquivo.
 * --skip/--take: janela sobre a lista (depois do --part).
 */
import fs from "node:fs";

const [course, ...rest] = process.argv.slice(2);
const opt = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null; };
const part = opt("--part");
const skip = Number(opt("--skip") ?? 0);
const take = Number(opt("--take") ?? 1e9);
const dir = `content/courses/${course}`;
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

let files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort();
if (part) {
  const [i, n] = part.split("/").map(Number);
  files = files.filter((_, idx) => idx % n === i - 1);
}
const re = /<Quiz\s+question="([^"]*)"\s+options=\{(\[[\s\S]*?\])\}\s+answer=\{(\d+)\}\s*(?:explanation="([^"]*)")?/g;
let total = 0, shown = 0;
for (const f of files) {
  const s = fs.readFileSync(`${dir}/${f}`, "utf8");
  for (const m of s.matchAll(re)) {
    const o = JSON.parse(m[2]), a = Number(m[3]);
    const L = o.map((x) => x.length), others = L.filter((_, i) => i !== a);
    if (!(L[a] > Math.max(...others) || L[a] > 1.35 * med(others))) continue;
    total++;
    if (total <= skip || shown >= take) continue;
    shown++;
    console.log(`## ${f}\nQ: ${m[1]}\n${o.map((x, i) => `${i === a ? "*" : " "}${"ABCD"[i]}) ${x}`).join("\n")}\nE: ${m[4] ?? ""}\n`);
  }
}
console.error(`pendentes${part ? ` (parte ${part})` : ""}: ${total}`);
