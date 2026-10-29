import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, highlights, recordActivity } from "@/db";
import { apiError, ChapterKey, HighlightColor, parseBody } from "@/lib/api";

const CreateHighlight = z
  .object({
    id: z.string().uuid(), // gerado no cliente (criação otimista)
    key: ChapterKey,
    color: HighlightColor,
    blockId: z.string().max(64),
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(1),
    quote: z.string().min(1).max(5000),
  })
  .refine((h) => h.endOffset > h.startOffset, { message: "endOffset deve ser maior que startOffset", path: ["endOffset"] });

const UpdateHighlight = z.object({ id: z.string().uuid(), color: HighlightColor });

export async function POST(req: Request) {
  const body = await parseBody(req, CreateHighlight);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  const [row] = await db
    .insert(highlights)
    .values({ ...body, chapterKey: body.key })
    .onConflictDoNothing()
    .returning();
  await recordActivity(db);
  return NextResponse.json(row ?? null, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await parseBody(req, UpdateHighlight);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  const [row] = await db.update(highlights).set({ color: body.color }).where(eq(highlights.id, body.id)).returning();
  if (!row) return apiError(404, "NOT_FOUND", "Destaque não encontrado.");
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return apiError(422, "VALIDATION_FAILED", "id inválido.");
  const db = await getDb();
  await db.delete(highlights).where(eq(highlights.id, id));
  return new NextResponse(null, { status: 204 });
}
