import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

/** Chave de capítulo "<curso>/<capitulo>" — só slugs válidos. */
export const ChapterKey = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/).max(200);
export const HighlightColor = z.enum(["yellow", "green", "blue", "pink", "purple"]);

export function apiError(status: number, code: string, message: string, fields?: Record<string, string[]>) {
  return NextResponse.json({ error: { code, message, ...(fields && { fields }) } }, { status });
}

/** Valida o corpo JSON com Zod e converte falhas em 400/422 no formato padrão de erro. */
export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T> | NextResponse> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError(400, "BAD_REQUEST", "Corpo da requisição não é um JSON válido.");
  }
  try {
    return schema.parse(json);
  } catch (err) {
    if (err instanceof ZodError) {
      return apiError(422, "VALIDATION_FAILED", "Dados inválidos.", err.flatten().fieldErrors as Record<string, string[]>);
    }
    throw err;
  }
}
