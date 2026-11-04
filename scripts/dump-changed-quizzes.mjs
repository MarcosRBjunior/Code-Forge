/**
 * Imprime os quizzes dos arquivos alterados (git diff) de um curso, para revisão.
 *   node scripts/dump-changed-quizzes.mjs <curso> --part i/n
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
const [course, , part] = process.argv.slice(2);
const [i, n] = part.split("/").map(Number);
const files = execSync(`git diff --name-only -- content/courses/${course}`, { stdio: ["ignore", "pipe", "ignore"] })
  .toString().trim().split("\n").filter(Boolean).sort().filter((_, k) => k % n === i - 1);
const re = /<Quiz\s+question="([^"]*)"\s+options=\{(\[[\s\S]*?\])\}\s+answer=\{(\d+)\}\s*(?:explanation="([^"]*)")?/g;
let c = 0;
for (const f of files) for (const m of fs.readFileSync(f, "utf8").matchAll(re)) {
  const o = JSON.parse(m[2]), a = +m[3]; c++;
  console.log(`## ${f.split("/").pop()}\nQ: ${m[1]}\n${o.map((x, k) => `${k === a ? "*" : " "}${"ABCD"[k]}) ${x}`).join("\n")}\nE: ${m[4] ?? ""}\n`);
}
console.error("quizzes:", c);
