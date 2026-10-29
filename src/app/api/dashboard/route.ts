import { NextResponse } from "next/server";
import { desc, gte, sql } from "drizzle-orm";
import { getDb, activityDays, chapterProgress, highlights, notes, today } from "@/db";

export const dynamic = "force-dynamic";

const HEATMAP_DAYS = 112; // 16 semanas

function addDays(iso: string, delta: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** GET /api/dashboard — sequência de dias, mapa de calor, capítulos recentes e totais. */
export async function GET() {
  const db = await getDb();
  const now = today();
  const since = addDays(now, -(HEATMAP_DAYS - 1));

  const [days, recent, [hlCount], [noteCount], [doneCount]] = await Promise.all([
    db.select().from(activityDays).where(gte(activityDays.day, since)),
    db.select().from(chapterProgress).orderBy(desc(chapterProgress.updatedAt)).limit(6),
    db.select({ n: sql<number>`count(*)::int` }).from(highlights),
    db.select({ n: sql<number>`count(*)::int` }).from(notes),
    db.select({ n: sql<number>`count(*)::int` }).from(chapterProgress).where(sql`${chapterProgress.completed}`),
  ]);

  const byDay = new Map(days.map((d) => [String(d.day), d.events]));
  // Sequência: dias consecutivos com atividade terminando hoje (ou ontem, se hoje ainda não estudou).
  let streak = 0;
  let cursor = byDay.has(now) ? now : addDays(now, -1);
  while (byDay.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return NextResponse.json({
    today: now,
    streak,
    activity: Array.from({ length: HEATMAP_DAYS }, (_, i) => {
      const day = addDays(since, i);
      return { day, events: byDay.get(day) ?? 0 };
    }),
    recent: recent.map((r) => ({ key: r.chapterKey, percentRead: r.percentRead, completed: r.completed, updatedAt: r.updatedAt })),
    totals: { completed: doneCount.n, highlights: hlCount.n, notes: noteCount.n },
  });
}
