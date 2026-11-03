/**
 * Gera uma cópia de um capítulo em que todo bloco Python dentro de <CodeTabs> ganha um print( no início de linha
 * (e o `if __name__ == "__main__":` vira `if True:`), para que check-tabs-run.ts COMPARE as saídas.
 * Sem isso, o verificador só confere que o código compila quando o Python não tem print( na coluna 0.
 *
 *   node scripts/force-print.mjs <capitulo.mdx> <copia.mdx>
 *   npx tsx --conditions react-server scripts/check-tabs-run.ts <copia.mdx>
 *
 * Grave a cópia FORA de content/ (por exemplo, numa pasta temporária).
 */
import fs from "node:fs";
const [entrada, saida] = process.argv.slice(2);
const linhas = fs.readFileSync(entrada, "utf8").replace(/\r\n/g, "\n").split("\n");
const out = [];
let dentro = false;
for (let i = 0; i < linhas.length; i++) {
  const l = linhas[i];
  if (/^<CodeTabs>/.test(l)) dentro = true;
  if (/^<\/CodeTabs>/.test(l)) dentro = false;
  if (dentro && /^```python\s*$/.test(l)) {
    let j = i + 1;
    while (!linhas[j].startsWith("```")) j++;
    const corpo = linhas.slice(i + 1, j);
    out.push(l, ...corpo.map((x) => x.replace(/^if __name__ == "__main__":/, "if True:")));
    if (!corpo.some((x) => /^print\(/.test(x))) out.push('print("")');
    out.push(linhas[j]);
    i = j;
    continue;
  }
  out.push(l);
}
fs.writeFileSync(saida, out.join("\n"));
