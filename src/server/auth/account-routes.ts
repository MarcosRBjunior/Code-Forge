import { ChangePasswordInput, DeleteAccountInput } from "@/contracts/api";
import { Errors } from "@/server/errors";
import { assertSameOrigin, noContent, parseJson, withErrorHandling } from "@/server/http";
import type { AccountService } from "./account-service";
import type { SessionService } from "./session-service";
import { sessionCookieName, sessionCookieOptions } from "./cookie";

/*
 * Handlers das rotas de /api/account, montados com as dependências injetadas: as rotas passam getAuth(), os testes
 * passam services sobre PGlite. Diferente de authorize(), o token vem do header Cookie da própria requisição e o
 * cookie de resposta vai na própria resposta (sem cookies() do Next), para que a rota inteira (Origin, sessão,
 * corpo, service, cookie) rode nos testes.
 */

export interface AccountRouteDeps {
  account: AccountService;
  sessions: SessionService;
  production: boolean;
}

type LoadDeps = () => Promise<AccountRouteDeps>;

/** Valor de um cookie no header da requisição (os nossos tokens são base64url: não precisam de decodificação). */
export function readRequestCookie(req: Request, name: string): string | undefined {
  for (const part of req.headers.get("cookie")?.split(";") ?? []) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

async function requireSession(req: Request, { sessions, production }: AccountRouteDeps) {
  const token = readRequestCookie(req, sessionCookieName(production));
  const session = await sessions.validate(token);
  if (!session || !token) throw Errors.unauthenticated();
  return { ...session, token };
}

/** POST /api/account/password — troca a senha (exige a atual) e encerra as outras sessões. 204. */
export function changePasswordRoute(load: LoadDeps) {
  return withErrorHandling(async (req) => {
    assertSameOrigin(req);
    const deps = await load();
    const session = await requireSession(req, deps);
    const input = await parseJson(req, ChangePasswordInput);
    await deps.account.changePassword({ userId: session.user.id, sessionId: session.sessionId }, input);
    const res = noContent();
    // A sessão atual continua; se a validação a renovou (sliding), reenvia o cookie com a nova validade.
    if (session.renewed) {
      res.cookies.set(sessionCookieName(deps.production), session.token, sessionCookieOptions(deps.production, session.expiresAt));
    }
    return res;
  });
}

/** DELETE /api/account — apaga a conta e todos os dados (exige a senha) e limpa o cookie. 204. */
export function deleteAccountRoute(load: LoadDeps) {
  return withErrorHandling(async (req) => {
    assertSameOrigin(req);
    const deps = await load();
    const session = await requireSession(req, deps);
    const input = await parseJson(req, DeleteAccountInput);
    await deps.account.deleteAccount({ userId: session.user.id, sessionId: session.sessionId }, input);
    const res = noContent();
    res.cookies.set(sessionCookieName(deps.production), "", sessionCookieOptions(deps.production, new Date(0)));
    return res;
  });
}
