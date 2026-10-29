import { NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getAllChapters, getChapter } from "@/lib/content";
import { apiError } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getAllChapters()).filter((c) => c.kind === "problem" && c.available).map((c) => ({ course: c.course, slug: c.slug }));
}

/** Markdown do enunciado → HTML (conteúdo do próprio repositório; HTML cru do Markdown não é repassado). */
async function toHtml(md: string) {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(md);
  return String(file);
}

/** GET /api/problems/:course/:slug — enunciado em HTML (com e sem dicas) e especificação, para a mock interview. */
export async function GET(_req: Request, { params }: { params: Promise<{ course: string; slug: string }> }) {
  const { course, slug } = await params;
  const ch = await getChapter(course, slug);
  if (!ch?.problem) return apiError(404, "NOT_FOUND", "Problema não encontrado.");
  const withoutHints = ch.source.replace(/\n## Dicas?\b[\s\S]*?(?=\n## |$)/, "\n");
  return NextResponse.json({
    title: ch.title,
    difficulty: ch.difficulty,
    statementHtml: await toHtml(ch.source),
    statementHtmlNoHints: await toHtml(withoutHints),
    problem: ch.problem,
  });
}
