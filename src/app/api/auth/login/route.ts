import { LoginInput, type UserResponse } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { getClientIp } from "@/server/auth/client-ip";
import { setSessionCookie } from "@/server/auth/current-user";
import { assertSameOrigin, json, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

/** Valida as credenciais e abre a sessão. 401 "Credenciais inválidas" para e-mail inexistente ou senha errada. */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, LoginInput);
  const { auth } = await getAuth();
  const { user, session } = await auth.login(input, { ip: getClientIp(req.headers) });
  await setSessionCookie(session);
  return json<UserResponse>({ user });
});
