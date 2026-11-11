import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { apiError, ChapterKey } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { getChapterState, getCourseState } from "@/server/study/progress";

export const dynamic = "force-dynamic";

/**
 * GET /api/state?course=dsa         → progresso e favoritos do curso (sidebar, catálogo)
 * GET /api/state?chapter=dsa/two-sum → estado completo do capítulo (destaques, notas, rascunhos)
 * GET /api/state                     → progresso de todos os cursos
 * Sempre do usuário da sessão.
 */
export async function GET(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const url = new URL(req.url);
  const db = await getDb();

  const chapter = url.searchParams.get("chapter");
  if (chapter) {
    if (!ChapterKey.safeParse(chapter).success) return apiError(422, "VALIDATION_FAILED", "Capítulo inválido.");
    return NextResponse.json(await getChapterState(db, user.id, chapter));
  }

  const course = url.searchParams.get("course");
  if (course && !/^[a-z0-9-]+$/.test(course)) return apiError(422, "VALIDATION_FAILED", "Curso inválido.");
  return NextResponse.json(await getCourseState(db, user.id, course ?? undefined));
}
