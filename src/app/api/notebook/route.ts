import { NextResponse } from "next/server";
import { like } from "drizzle-orm";
import { getDb, highlights, notes } from "@/db";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/notebook?course=dsa — todos os destaques e notas do curso. */
export async function GET(req: Request) {
  const course = new URL(req.url).searchParams.get("course");
  if (!course || !/^[a-z0-9-]+$/.test(course)) return apiError(422, "VALIDATION_FAILED", "Curso inválido.");
  const db = await getDb();
  const [hls, ns] = await Promise.all([
    db.select().from(highlights).where(like(highlights.chapterKey, `${course}/%`)).orderBy(highlights.createdAt),
    db.select().from(notes).where(like(notes.chapterKey, `${course}/%`)).orderBy(notes.createdAt),
  ]);
  return NextResponse.json({ highlights: hls, notes: ns });
}
