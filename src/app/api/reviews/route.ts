import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getAllChapters } from "@/lib/content";
import { authorize } from "@/server/auth/current-user";
import { getReview } from "@/server/study/reviews";

export const dynamic = "force-dynamic";

/** GET /api/reviews — fila de revisão de hoje do usuário; com ?summary=1 devolve só as contagens (selo do menu). */
export async function GET(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const { today, queue, counts } = await getReview(await getDb(), user.id, await getAllChapters());
  if (new URL(req.url).searchParams.get("summary")) return NextResponse.json({ today, counts });
  return NextResponse.json({ today, queue, counts });
}
