/**
 * Roda os blocos ```sql de cada capítulo do curso de SQL num PGlite limpo (um por capítulo) e compara o
 * resultado do último comando com o bloco "Saída:" que vem logo depois.
 *
 *   node scripts/check-sql.mjs                 # todos os capítulos
 *   node scripts/check-sql.mjs ctes funcoes-de-janela
 *
 * Comparação: ignora espaços; NULL = vazio; números comparados por valor (9000.0 = 9000.00).
 * "ordem" = mesmo conteúdo em outra ordem (consulta sem ORDER BY). Blocos sem "Saída:" só precisam executar.
 */
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const dir = "content/courses/sql";
const only = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && (!only.length || only.includes(f.slice(0, -4))));

const cell = (v) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return JSON.stringify(v);
  const s = String(v).trim();
  if (s === "NULL") return "";
  return /^-?\d+(\.\d+)?$/.test(s) ? String(Number(s)) : s;
};
const normLine = (l) => l.split("|").map((c) => cell(c)).join("|");
const toLines = (txt) => txt.trim().split("\n").map((l) => l.trim()).filter(Boolean).map(normLine);

let ok = 0, ordem = 0;
const bad = [];
for (const f of files) {
  const src = fs.readFileSync(`${dir}/${f}`, "utf8");
  const blocks = [...src.matchAll(/```(sql|text)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], body: m[2], at: src.slice(0, m.index).split("\n").length }));
  const db = new PGlite();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.lang !== "sql") continue;
    const next = blocks[i + 1];
    const expected = next?.lang === "text" && /^Saída:/.test(next.body) ? next.body.replace(/^Saída:\s*\n?/, "") : null;
    let results;
    try {
      results = await db.exec(b.body);
    } catch (e) {
      // Se o texto seguinte for "Erro:", a falha é o esperado.
      if (next?.lang === "text" && /^(Erro|Error)/i.test(next.body)) { ok++; continue; }
      bad.push(`${f}:${b.at} ERRO ao executar: ${String(e.message).split("\n")[0]}`);
      continue;
    }
    if (expected === null) { ok++; continue; }
    const last = [...results].reverse().find((r) => r.fields && r.fields.length) ?? results[results.length - 1];
    const got = [last.fields.map((x) => x.name).join("|"), ...last.rows.map((r) => last.fields.map((x) => cell(r[x.name])).join("|"))].map(normLine);
    const want = toLines(expected);
    if (JSON.stringify(got) === JSON.stringify(want)) ok++;
    else if (JSON.stringify([...got].sort()) === JSON.stringify([...want].sort())) { ordem++; bad.push(`${f}:${b.at} ordem diferente (sem ORDER BY?)`); }
    else bad.push(`${f}:${b.at} SAÍDA DIFERE\n    esperado: ${want.slice(0, 4).join(" ; ")}\n    obtido:   ${got.slice(0, 4).join(" ; ")}`);
  }
  await db.close();
}
console.log(`${files.length} capítulos | ok ${ok} | ordem ${ordem} | problemas ${bad.length}`);
for (const b of bad) console.log("-", b);
process.exit(bad.length ? 1 : 0);
