import { RegisterInput } from "@/contracts/api";
import { getAuth } from "@/server/auth/container";
import { getClientIp } from "@/server/auth/client-ip";
import { assertSameOrigin, json, parseJson, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";

const REGISTER_MESSAGE = "Enviamos um link de confirmação para o seu e-mail";

/**
 * Pede o cadastro. Resposta SEMPRE igual (202), tenha o e-mail conta ou não: o link de confirmação (ou o aviso de
 * conta existente) segue por e-mail. A conta só nasce em /api/auth/verify-email.
 */
export const POST = withErrorHandling(async (req) => {
  assertSameOrigin(req);
  const input = await parseJson(req, RegisterInput);
  const { registration } = await getAuth();
  await registration.register(input, { ip: getClientIp(req.headers) });
  return json({ message: REGISTER_MESSAGE }, 202);
});
