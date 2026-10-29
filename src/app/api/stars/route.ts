import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, stars } from "@/db";
import { ChapterKey, parseBody } from "@/lib/api";

const StarBody = z.object({ key: ChapterKey });

export async function PUT(req: Request) {
  const body = await parseBody(req, StarBody);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  await db.insert(stars).values({ chapterKey: body.key }).onConflictDoNothing();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: Request) {
  const body = await parseBody(req, StarBody);
  if (body instanceof NextResponse) return body;
  const db = await getDb();
  await db.delete(stars).where(eq(stars.chapterKey, body.key));
  return new NextResponse(null, { status: 204 });
}
