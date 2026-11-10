/**
 * Erro de domínio com status HTTP. Os services lançam AppError; o wrapper HTTP (etapa 3) converte em
 * `{ error: { code, message, details? } }`. Qualquer outro erro vira 500 com mensagem genérica.
 */
export type AppErrorCode =
  | "VALIDATION_FAILED"
  | "BAD_REQUEST"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_ORIGIN"
  | "REGISTRATION_CLOSED"
  | "NOT_FOUND"
  | "EMAIL_IN_USE"
  | "INVALID_RESET_TOKEN"
  | "RATE_LIMITED"
  | "INTERNAL";

/*
 * Marca global (Symbol.for é compartilhado entre bundles). Em dev cada rota é um bundle com sua própria cópia
 * desta classe, e os services ficam num singleton em globalThis: `instanceof` falharia entre rotas.
 */
const APP_ERROR = Symbol.for("codeforge.AppError");

export class AppError extends Error {
  readonly [APP_ERROR] = true;

  /** Use no lugar de `instanceof AppError`. */
  static is(err: unknown): err is AppError {
    return typeof err === "object" && err !== null && (err as Record<symbol, unknown>)[APP_ERROR] === true;
  }

  constructor(
    readonly code: AppErrorCode,
    readonly status: number,
    message: string,
    readonly details?: unknown,
    /** Só para 429: vira o header Retry-After. */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  invalidCredentials: () => new AppError("INVALID_CREDENTIALS", 401, "Credenciais inválidas"),
  unauthenticated: () => new AppError("UNAUTHENTICATED", 401, "Faça login para continuar."),
  emailInUse: () => new AppError("EMAIL_IN_USE", 409, "Este e-mail já está cadastrado."),
  registrationClosed: () => new AppError("REGISTRATION_CLOSED", 403, "O cadastro está fechado no momento."),
  invalidResetToken: () => new AppError("INVALID_RESET_TOKEN", 400, "Link de redefinição inválido ou expirado."),
  rateLimited: (retryAfterSeconds: number) =>
    new AppError("RATE_LIMITED", 429, "Muitas tentativas. Tente novamente mais tarde.", undefined, retryAfterSeconds),
};
