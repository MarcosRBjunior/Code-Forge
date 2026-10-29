import { NextResponse } from "next/server";
import { getAllChapters, getChapter } from "@/lib/content";
import { apiError } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getAllChapters()).filter((c) => c.kind === "problem" && c.available).map((c) => ({ course: c.course, slug: c.slug }));
}

/** GET /api/problems/:course/:slug — enunciado (texto) e especificação do problema, para a mock interview. */
export async function GET(_req: Request, { params }: { params: Promise<{ course: string; slug: string }> }) {
  const { course, slug } = await params;
  const ch = await getChapter(course, slug);
  if (!ch?.problem) return apiError(404, "NOT_FOUND", "Problema não encontrado.");
  return NextResponse.json({ title: ch.title, difficulty: ch.difficulty, statement: ch.source, problem: ch.problem });
}
