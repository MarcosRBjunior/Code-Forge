import "server-only";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { AppError } from "@/server/errors";
import { getEnv } from "@/server/env";
import { isAllowedOrigin } from "@/server/auth/origin";

/**
 * Camada HTTP compartilhada: formato único de erro `{ error: { code, message, details? } }`,
 * leitura de JSON com Zod e checagem de Origin (CSRF).
 */

const NO_STORE = { "Cache-Control": "no-store" };

export function errorResponse(err: AppError): NextResponse {
  const headers: Record<string, string> = { ...NO_STORE };
  if (err.retryAfterSeconds !== undefined) headers["Retry-After"] = String(err.retryAfterSeconds);
  const body = { error: { code: err.code, message: err.message, ...(err.details !== undefined && { details: err.details }) } };
  return NextResponse.json(body, { status: err.status, headers });
}

export function json<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

/** Converte erro em resposta. AppError sai como está; qualquer outro vira 500 genérico, com detalhe só no log. */
export function toErrorResponse(err: unknown): NextResponse {
  if (AppError.is(err)) return errorResponse(err);
  if (err instanceof ZodError) return errorResponse(validationError(err));
  // Uma linha só (o stack vai com \n escapado): no Log Analytics cada linha do console vira um registro.
  console.error(
    "erro não tratado na API " +
      JSON.stringify(err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : { error: String(err) }),
  );
  return errorResponse(new AppError("INTERNAL", 500, "Erro interno. Tente novamente."));
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wrapper dos route handlers: tudo que for lançado vira o formato padrão de erro. */
export function withErrorHandling<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

function validationError(err: ZodError): AppError {
  return new AppError("VALIDATION_FAILED", 400, "Dados inválidos.", z.flattenError(err).fieldErrors);
}

/** Corpo JSON validado pelo schema. Exige application/json (outro site não manda isso sem preflight de CORS). */
export async function parseJson<T extends z.ZodType>(req: Request, schema: T): Promise<z.output<T>> {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new AppError("UNSUPPORTED_MEDIA_TYPE", 415, "Envie o corpo como application/json.");
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AppError("BAD_REQUEST", 400, "Corpo da requisição não é um JSON válido.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** CSRF: em método mutante, o Origin tem de ser exatamente APP_URL. Ausente ou diferente: 403. */
export function assertSameOrigin(req: Request): void {
  if (SAFE_METHODS.has(req.method)) return;
  if (!isAllowedOrigin(req.headers.get("origin"), getEnv().APP_URL)) {
    throw new AppError("INVALID_ORIGIN", 403, "Origem da requisição não permitida.");
  }
}
