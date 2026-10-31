/**
 * Envolve o N-ésimo bloco ```python solto de um capítulo em <CodeTabs>, anexando as outras 6 linguagens.
 *   node scripts/apply-tabs.mjs <capitulo.mdx> <pasta-com-1.md,2.md,...>
 * Cada <N>.md tem os blocos javascript, typescript, java, cpp, csharp, go (nesta ordem). N conta os blocos Python soltos, de cima para baixo.
 */
import fs from "node:fs";
import path from "node:path";
const [file, dir] = process.argv.slice(2);
const raw = fs.readFileSync(file, "utf8");
const crlf = raw.includes("\r\n");
const lines = raw.replace(/\r\n/g, "\n").split("\n");
const out = [];
let n = 0, inTabs = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^<CodeTabs>/.test(l)) inTabs = true;
  if (/^<\/CodeTabs>/.test(l)) inTabs = false;
  if (/^```python\s*$/.test(l) && !inTabs) {
    let j = i + 1;
    while (!lines[j].startsWith("```")) j++;
    const py = lines.slice(i, j + 1).join("\n");
    n++;
    const f = path.join(dir, `${n}.md`);
    if (!fs.existsSync(f)) { console.error(`falta ${f}`); process.exit(1); }
    const extra = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n").trim();
    out.push("<CodeTabs>", "", py, "", extra, "", "</CodeTabs>");
    i = j;
    continue;
  }
  out.push(l);
}
const extraFiles = fs.readdirSync(dir).filter((x) => /^\d+\.md$/.test(x)).length;
if (extraFiles !== n) { console.error(`${n} blocos python, ${extraFiles} arquivos`); process.exit(1); }
fs.writeFileSync(file, out.join(crlf ? "\r\n" : "\n"));
console.log(`${file}: ${n} grupos`);
