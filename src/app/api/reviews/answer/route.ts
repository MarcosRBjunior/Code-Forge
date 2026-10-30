import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, recordActivity, reviewCards, today } from "@/db";
import { apiError, parseBody } from "@/lib/api";
import { addDays, schedule, type Rating } from "@/lib/srs";

const CardId = z.string().regex(/^(problem:[a-z0-9-]+\/[a-z0-9-]+|highlight:[0-9a-f-]{36})$/).max(240);
const AnswerBody = z.object({ id: CardId, rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) });

/** POST /api/reviews/answer — registra a nota de um cartão e agenda a próxima revisão. */
export async function POST(req: Request) {
  const body = await parseBody(req, AnswerBody);
  if (body instanceof NextResponse) return body;

  const db = await getDb();
  const [card] = await db.select().from(reviewCards).where(eq(reviewCards.id, body.id));
  if (!card) return apiError(404, "NOT_FOUND", "Cartão não encontrado.");

  const next = schedule(
    { ease: card.ease, intervalDays: card.intervalDays, reps: card.reps, lapses: card.lapses },
    body.rating as Rating,
  );
  const now = today();
  const due = addDays(now, next.intervalDays);
  await db
    .update(reviewCards)
    .set({ ...next, due, lastReviewed: now, firstReviewed: card.firstReviewed ?? now })
    .where(eq(reviewCards.id, body.id));
  await recordActivity(db);

  return NextResponse.json({ id: body.id, due, intervalDays: next.intervalDays });
}
