import { NextResponse } from "next/server";
import { getReview } from "@/lib/reviews";
import { authorize } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

/** GET /api/reviews — fila de revisão de hoje; com ?summary=1 devolve só as contagens (selo do menu). */
export async function GET(req: Request) {
  const denied = await authorize(req);
  if (denied instanceof Response) return denied;
  const { today, queue, counts } = await getReview();
  if (new URL(req.url).searchParams.get("summary")) return NextResponse.json({ today, counts });
  return NextResponse.json({ today, queue, counts });
}
