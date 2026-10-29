import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, chapterProgress, recordActivity } from "@/db";
import { ChapterKey, parseBody } from "@/lib/api";

const UpsertProgress = z.object({
  key: ChapterKey,
  percentRead: z.number().int().min(0).max(100).optional(),
  lastBlockId: z.string().max(64).optional(),
  completed: z.boolean().optional(),
});

/** PUT /api/progress — idempotente; percentRead só cresce. Também aceita POST (navigator.sendBeacon). */
export async function PUT(req: Request) {
  const body = await parseBody(req, UpsertProgress);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  const now = new Date();
  await db
    .insert(chapterProgress)
    .values({
      chapterKey: body.key,
      percentRead: body.completed ? 100 : (body.percentRead ?? 0),
      lastBlockId: body.lastBlockId,
      completed: body.completed ?? false,
      completedAt: body.completed ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: chapterProgress.chapterKey,
      set: {
        percentRead:
          body.completed === true
            ? sql`100`
            : sql`greatest(${chapterProgress.percentRead}, ${body.percentRead ?? 0})`,
        lastBlockId: body.lastBlockId ? body.lastBlockId : sql`${chapterProgress.lastBlockId}`,
        completed: body.completed ?? sql`${chapterProgress.completed}`,
        completedAt:
          body.completed === undefined
            ? sql`${chapterProgress.completedAt}`
            : body.completed
              ? sql`coalesce(${chapterProgress.completedAt}, now())`
              : null,
        updatedAt: now,
      },
    });
  await recordActivity(db);
  return new NextResponse(null, { status: 204 });
}

export const POST = PUT;
