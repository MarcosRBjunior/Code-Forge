/**
 * Mostra o código inicial (a assinatura exata esperada) de um problema em todas as linguagens.
 *   npx tsx --conditions react-server scripts/show-starters.ts <problema> [<problema> ...]
 */
import fs from "node:fs";
import matter from "gray-matter";
import { allStarters, inferSignature, LANG_LABEL, LANGS, type ProblemShape } from "../src/lib/langs";

for (const slug of process.argv.slice(2)) {
  const fm = matter(fs.readFileSync(`content/courses/dsa/${slug}.mdx`, "utf8")).data as ProblemShape;
  const starters = allStarters(fm);
  console.log(`\n######## ${slug}  (${inferSignature(fm) ? "7 linguagens" : "só Python, JavaScript e TypeScript"})`);
  for (const l of LANGS) if (starters[l]) console.log(`--- ${LANG_LABEL[l]}\n${starters[l]}`);
}
