#!/usr/bin/env node
/**
 * Valida capítulos MDX: frontmatter, componentes permitidos e compilação.
 * Uso: node scripts/check-content.mjs                 (todos os capítulos)
 *      node scripts/check-content.mjs a.mdx b.mdx     (só os arquivos indicados)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

const ROOT = path.join(process.cwd(), "content", "courses");
const ALLOWED = new Set(["Animation", "Callout", "Quiz", "QuizSet"]);
const KINDS = new Set(["lesson", "problem", "quiz"]);

function allFiles() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => fs.readdirSync(path.join(ROOT, d.name)).filter((f) => f.endsWith(".mdx")).map((f) => path.join(ROOT, d.name, f)));
}

const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : allFiles();
let failures = 0;

for (const file of files) {
  const errs = [];
  const raw = fs.readFileSync(file, "utf8");
  let fm;
  try {
    fm = matter(raw);
  } catch (e) {
    errs.push(`frontmatter YAML inválido: ${e.message}`);
  }
  if (fm) {
    const { data, content } = fm;
    if (!data.title) errs.push("frontmatter sem title");
    if (!KINDS.has(data.kind)) errs.push(`kind inválido: ${data.kind}`);
    if (data.kind === "problem") {
      for (const k of ["difficulty", "fn", "fnJs", "starter", "tests"]) if (data[k] === undefined) errs.push(`problema sem ${k}`);
      if (data.starter && (!data.starter.python || !data.starter.javascript)) errs.push("starter precisa de python e javascript");
      if (Array.isArray(data.tests)) {
        data.tests.forEach((t, i) => {
          if (!Array.isArray(t.input)) errs.push(`tests[${i}].input precisa ser lista de argumentos`);
          if (!("expected" in t)) errs.push(`tests[${i}] sem expected`);
        });
      }
    }
    const slug = path.basename(file, ".mdx");
    const course = JSON.parse(fs.readFileSync(path.join(path.dirname(file), "course.json"), "utf8"));
    const declared = course.modules.some((m) => m.chapters.some((c) => (typeof c === "string" ? c : c.slug) === slug));
    if (!declared) errs.push(`slug "${slug}" não está no course.json`);
    // Ignora código (blocos e inline), onde `List<Integer>` é legítimo.
    const prose = content.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    for (const m of prose.matchAll(/<([A-Z]\w*)/g)) if (!ALLOWED.has(m[1])) errs.push(`componente não permitido: <${m[1]}>`);
    try {
      await compile(content, { remarkPlugins: [remarkGfm] });
    } catch (e) {
      errs.push(`MDX não compila: ${e.message.split("\n")[0]}`);
    }
  }
  if (errs.length) {
    failures++;
    console.log(`✗ ${path.relative(process.cwd(), file)}\n  - ${errs.join("\n  - ")}`);
  }
}
console.log(`${files.length - failures}/${files.length} capítulos OK`);
process.exit(failures ? 1 : 0);
