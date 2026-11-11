import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { apiError } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { getNotebook } from "@/server/study/annotations";

export const dynamic = "force-dynamic";

/** GET /api/notebook?course=dsa — todos os destaques e notas do usuário no curso. */
export async function GET(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const course = new URL(req.url).searchParams.get("course");
  if (!course || !/^[a-z0-9-]+$/.test(course)) return apiError(422, "VALIDATION_FAILED", "Curso inválido.");
  return NextResponse.json(await getNotebook(await getDb(), user.id, course));
}
