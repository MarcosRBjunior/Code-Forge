/**
 * Imprime os quizzes dos arquivos alterados (git diff) de um curso, para revisão. Para cada quiz mostra também a
 * opção certa da versão anterior (HEAD), para o revisor conferir que o significado foi preservado.
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
for (const f of files) {
  let old = [];
  try {
    old = [...execSync(`git show HEAD:${f}`, { maxBuffer: 1e9, stdio: ["ignore", "pipe", "ignore"] }).toString().matchAll(re)];
  } catch { /* arquivo novo */ }
  [...fs.readFileSync(f, "utf8").matchAll(re)].forEach((m, k) => {
    const o = JSON.parse(m[2]), a = +m[3]; c++;
    const prev = old[k] && old[k][1] === m[1] ? JSON.parse(old[k][2])[+old[k][3]] : null;
    console.log(`## ${f.split("/").pop()}\nQ: ${m[1]}\n${o.map((x, j) => `${j === a ? "*" : " "}${"ABCD"[j]}) ${x}`).join("\n")}\nE: ${m[4] ?? ""}\nCERTA ANTES: ${prev ?? "(sem versão anterior)"}\n`);
  });
}
console.error("quizzes:", c);
