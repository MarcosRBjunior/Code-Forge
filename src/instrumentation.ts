/**
 * Roda uma vez na subida do servidor Next. O código só de Node (env, banco, limpeza periódica) fica em
 * instrumentation-node.ts: com o import atrás do NEXT_RUNTIME, o bundle edge não puxa o driver do Postgres.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
