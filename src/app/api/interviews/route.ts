import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { getDb, mockInterviews, recordActivity } from "@/db";
import { parseBody } from "@/lib/api";

export const dynamic = "force-dynamic";

const Score = z.number().int().min(1).max(4);
const SaveInterview = z.object({
  id: z.string().uuid(),
  config: z.object({
    style: z.enum(["strict", "standard", "coaching"]),
    level: z.enum(["new-grad", "mid", "senior"]),
    noRun: z.boolean(),
    mix: z.object({ easy: z.number().int().min(0).max(3), medium: z.number().int().min(0).max(3), hard: z.number().int().min(0).max(3) }),
  }),
  problems: z.array(z.object({ key: z.string().max(200), title: z.string().max(200), difficulty: z.string().max(10), solved: z.boolean() })).max(9),
  scores: z.object({
    understanding: Score,
    approach: Score,
    implementation: Score,
    testing: Score,
    complexity: Score,
    communication: Score,
  }),
  total: z.number().int().min(0).max(100),
  notes: z.string().max(5000).default(""),
  durationS: z.number().int().min(0).max(4 * 3600),
});

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(mockInterviews).orderBy(desc(mockInterviews.createdAt)).limit(30);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await parseBody(req, SaveInterview);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  await db.insert(mockInterviews).values(body).onConflictDoNothing();
  await recordActivity(db);
  return new NextResponse(null, { status: 201 });
}
