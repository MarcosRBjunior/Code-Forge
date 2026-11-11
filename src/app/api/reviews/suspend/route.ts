import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { toErrorResponse } from "@/server/http";
import { suspendCard } from "@/server/study/reviews";

const SuspendBody = z.object({
  id: z.string().regex(/^(problem:[a-z0-9-]+\/[a-z0-9-]+|highlight:[0-9a-f-]{36})$/).max(240),
  suspended: z.boolean(),
});

/** POST /api/reviews/suspend — para (ou retoma) a revisão de um cartão, sem apagar o histórico dele. */
export async function POST(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, SuspendBody);
  if (body instanceof NextResponse) return body;
  try {
    await suspendCard(await getDb(), user.id, body.id, body.suspended);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
