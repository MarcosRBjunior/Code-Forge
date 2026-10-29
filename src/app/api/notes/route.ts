import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, notes, recordActivity } from "@/db";
import { apiError, ChapterKey, parseBody } from "@/lib/api";

const NoteBody = z.string().trim().min(1).max(20000);
const CreateNote = z.object({
  id: z.string().uuid(),
  key: ChapterKey,
  highlightId: z.string().uuid().nullish(),
  body: NoteBody,
});
const UpdateNote = z.object({ id: z.string().uuid(), body: NoteBody });

export async function POST(req: Request) {
  const body = await parseBody(req, CreateNote);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  const [row] = await db
    .insert(notes)
    .values({ id: body.id, chapterKey: body.key, highlightId: body.highlightId ?? null, body: body.body })
    .returning();
  await recordActivity(db);
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await parseBody(req, UpdateNote);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  const [row] = await db
    .update(notes)
    .set({ body: body.body, updatedAt: new Date() })
    .where(eq(notes.id, body.id))
    .returning();
  if (!row) return apiError(404, "NOT_FOUND", "Nota não encontrada.");
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return apiError(422, "VALIDATION_FAILED", "id inválido.");
  const db = await getDb();
  await db.delete(notes).where(eq(notes.id, id));
  return new NextResponse(null, { status: 204 });
}
