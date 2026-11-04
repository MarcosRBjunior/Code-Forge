/**
 * Reescreve as opções de quizzes cuja resposta certa era óbvia pelo tamanho.
 *
 *   node scripts/rebalance-quiz.mjs <curso> <patch.json>
 *
 * patch.json: lista de { "q": "<início único da pergunta>", "o": ["...", "...", "...", "..."], "a": <índice certo> }.
 * Regras (o script recusa o patch inteiro se alguma falhar):
 *  - a pergunta precisa existir uma única vez no curso, com 4 opções novas e a >= 0;
 *  - a opção certa não pode ser a mais longa sozinha, nem ser > 1,35x a mediana das erradas;
 *  - opções sem repetição.
 * A explicação não é tocada (por isso o texto da opção certa deve continuar dizendo a mesma coisa).
 */
import fs from "node:fs";
const [course, patchFile] = process.argv.slice(2);
const dir = `content/courses/${course}`;
const patch = JSON.parse(fs.readFileSync(patchFile, "utf8"));
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(`${dir}/${f}`, "utf8")]));
const re = /<Quiz\s+question="([^"]*)"\s+options=\{(\[[\s\S]*?\])\}\s+answer=\{(\d+)\}/g;
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const errors = [];
const edits = {};
for (const p of patch) {
  const found = [];
  for (const f of files) for (const m of src[f].matchAll(re)) if (m[1].startsWith(p.q)) found.push({ f, m });
  if (found.length !== 1) { errors.push(`"${p.q.slice(0, 50)}": ${found.length} correspondências`); continue; }
  const { f, m } = found[0];
  const oldOpts = JSON.parse(m[2]);
  if (p.o.length !== oldOpts.length) errors.push(`"${p.q.slice(0, 50)}": número de opções mudou`);
  if (new Set(p.o).size !== p.o.length) errors.push(`"${p.q.slice(0, 50)}": opções repetidas`);
  const L = p.o.map((x) => x.length), right = L[p.a];
  const others = L.filter((_, i) => i !== p.a);
  if (right > Math.max(...others) ) errors.push(`"${p.q.slice(0, 50)}": a certa (${right}) ainda é a mais longa (outras: ${others.join(",")})`);
  else if (right > 1.35 * med(others)) errors.push(`"${p.q.slice(0, 50)}": a certa (${right}) > 1,35x a mediana das erradas (${med(others)})`);
  (edits[f] ??= []).push({ m, p });
}
if (errors.length) { console.log("RECUSADO:\n- " + errors.join("\n- ")); process.exit(1); }
for (const [f, list] of Object.entries(edits)) {
  let s = src[f];
  for (const { m, p } of list) {
    const old = m[0];
    const neu = old.replace(m[2], JSON.stringify(p.o)).replace(/answer=\{\d+\}/, `answer={${p.a}}`);
    s = s.replace(old, () => neu);
  }
  fs.writeFileSync(`${dir}/${f}`, s);
}
console.log(`ok: ${patch.length} quizzes reescritos em ${Object.keys(edits).length} arquivos`);
