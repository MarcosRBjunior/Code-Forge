import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { listInterviews, saveInterview } from "@/server/study/interviews";

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

export async function GET(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  return NextResponse.json(await listInterviews(await getDb(), user.id));
}

export async function POST(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, SaveInterview);
  if (body instanceof NextResponse) return body;
  await saveInterview(await getDb(), user.id, body);
  return new NextResponse(null, { status: 201 });
}
