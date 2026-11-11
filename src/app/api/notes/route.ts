import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { apiError, ChapterKey, parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { toErrorResponse } from "@/server/http";
import { createNote, deleteNote, updateNote } from "@/server/study/annotations";

const NoteBody = z.string().trim().min(1).max(20000);
const CreateNote = z.object({
  id: z.string().uuid(),
  key: ChapterKey,
  highlightId: z.string().uuid().nullish(),
  body: NoteBody,
});
const UpdateNote = z.object({ id: z.string().uuid(), body: NoteBody });

export async function POST(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, CreateNote);
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json(await createNote(await getDb(), user.id, body), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, UpdateNote);
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json(await updateNote(await getDb(), user.id, body.id, body.body));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return apiError(422, "VALIDATION_FAILED", "id inválido.");
  await deleteNote(await getDb(), user.id, id);
  return new NextResponse(null, { status: 204 });
}
