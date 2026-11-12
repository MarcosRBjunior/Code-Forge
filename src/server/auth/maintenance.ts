import { lt } from "drizzle-orm";
import { passwordResetTokens, pendingRegistrations, rateLimits, sessions } from "@/server/db/schema/auth";
import { systemClock, type AuthDb, type Clock, type Logger } from "./deps";

/**
 * Por quanto tempo um registro de limite de tentativas (chave com IP, hash de e-mail ou id da conta) fica guardado
 * depois de a janela abrir. A maior janela é de 1 h; 24 h dão folga e é o prazo que a política de privacidade promete.
 */
export const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;

/** De quanto em quanto tempo a limpeza roda enquanto o servidor está de pé (e sempre uma vez na subida). */
export const MAINTENANCE_INTERVAL_MS = 60 * 60 * 1000;

export interface MaintenanceResult {
  rateLimits: number;
  sessions: number;
  passwordResetTokens: number;
  pendingRegistrations: number;
}

/**
 * Apaga o que já venceu: registros de limite de tentativas com mais de 24 h (guardam IP), sessões expiradas,
 * links de redefinição vencidos e cadastros não confirmados vencidos. Idempotente; seguro com várias réplicas.
 */
export async function purgeExpired(db: AuthDb, clock: Clock = systemClock): Promise<MaintenanceResult> {
  const now = clock();
  const rateLimitCutoff = new Date(now.getTime() - RATE_LIMIT_RETENTION_MS);
  const count = async (q: Promise<unknown[]>) => (await q).length;
  return {
    rateLimits: await count(
      db.delete(rateLimits).where(lt(rateLimits.windowStart, rateLimitCutoff)).returning({ k: rateLimits.key }),
    ),
    sessions: await count(db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id })),
    passwordResetTokens: await count(
      db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, now)).returning({ id: passwordResetTokens.id }),
    ),
    pendingRegistrations: await count(
      db.delete(pendingRegistrations).where(lt(pendingRegistrations.expiresAt, now)).returning({ id: pendingRegistrations.id }),
    ),
  };
}

/**
 * Roda a limpeza agora e depois a cada hora, sem segurar o processo (timer unref). O app escala a zero réplicas,
 * então a rodada da subida é a que mais acontece: toda vez que alguém volta a usar, o vencido é apagado.
 * Falha só é registrada no log (sem dados pessoais); a próxima rodada tenta de novo.
 */
export function startMaintenance(getDb: () => Promise<AuthDb>, logger: Logger, clock: Clock = systemClock): () => void {
  const run = async () => {
    try {
      const result = await purgeExpired(await getDb(), clock);
      logger.info("limpeza periódica concluída", { ...result });
    } catch (err) {
      // Erro do drizzle traz a consulta inteira; a causa (erro do Postgres) é o que interessa.
      const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err;
      const message = cause instanceof Error ? cause.message : String(cause);
      logger.error("limpeza periódica falhou", { error: message.slice(0, 300) });
    }
  };
  void run();
  const timer = setInterval(() => void run(), MAINTENANCE_INTERVAL_MS);
  timer.unref?.();
  return () => clearInterval(timer);
}
