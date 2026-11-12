import { getAuth } from "@/server/auth/container";
import { deleteAccountRoute } from "@/server/auth/account-routes";

export const runtime = "nodejs";

/** Apaga a conta e todos os dados dela (exige a senha atual) e limpa o cookie. Senha errada: 400 WRONG_PASSWORD. */
export const DELETE = deleteAccountRoute(getAuth);
