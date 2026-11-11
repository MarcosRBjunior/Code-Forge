import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { saveDraft } from "@/server/study/progress";
import { ChapterKey, parseBody } from "@/lib/api";
import { LANGS } from "@/lib/langs";
import { authorize } from "@/server/auth/current-user";

const SaveDraft = z.object({
  key: ChapterKey,
  language: z.enum(LANGS as [string, ...string[]]),
  code: z.string().max(65536),
});

/** PUT /api/drafts — salva o código em andamento de um problema. */
export async function PUT(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, SaveDraft);
  if (body instanceof NextResponse) return body;
  await saveDraft(await getDb(), user.id, body);
  return new NextResponse(null, { status: 204 });
}
