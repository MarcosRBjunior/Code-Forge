import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { apiError, ChapterKey, HighlightColor, parseBody } from "@/lib/api";
import { authorize } from "@/server/auth/current-user";
import { toErrorResponse } from "@/server/http";
import { createHighlight, deleteHighlight, updateHighlightColor } from "@/server/study/annotations";

const CreateHighlight = z
  .object({
    id: z.string().uuid(), // gerado no cliente (criação otimista)
    key: ChapterKey,
    color: HighlightColor,
    blockId: z.string().max(64),
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(1),
    quote: z.string().min(1).max(5000),
  })
  .refine((h) => h.endOffset > h.startOffset, { message: "endOffset deve ser maior que startOffset", path: ["endOffset"] });

const UpdateHighlight = z.object({ id: z.string().uuid(), color: HighlightColor });

export async function POST(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, CreateHighlight);
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json(await createHighlight(await getDb(), user.id, body), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const body = await parseBody(req, UpdateHighlight);
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json(await updateHighlightColor(await getDb(), user.id, body.id, body.color));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(req: Request) {
  const user = await authorize(req);
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return apiError(422, "VALIDATION_FAILED", "id inválido.");
  await deleteHighlight(await getDb(), user.id, id);
  return new NextResponse(null, { status: 204 });
}
