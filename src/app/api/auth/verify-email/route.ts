import { VerifyEmailInput, type UserResponse } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { setSessionCookie } from "@/server/auth/current-user";
import { assertSameOrigin, json, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

/** Confirma o e-mail: cria a conta e abre a sessão. Link ruim: 400 INVALID_VERIFICATION_TOKEN. */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, VerifyEmailInput);
  const { registration } = await getAuth();
  const { user, session } = await registration.verifyEmail(input);
  await setSessionCookie(session);
  return json<UserResponse>({ user }, 201);
});
