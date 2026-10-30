import { NextResponse } from "next/server";
import { getReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/** GET /api/reviews — fila de revisão de hoje; com ?summary=1 devolve só as contagens (selo do menu). */
export async function GET(req: Request) {
  const { today, queue, counts } = await getReview();
  if (new URL(req.url).searchParams.get("summary")) return NextResponse.json({ today, counts });
  return NextResponse.json({ today, queue, counts });
}
