import "server-only";
import { and, eq, inArray, lte, gt, sql } from "drizzle-orm";
import { getDb, chapterProgress, highlights, notes, reviewCards, today, dayOf } from "@/db";
import { getAllChapters } from "@/lib/content";
import { addDays, type CardState } from "@/lib/srs";

/** Cartões novos que entram por dia, para um backlog grande não virar uma avalanche. */
export const NEW_PER_DAY = 10;

type Db = Awaited<ReturnType<typeof getDb>>;

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

/**
 * Cria cartões para problemas resolvidos e highlights que ainda não têm um, e remove os
 * que perderam a origem. Idempotente: pode rodar a cada leitura sem duplicar nada.
 */
export async function syncCards(db: Db) {
  const chapters = await getAllChapters();
  const problemKeys = new Set(chapters.filter((c) => c.kind === "problem" && c.available).map((c) => `${c.course}/${c.slug}`));

  const [done, hls, cards] = await Promise.all([
    db.select({ key: chapterProgress.chapterKey, at: chapterProgress.completedAt }).from(chapterProgress).where(eq(chapterProgress.completed, true)),
    db.select({ id: highlights.id, at: highlights.createdAt }).from(highlights),
    db.select({ id: reviewCards.id, kind: reviewCards.kind, ref: reviewCards.ref }).from(reviewCards),
  ]);

  const solved = done.filter((d) => problemKeys.has(d.key));
  const existing = new Set(cards.map((c) => c.id));
  const dueAfter = (at: Date | null) => addDays(at ? dayOf(at) : today(), 1);

  const fresh = [
    ...solved.filter((d) => !existing.has(`problem:${d.key}`)).map((d) => ({ id: `problem:${d.key}`, kind: "problem", ref: d.key, due: dueAfter(d.at) })),
    ...hls.filter((h) => !existing.has(`highlight:${h.id}`)).map((h) => ({ id: `highlight:${h.id}`, kind: "highlight", ref: h.id, due: dueAfter(h.at) })),
  ];
  if (fresh.length) await db.insert(reviewCards).values(fresh).onConflictDoNothing();

  const liveProblems = new Set(solved.map((d) => d.key));
  const liveHighlights = new Set(hls.map((h) => h.id));
  const orphans = cards.filter((c) => (c.kind === "problem" ? !liveProblems.has(c.ref) : !liveHighlights.has(c.ref))).map((c) => c.id);
  if (orphans.length) await db.delete(reviewCards).where(inArray(reviewCards.id, orphans));
}

/** Fila do dia: cartões já aprendidos e vencidos primeiro, depois os novos até o limite diário. */
export async function getReview(): Promise<{ today: string; queue: ReviewItem[]; counts: ReviewCounts }> {
  const db = await getDb();
  await syncCards(db);
  const now = today();

  const [dueRows, [{ n: newToday }], [{ n: total }], [{ n: next7Days }]] = await Promise.all([
    db
      .select()
      .from(reviewCards)
      .where(and(eq(reviewCards.suspended, false), lte(reviewCards.due, now)))
      .orderBy(reviewCards.due, reviewCards.createdAt),
    db.select({ n: sql<number>`count(*)::int` }).from(reviewCards).where(eq(reviewCards.firstReviewed, now)),
    db.select({ n: sql<number>`count(*)::int` }).from(reviewCards).where(eq(reviewCards.suspended, false)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviewCards)
      .where(and(eq(reviewCards.suspended, false), gt(reviewCards.due, now), lte(reviewCards.due, addDays(now, 7)))),
  ]);

  const learned = dueRows.filter((c) => c.lastReviewed !== null);
  const fresh = dueRows.filter((c) => c.lastReviewed === null);
  const newAvailable = Math.max(0, Math.min(fresh.length, NEW_PER_DAY - newToday));
  const picked = [...learned, ...fresh.slice(0, newAvailable)];

  const chapters = new Map((await getAllChapters()).map((c) => [`${c.course}/${c.slug}`, c]));
  const hlIds = picked.filter((c) => c.kind === "highlight").map((c) => c.ref);
  const [hlRows, noteRows] = hlIds.length
    ? await Promise.all([
        db.select().from(highlights).where(inArray(highlights.id, hlIds)),
        db.select().from(notes).where(inArray(notes.highlightId, hlIds)).orderBy(notes.createdAt),
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
