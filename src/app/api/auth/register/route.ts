import { RegisterInput, type UserResponse } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { getClientIp } from "@/server/auth/client-ip";
import { setSessionCookie } from "@/server/auth/current-user";
import { assertSameOrigin, json, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

/** Cria a conta e já abre a sessão. 201 + usuário público. */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, RegisterInput);
  const { auth } = await getAuth();
  const { user, session } = await auth.register(input, { ip: getClientIp(req.headers) });
  await setSessionCookie(session);
  return json<UserResponse>({ user }, 201);
});
