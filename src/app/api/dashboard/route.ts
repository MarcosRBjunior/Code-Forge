import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { authorize } from "@/server/auth/current-user";
import { getDashboard } from "@/server/study/progress";

export const dynamic = "force-dynamic";

/** GET /api/dashboard — sequência de dias, mapa de calor, capítulos recentes e totais do usuário. */
export async function GET(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  return NextResponse.json(await getDashboard(await getDb(), user.id));
}
