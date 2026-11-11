import { and, eq, gt, inArray, lte, sql } from "drizzle-orm";
import { chapterProgress, highlights, notes, reviewCards } from "@/server/db/schema/study";
import { Errors } from "@/server/errors";
import { addDays, schedule, type CardState, type Rating } from "@/lib/srs";
import { dayOf, recordActivity, today, type StudyDb } from "./db";

/** Cartões novos que entram por dia, para um backlog grande não virar uma avalanche. */
export const NEW_PER_DAY = 10;

/** O que a revisão precisa saber de cada capítulo (subconjunto de ChapterMeta; os testes passam uma lista curta). */
export interface ReviewChapter {
  course: string;
  slug: string;
  title: string;
  moduleTitle: string;
  kind: string;
  available: boolean;
  difficulty?: string;
}

export interface ReviewItem {
  id: string;
  kind: "problem" | "highlight";
  isNew: boolean;
  state: CardState;
  chapter: { key: string; course: string; slug: string; title: string; moduleTitle: string };
  difficulty?: string;
  quote?: string;
  color?: string;
  notes?: string[];
}

export interface ReviewCounts {
  /** Quantos cartões entram na fila de hoje (vencidos + novos dentro do limite diário). */
  due: number;
  newAvailable: number;
  total: number;
  next7Days: number;
}

const mine = (userId: string) => eq(reviewCards.userId, userId);

/**
 * Cria cartões para problemas resolvidos e highlights do usuário que ainda não têm um, e remove os
 * que perderam a origem. Idempotente: pode rodar a cada leitura sem duplicar nada.
 */
export async function syncCards(db: StudyDb, userId: string, chapters: ReviewChapter[]): Promise<void> {
  const problemKeys = new Set(chapters.filter((c) => c.kind === "problem" && c.available).map((c) => `${c.course}/${c.slug}`));

  const [done, hls, cards] = await Promise.all([
    db
      .select({ key: chapterProgress.chapterKey, at: chapterProgress.completedAt })
      .from(chapterProgress)
      .where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.completed, true))),
    db.select({ id: highlights.id, at: highlights.createdAt }).from(highlights).where(eq(highlights.userId, userId)),
    db.select({ id: reviewCards.id, kind: reviewCards.kind, ref: reviewCards.ref }).from(reviewCards).where(mine(userId)),
  ]);

  const solved = done.filter((d) => problemKeys.has(d.key));
  const existing = new Set(cards.map((c) => c.id));
  const dueAfter = (at: Date | null) => addDays(at ? dayOf(at) : today(), 1);

  const fresh = [
    ...solved
      .filter((d) => !existing.has(`problem:${d.key}`))
      .map((d) => ({ userId, id: `problem:${d.key}`, kind: "problem", ref: d.key, due: dueAfter(d.at) })),
    ...hls
      .filter((h) => !existing.has(`highlight:${h.id}`))
      .map((h) => ({ userId, id: `highlight:${h.id}`, kind: "highlight", ref: h.id, due: dueAfter(h.at) })),
  ];
  if (fresh.length) await db.insert(reviewCards).values(fresh).onConflictDoNothing();

  const liveProblems = new Set(solved.map((d) => d.key));
  const liveHighlights = new Set(hls.map((h) => h.id));
  const orphans = cards.filter((c) => (c.kind === "problem" ? !liveProblems.has(c.ref) : !liveHighlights.has(c.ref))).map((c) => c.id);
  if (orphans.length) await db.delete(reviewCards).where(and(mine(userId), inArray(reviewCards.id, orphans)));
}

/** Fila do dia do usuário: cartões já aprendidos e vencidos primeiro, depois os novos até o limite diário. */
export async function getReview(
  db: StudyDb,
  userId: string,
  chapterList: ReviewChapter[],
): Promise<{ today: string; queue: ReviewItem[]; counts: ReviewCounts }> {
  await syncCards(db, userId, chapterList);
  const now = today();
  const active = and(mine(userId), eq(reviewCards.suspended, false));

  const [dueRows, [{ n: newToday }], [{ n: total }], [{ n: next7Days }]] = await Promise.all([
    db
      .select()
      .from(reviewCards)
      .where(and(active, lte(reviewCards.due, now)))
      .orderBy(reviewCards.due, reviewCards.createdAt),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviewCards)
      .where(and(mine(userId), eq(reviewCards.firstReviewed, now))),
    db.select({ n: sql<number>`count(*)::int` }).from(reviewCards).where(active),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviewCards)
      .where(and(active, gt(reviewCards.due, now), lte(reviewCards.due, addDays(now, 7)))),
  ]);

  const learned = dueRows.filter((c) => c.lastReviewed !== null);
  const fresh = dueRows.filter((c) => c.lastReviewed === null);
  const newAvailable = Math.max(0, Math.min(fresh.length, NEW_PER_DAY - newToday));
  const picked = [...learned, ...fresh.slice(0, newAvailable)];

  const chapters = new Map(chapterList.map((c) => [`${c.course}/${c.slug}`, c]));
  const hlIds = picked.filter((c) => c.kind === "highlight").map((c) => c.ref);
  const [hlRows, noteRows] = hlIds.length
    ? await Promise.all([
        db
          .select()
          .from(highlights)
          .where(and(eq(highlights.userId, userId), inArray(highlights.id, hlIds))),
        db
          .select()
          .from(notes)
          .where(and(eq(notes.userId, userId), inArray(notes.highlightId, hlIds)))
          .orderBy(notes.createdAt),
      ])
    : [[], []];
  const hlById = new Map(hlRows.map((h) => [h.id, h]));

  const queue: ReviewItem[] = [];
  for (const card of picked) {
    const state: CardState = { ease: card.ease, intervalDays: card.intervalDays, reps: card.reps, lapses: card.lapses };
    const base = { id: card.id, isNew: card.lastReviewed === null, state };
    if (card.kind === "problem") {
      const ch = chapters.get(card.ref);
      if (!ch) continue;
      queue.push({
        ...base,
        kind: "problem",
        chapter: { key: card.ref, course: ch.course, slug: ch.slug, title: ch.title, moduleTitle: ch.moduleTitle },
        difficulty: ch.difficulty,
      });
    } else {
      const hl = hlById.get(card.ref);
      const ch = hl && chapters.get(hl.chapterKey);
      if (!hl || !ch) continue;
      queue.push({
        ...base,
        kind: "highlight",
        chapter: { key: hl.chapterKey, course: ch.course, slug: ch.slug, title: ch.title, moduleTitle: ch.moduleTitle },
        quote: hl.quote,
        color: hl.color,
        notes: noteRows.filter((n) => n.highlightId === hl.id).map((n) => n.body),
      });
    }
  }

  return { today: now, queue, counts: { due: queue.length, newAvailable, total, next7Days } };
}

/** Registra a nota de um cartão do usuário e agenda a próxima revisão. */
export async function answerCard(db: StudyDb, userId: string, id: string, rating: Rating) {
  const [card] = await db.select().from(reviewCards).where(and(mine(userId), eq(reviewCards.id, id)));
  if (!card) throw Errors.notFound("Cartão não encontrado.");

  const next = schedule({ ease: card.ease, intervalDays: card.intervalDays, reps: card.reps, lapses: card.lapses }, rating);
  const now = today();
  const due = addDays(now, next.intervalDays);
  await db
    .update(reviewCards)
    .set({ ...next, due, lastReviewed: now, firstReviewed: card.firstReviewed ?? now })
    .where(and(mine(userId), eq(reviewCards.id, id)));
  await recordActivity(db, userId);
  return { id, due, intervalDays: next.intervalDays };
}

/** Para (ou retoma) a revisão de um cartão do usuário, sem apagar o histórico dele. */
export async function suspendCard(db: StudyDb, userId: string, id: string, suspended: boolean): Promise<void> {
  const updated = await db
    .update(reviewCards)
    .set({ suspended })
    .where(and(mine(userId), eq(reviewCards.id, id)))
    .returning({ id: reviewCards.id });
  if (!updated.length) throw Errors.notFound("Cartão não encontrado.");
}
