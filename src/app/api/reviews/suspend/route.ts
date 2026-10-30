import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, reviewCards } from "@/db";
import { apiError, parseBody } from "@/lib/api";

const SuspendBody = z.object({
  id: z.string().regex(/^(problem:[a-z0-9-]+\/[a-z0-9-]+|highlight:[0-9a-f-]{36})$/).max(240),
  suspended: z.boolean(),
});

/** POST /api/reviews/suspend — para (ou retoma) a revisão de um cartão, sem apagar o histórico dele. */
export async function POST(req: Request) {
  const body = await parseBody(req, SuspendBody);
  if (body instanceof NextResponse) return body;

  const db = await getDb();
  const updated = await db.update(reviewCards).set({ suspended: body.suspended }).where(eq(reviewCards.id, body.id)).returning({ id: reviewCards.id });
  if (!updated.length) return apiError(404, "NOT_FOUND", "Cartão não encontrado.");
  return new NextResponse(null, { status: 204 });
}
