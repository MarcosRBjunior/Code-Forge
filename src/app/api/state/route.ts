import { NextResponse } from "next/server";
import { eq, like } from "drizzle-orm";
import { getDb, chapterProgress, stars, highlights, notes, drafts } from "@/db";
import { apiError, ChapterKey } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/state?course=dsa         → progresso e favoritos do curso (sidebar, catálogo)
 * GET /api/state?chapter=dsa/two-sum → estado completo do capítulo (destaques, notas, rascunhos)
 * GET /api/state                     → progresso de todos os cursos
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const db = await getDb();
  const chapter = url.searchParams.get("chapter");

  if (chapter) {
    if (!ChapterKey.safeParse(chapter).success) return apiError(422, "VALIDATION_FAILED", "Capítulo inválido.");
    const [progress, star, hls, ns, ds] = await Promise.all([
      db.select().from(chapterProgress).where(eq(chapterProgress.chapterKey, chapter)),
      db.select().from(stars).where(eq(stars.chapterKey, chapter)),
      db.select().from(highlights).where(eq(highlights.chapterKey, chapter)).orderBy(highlights.createdAt),
      db.select().from(notes).where(eq(notes.chapterKey, chapter)).orderBy(notes.createdAt),
      db.select().from(drafts).where(eq(drafts.chapterKey, chapter)),
    ]);
    return NextResponse.json({
      progress: progress[0] ?? null,
      starred: star.length > 0,
      highlights: hls,
      notes: ns,
      drafts: Object.fromEntries(ds.map((d) => [d.language, d.code])),
    });
  }

  const course = url.searchParams.get("course");
  if (course && !/^[a-z0-9-]+$/.test(course)) return apiError(422, "VALIDATION_FAILED", "Curso inválido.");
  const prefix = course ? `${course}/%` : "%";
  const [progress, starred] = await Promise.all([
    db.select().from(chapterProgress).where(like(chapterProgress.chapterKey, prefix)),
    db.select().from(stars).where(like(stars.chapterKey, prefix)),
  ]);
  return NextResponse.json({
    progress: Object.fromEntries(progress.map((p) => [p.chapterKey, { percentRead: p.percentRead, completed: p.completed }])),
    starred: starred.map((s) => s.chapterKey),
  });
}
