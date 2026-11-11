import { and, desc, eq, gte, like, sql } from "drizzle-orm";
import { activityDays, chapterProgress, drafts, highlights, notes, stars } from "@/server/db/schema/study";
import { recordActivity, today, type StudyDb } from "./db";

/* Progresso de leitura, favoritos, rascunhos de código e as leituras agregadas (estado, painel). */

export interface ProgressInput {
  key: string;
  percentRead?: number;
  lastBlockId?: string;
  completed?: boolean;
}

/** Idempotente; percentRead só cresce; completed=true leva a 100%. */
export async function upsertProgress(db: StudyDb, userId: string, input: ProgressInput): Promise<void> {
  const now = new Date();
  await db
    .insert(chapterProgress)
    .values({
      userId,
      chapterKey: input.key,
      percentRead: input.completed ? 100 : (input.percentRead ?? 0),
      lastBlockId: input.lastBlockId,
      completed: input.completed ?? false,
      completedAt: input.completed ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [chapterProgress.userId, chapterProgress.chapterKey],
      set: {
        percentRead:
          input.completed === true ? sql`100` : sql`greatest(${chapterProgress.percentRead}, ${input.percentRead ?? 0})`,
        lastBlockId: input.lastBlockId ? input.lastBlockId : sql`${chapterProgress.lastBlockId}`,
        completed: input.completed ?? sql`${chapterProgress.completed}`,
        completedAt:
          input.completed === undefined
            ? sql`${chapterProgress.completedAt}`
            : input.completed
              ? sql`coalesce(${chapterProgress.completedAt}, now())`
              : null,
        updatedAt: now,
      },
    });
  await recordActivity(db, userId);
}

export async function setStar(db: StudyDb, userId: string, key: string, starred: boolean): Promise<void> {
  if (starred) await db.insert(stars).values({ userId, chapterKey: key }).onConflictDoNothing();
  else await db.delete(stars).where(and(eq(stars.userId, userId), eq(stars.chapterKey, key)));
}

export async function saveDraft(db: StudyDb, userId: string, input: { key: string; language: string; code: string }): Promise<void> {
  await db
    .insert(drafts)
    .values({ userId, chapterKey: input.key, language: input.language, code: input.code })
    .onConflictDoUpdate({
      target: [drafts.userId, drafts.chapterKey, drafts.language],
      set: { code: input.code, updatedAt: new Date() },
    });
}

/** Estado completo de um capítulo (leitor): progresso, favorito, destaques, notas e rascunhos. */
export async function getChapterState(db: StudyDb, userId: string, chapter: string) {
  const [progress, star, hls, ns, ds] = await Promise.all([
    db.select().from(chapterProgress).where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.chapterKey, chapter))),
    db.select().from(stars).where(and(eq(stars.userId, userId), eq(stars.chapterKey, chapter))),
    db
      .select()
      .from(highlights)
      .where(and(eq(highlights.userId, userId), eq(highlights.chapterKey, chapter)))
      .orderBy(highlights.createdAt),
    db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.chapterKey, chapter)))
      .orderBy(notes.createdAt),
    db.select().from(drafts).where(and(eq(drafts.userId, userId), eq(drafts.chapterKey, chapter))),
  ]);
  return {
    progress: progress[0] ?? null,
    starred: star.length > 0,
    highlights: hls,
    notes: ns,
    drafts: Object.fromEntries(ds.map((d) => [d.language, d.code])),
  };
}

/** Progresso e favoritos de um curso (ou de todos, sem `course`). `course` já validado como slug. */
export async function getCourseState(db: StudyDb, userId: string, course?: string) {
  const prefix = course ? `${course}/%` : "%";
  const [progress, starred] = await Promise.all([
    db
      .select()
      .from(chapterProgress)
      .where(and(eq(chapterProgress.userId, userId), like(chapterProgress.chapterKey, prefix))),
    db
      .select()
      .from(stars)
      .where(and(eq(stars.userId, userId), like(stars.chapterKey, prefix))),
  ]);
  return {
    progress: Object.fromEntries(progress.map((p) => [p.chapterKey, { percentRead: p.percentRead, completed: p.completed }])),
    starred: starred.map((s) => s.chapterKey),
  };
}

export const HEATMAP_DAYS = 112; // 16 semanas

export function addDaysIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Painel: sequência de dias, mapa de calor, capítulos recentes e totais. */
export async function getDashboard(db: StudyDb, userId: string) {
  const now = today();
  const since = addDaysIso(now, -(HEATMAP_DAYS - 1));

  const [days, recent, [hlCount], [noteCount], [doneCount]] = await Promise.all([
    db
      .select()
      .from(activityDays)
      .where(and(eq(activityDays.userId, userId), gte(activityDays.day, since))),
    db
      .select()
      .from(chapterProgress)
      .where(eq(chapterProgress.userId, userId))
      .orderBy(desc(chapterProgress.updatedAt))
      .limit(6),
    db.select({ n: sql<number>`count(*)::int` }).from(highlights).where(eq(highlights.userId, userId)),
    db.select({ n: sql<number>`count(*)::int` }).from(notes).where(eq(notes.userId, userId)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(chapterProgress)
      .where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.completed, true))),
  ]);

  const byDay = new Map(days.map((d) => [String(d.day), d.events]));
  // Sequência: dias consecutivos com atividade terminando hoje (ou ontem, se hoje ainda não estudou).
  let streak = 0;
  let cursor = byDay.has(now) ? now : addDaysIso(now, -1);
  while (byDay.has(cursor)) {
    streak++;
    cursor = addDaysIso(cursor, -1);
  }

  return {
    today: now,
    streak,
    activity: Array.from({ length: HEATMAP_DAYS }, (_, i) => {
      const day = addDaysIso(since, i);
      return { day, events: byDay.get(day) ?? 0 };
    }),
    recent: recent.map((r) => ({ key: r.chapterKey, percentRead: r.percentRead, completed: r.completed, updatedAt: r.updatedAt })),
    totals: { completed: doneCount.n, highlights: hlCount.n, notes: noteCount.n },
  };
}
