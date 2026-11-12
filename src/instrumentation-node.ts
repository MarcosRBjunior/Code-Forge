/**
 * Subida do servidor (só Node): valida as variáveis de ambiente antes de atender requisições e liga a limpeza
 * periódica do que já venceu (limites de tentativas com IP, sessões, links e cadastros pendentes).
 */
import { getEnv } from "@/server/env";
import { getDb } from "@/db";
import { startMaintenance } from "@/server/auth/maintenance";
import { consoleLogger } from "@/server/auth/deps";

getEnv();

const g = globalThis as unknown as { cfMaintenance?: boolean };
if (!g.cfMaintenance) {
  g.cfMaintenance = true;
  startMaintenance(getDb, consoleLogger);
}
