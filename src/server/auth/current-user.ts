import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { Errors } from "@/server/errors";
import { assertSameOrigin, toErrorResponse } from "@/server/http";
import { getAuth } from "./container";
import { sessionCookieName, sessionCookieOptions } from "./cookie";
import type { IssuedSession, SessionUser } from "./session-service";

/*
 * Validação REAL da sessão (o middleware só olha se o cookie existe).
 * Use em route handlers e Server Components.
 */

async function cookieName(): Promise<string> {
  return sessionCookieName((await getAuth()).production);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(await cookieName())?.value;
}

export async function setSessionCookie(session: IssuedSession): Promise<void> {
  const { production } = await getAuth();
  (await cookies()).set(sessionCookieName(production), session.token, sessionCookieOptions(production, session.expiresAt));
}

export async function clearSessionCookie(): Promise<void> {
  const { production } = await getAuth();
  (await cookies()).set(sessionCookieName(production), "", sessionCookieOptions(production, new Date(0)));
}

/** Usuário da sessão atual, ou null. Renova o cookie quando a sessão foi estendida (sliding). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { sessions } = await getAuth();
  const token = await readSessionToken();
  const session = await sessions.validate(token);
  if (!session) return null;
  if (session.renewed && token) {
    try {
      await setSessionCookie({ token, expiresAt: session.expiresAt });
    } catch {
      // Server Components não podem gravar cookie; a próxima chamada de API renova.
    }
  }
  return session.user;
}

/** Como getCurrentUser, mas lança 401 (AppError) sem sessão válida. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw Errors.unauthenticated();
  return user;
}

/**
 * Para as rotas antigas, no estilo de `parseBody`: devolve o usuário ou a resposta de erro pronta.
 * Inclui a checagem de Origin (CSRF) nos métodos mutantes.
 *   const user = await authorize(req); if (user instanceof Response) return user;
 */
export async function authorize(req: Request): Promise<SessionUser | NextResponse> {
  try {
    assertSameOrigin(req);
    return await requireAuth();
  } catch (err) {
    return toErrorResponse(err);
  }
}
