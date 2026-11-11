import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { upsertProgress } from "@/server/study/progress";
import { ChapterKey, parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";

const UpsertProgress = z.object({
  key: ChapterKey,
  percentRead: z.number().int().min(0).max(100).optional(),
  lastBlockId: z.string().max(64).optional(),
  completed: z.boolean().optional(),
});

/** PUT /api/progress — idempotente; percentRead só cresce. Também aceita POST (navigator.sendBeacon). */
export async function PUT(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, UpsertProgress);
  if (body instanceof NextResponse) return body;
  await upsertProgress(await getDb(), user.id, body);
  return new NextResponse(null, { status: 204 });
}

export const POST = PUT;
