import { getAuth } from "@/server/auth/container";
import { clearSessionCookie, readSessionToken } from "@/server/auth/current-user";
import { assertSameOrigin, noContent, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

/** Revoga a sessão e limpa o cookie. Sessão ausente ou já inválida também responde 204. */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const { auth } = await getAuth();
  await auth.logout(await readSessionToken());
  await clearSessionCookie();
  return noContent();
});
