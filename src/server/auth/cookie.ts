/*
 * Nome e opções do cookie de sessão. Sem dependências de Node: também é importado pelo middleware (Edge).
 * `__Host-` exige Secure, Path=/ e nenhum Domain; por isso só em produção (em http://localhost não funcionaria).
 */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieName(production: boolean): string {
  return production ? "__Host-session" : "session";
}

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  expires: Date;
}

export function sessionCookieOptions(production: boolean, expires: Date): SessionCookieOptions {
  return { httpOnly: true, secure: production, sameSite: "lax", path: "/", expires };
}
