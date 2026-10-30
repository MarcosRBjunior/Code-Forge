/**
 * Confere as abas de código das aulas: cada bloco de Python precisa estar dentro de um <CodeTabs>
 * com as 7 linguagens, nesta ordem: python, javascript, typescript, java, cpp, csharp, go.
 *
 *   node scripts/check-code-tabs.mjs content/courses/dsa/<aula>.mdx [...]
 */
import fs from "node:fs";

const ORDER = ["python", "javascript", "typescript", "java", "cpp", "csharp", "go"];

let bad = 0;
for (const file of process.argv.slice(2)) {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const errors = [];
  let inside = false;
  let langs = [];
  let groups = 0;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^<CodeTabs>\s*$/.test(line)) {
      if (inside) errors.push(`linha ${i + 1}: <CodeTabs> aberto dentro de outro`);
      inside = true;
      langs = [];
      continue;
    }
    if (/^<\/CodeTabs>\s*$/.test(line)) {
      if (!inside) errors.push(`linha ${i + 1}: </CodeTabs> sem abertura`);
      else if (langs.join(",") !== ORDER.join(",")) errors.push(`linha ${i + 1}: abas ${langs.join(",") || "(nenhuma)"}; esperado ${ORDER.join(",")}`);
      inside = false;
      groups++;
      continue;
    }
    const fence = /^```(\S*)/.exec(line);
    if (fence) {
      const lang = fence[1];
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith("```")) j++;
      if (inside) langs.push(lang);
      else if (lang === "python") errors.push(`linha ${i + 1}: bloco de Python fora de <CodeTabs>`);
      i = j;
    }
  }
  if (inside) errors.push("<CodeTabs> sem fechamento");
  if (errors.length) bad++;
  console.log(`${errors.length ? "✗" : "✓"} ${file} (${groups} grupos)${errors.length ? "\n  " + errors.join("\n  ") : ""}`);
}
console.log(bad ? `\n${bad} arquivo(s) com problema` : "\ntodos ok");
process.exit(bad ? 1 : 0);
