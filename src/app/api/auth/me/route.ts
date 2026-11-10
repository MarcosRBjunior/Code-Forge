import type { UserResponse } from "@/contracts/api";
import { toPublicUser } from "@/server/auth/users";
import { requireAuth } from "@/server/auth/current-user";
import { json, withErrorHandling } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Usuário da sessão atual, sem hash. 401 sem sessão válida. */
export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  return json<UserResponse>({ user: toPublicUser(user) });
});
