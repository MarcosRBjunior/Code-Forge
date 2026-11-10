/** Roda uma vez na subida do servidor Next: valida as variáveis de ambiente antes de atender requisições. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getEnv } = await import("@/server/env");
  getEnv();
}
