import { and, eq, like } from "drizzle-orm";
import { Errors } from "@/server/errors";
import { highlights, notes } from "@/server/db/schema/study";
import { recordActivity, type StudyDb } from "./db";

/*
 * Destaques e notas. Os ids (UUID) são gerados no cliente e a PK é global: um id que já pertence a OUTRO usuário
 * responde 409 sem revelar nada; o mesmo id do próprio usuário (reenvio) devolve a linha que já existe.
 * Editar/apagar o id de outro usuário se comporta como id inexistente (404 / no-op).
 */

type Highlight = typeof highlights.$inferSelect;
type Note = typeof notes.$inferSelect;

export interface HighlightInput {
  id: string;
  key: string;
  color: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
}

export async function createHighlight(db: StudyDb, userId: string, input: HighlightInput): Promise<Highlight> {
  const { key, ...rest } = input;
  const [row] = await db
    .insert(highlights)
    .values({ ...rest, userId, chapterKey: key })
    .onConflictDoNothing()
    .returning();
  if (row) {
    await recordActivity(db, userId);
    return row;
  }
  const [mine] = await db.select().from(highlights).where(and(eq(highlights.id, input.id), eq(highlights.userId, userId)));
  if (!mine) throw Errors.conflict("Esse id já está em uso.");
  return mine;
}

export async function updateHighlightColor(db: StudyDb, userId: string, id: string, color: string): Promise<Highlight> {
  const [row] = await db
    .update(highlights)
    .set({ color })
    .where(and(eq(highlights.id, id), eq(highlights.userId, userId)))
    .returning();
  if (!row) throw Errors.notFound("Destaque não encontrado.");
  return row;
}

export async function deleteHighlight(db: StudyDb, userId: string, id: string): Promise<void> {
  await db.delete(highlights).where(and(eq(highlights.id, id), eq(highlights.userId, userId)));
}

export interface NoteInput {
  id: string;
  key: string;
  highlightId?: string | null;
  body: string;
}

export async function createNote(db: StudyDb, userId: string, input: NoteInput): Promise<Note> {
  if (input.highlightId) {
    // A FK composta (highlight_id, user_id) também barra isso no banco; a checagem aqui dá um 422 legível.
    const [hl] = await db
      .select({ id: highlights.id })
      .from(highlights)
      .where(and(eq(highlights.id, input.highlightId), eq(highlights.userId, userId)));
    if (!hl) throw Errors.unprocessable("Destaque não encontrado.");
  }
  const [row] = await db
    .insert(notes)
    .values({ id: input.id, userId, chapterKey: input.key, highlightId: input.highlightId ?? null, body: input.body })
    .onConflictDoNothing({ target: notes.id })
    .returning();
  if (row) {
    await recordActivity(db, userId);
    return row;
  }
  const [mine] = await db.select().from(notes).where(and(eq(notes.id, input.id), eq(notes.userId, userId)));
  if (!mine) throw Errors.conflict("Esse id já está em uso.");
  return mine;
}

export async function updateNote(db: StudyDb, userId: string, id: string, body: string): Promise<Note> {
  const [row] = await db
    .update(notes)
    .set({ body, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  if (!row) throw Errors.notFound("Nota não encontrada.");
  return row;
}

export async function deleteNote(db: StudyDb, userId: string, id: string): Promise<void> {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

/** Caderno: todos os destaques e notas de um curso (`course` já validado como slug). */
export async function getNotebook(db: StudyDb, userId: string, course: string) {
  const [hls, ns] = await Promise.all([
    db
      .select()
      .from(highlights)
      .where(and(eq(highlights.userId, userId), like(highlights.chapterKey, `${course}/%`)))
      .orderBy(highlights.createdAt),
    db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), like(notes.chapterKey, `${course}/%`)))
      .orderBy(notes.createdAt),
  ]);
  return { highlights: hls, notes: ns };
}
