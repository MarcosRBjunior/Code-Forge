import { ForgotPasswordInput } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { getClientIp } from "@/server/auth/client-ip";
import { assertSameOrigin, json, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

const MESSAGE = "Se o e-mail existir em nossa base, um link foi enviado";

/** Sempre a mesma resposta e o mesmo status, exista o e-mail ou não (o trabalho real roda depois da resposta). */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, ForgotPasswordInput);
  const { passwordReset } = await getAuth();
  await passwordReset.requestReset(input, { ip: getClientIp(req.headers) });
  return json({ message: MESSAGE });
});
