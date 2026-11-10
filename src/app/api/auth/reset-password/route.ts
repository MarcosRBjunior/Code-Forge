import { ResetPasswordInput } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { assertSameOrigin, noContent, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

/** Troca a senha com um token válido e revoga todas as sessões. Token ruim: 400 INVALID_RESET_TOKEN. */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, ResetPasswordInput);
  const { passwordReset } = await getAuth();
  await passwordReset.resetPassword(input);
  return noContent();
});
