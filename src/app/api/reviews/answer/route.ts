import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { parseBody } from "@/lib/api";
import type { Rating } from "@/lib/srs";
import { authorize } from "@/server/auth/current-user";
import { toErrorResponse } from "@/server/http";
import { answerCard } from "@/server/study/reviews";

const CardId = z.string().regex(/^(problem:[a-z0-9-]+\/[a-z0-9-]+|highlight:[0-9a-f-]{36})$/).max(240);
const AnswerBody = z.object({ id: CardId, rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) });

/** POST /api/reviews/answer — registra a nota de um cartão e agenda a próxima revisão. */
export async function POST(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, AnswerBody);
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json(await answerCard(await getDb(), user.id, body.id, body.rating as Rating));
  } catch (err) {
    return toErrorResponse(err);
  }
}
