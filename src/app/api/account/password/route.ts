import { getAuth } from "@/server/auth/container";
import { changePasswordRoute } from "@/server/auth/account-routes";

export const runtime = "nodejs";

/** Troca a senha com a sessão aberta (exige a atual) e encerra as outras sessões. Senha errada: 400 WRONG_PASSWORD. */
export const POST = changePasswordRoute(getAuth);
