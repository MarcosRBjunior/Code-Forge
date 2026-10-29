import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, drafts } from "@/db";
import { ChapterKey, parseBody } from "@/lib/api";

const SaveDraft = z.object({
  key: ChapterKey,
  language: z.enum(["python", "javascript"]),
  code: z.string().max(65536),
});

/** PUT /api/drafts — salva o código em andamento de um problema. */
export async function PUT(req: Request) {
  const body = await parseBody(req, SaveDraft);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  await db
    .insert(drafts)
    .values({ chapterKey: body.key, language: body.language, code: body.code })
    .onConflictDoUpdate({
      target: [drafts.chapterKey, drafts.language],
      set: { code: body.code, updatedAt: new Date() },
    });
  return new NextResponse(null, { status: 204 });
}
