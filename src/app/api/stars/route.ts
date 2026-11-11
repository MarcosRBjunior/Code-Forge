import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { setStar } from "@/server/study/progress";
import { ChapterKey, parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";

const StarBody = z.object({ key: ChapterKey });

export async function PUT(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, StarBody);
  if (body instanceof NextResponse) return body;
  await setStar(await getDb(), user.id, body.key, true);
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, StarBody);
  if (body instanceof NextResponse) return body;
  await setStar(await getDb(), user.id, body.key, false);
  return new NextResponse(null, { status: 204 });
}
