import { lt, sql } from "drizzle-orm";
import { rateLimits } from "@/server/db/schema/auth";
import { hashToken } from "./tokens";
import { systemClock, type AuthDb, type Clock } from "./deps";
import { Errors } from "@/server/errors";

export interface RateLimitRule {
  /** Prefixo da chave, ex.: "login:ip". */
  name: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Segundos até a janela reabrir (header Retry-After). */
  retryAfterSeconds: number;
}

/** Contrato estável: a implementação Postgres pode ser trocada por Redis sem mexer nos services. */
export interface RateLimiter {
  consume(rule: RateLimitRule, subject: string): Promise<RateLimitResult>;
}

const MIN15 = 15 * 60 * 1000;

export const RATE_LIMITS = {
  loginIp: { name: "login:ip", limit: 10, windowMs: MIN15 },
  loginEmail: { name: "login:email", limit: 5, windowMs: MIN15 },
  registerIp: { name: "register:ip", limit: 10, windowMs: MIN15 },
  /** Cada cadastro manda um e-mail: limita quantos chegam à mesma caixa (vale igual exista a conta ou não). */
  registerEmail: { name: "register:email", limit: 3, windowMs: MIN15 },
  forgotIp: { name: "forgot:ip", limit: 5, windowMs: MIN15 },
  forgotEmail: { name: "forgot:email", limit: 3, windowMs: MIN15 },
  /** O tutor consome créditos da Anthropic. */
  tutorUser: { name: "tutor:user", limit: 30, windowMs: 60 * 60 * 1000 },
  /** /api/run chama o Judge0 (serviço externo; a instância pública é compartilhada): 2 por minuto em média. */
  runUser: { name: "run:user", limit: 30, windowMs: MIN15 },
} satisfies Record<string, RateLimitRule>;

/** E-mails entram na chave como hash: a tabela de limites não guarda dado pessoal em claro. */
export function emailSubject(normalizedEmail: string): string {
  return hashToken(normalizedEmail);
}

/**
 * Janela fixa no Postgres, com um único UPSERT atômico (sem corrida entre réplicas):
 * se a janela venceu, recomeça em 1; senão incrementa.
 */
export class PostgresRateLimiter implements RateLimiter {
  constructor(
    private readonly db: AuthDb,
    private readonly clock: Clock = systemClock,
  ) {}

  async consume(rule: RateLimitRule, subject: string): Promise<RateLimitResult> {
    const now = this.clock();
    const windowOpenedAfter = new Date(now.getTime() - rule.windowMs);
    const expired = sql`${rateLimits.windowStart} <= ${windowOpenedAfter.toISOString()}::timestamptz`;

    const [row] = await this.db
      .insert(rateLimits)
      .values({ key: `${rule.name}:${subject}`, count: 1, windowStart: now })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE WHEN ${expired} THEN 1 ELSE ${rateLimits.count} + 1 END`,
          windowStart: sql`CASE WHEN ${expired} THEN ${now.toISOString()}::timestamptz ELSE ${rateLimits.windowStart} END`,
        },
      })
      .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });

    const resetAt = row.windowStart.getTime() + rule.windowMs;
    return {
      allowed: row.count <= rule.limit,
      remaining: Math.max(0, rule.limit - row.count),
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000)),
    };
  }

  /** Limpeza de janelas vencidas (pode rodar num job periódico). */
  async purgeOlderThan(windowMs: number): Promise<void> {
    await this.db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(this.clock().getTime() - windowMs)));
  }
}

/**
 * Consome todas as regras (cada tentativa conta em todas) e lança 429 se alguma estourou,
 * com o maior Retry-After entre as que estouraram.
 */
export async function enforceRateLimits(
  limiter: RateLimiter,
  checks: ReadonlyArray<readonly [RateLimitRule, string]>,
): Promise<void> {
  const results = await Promise.all(checks.map(([rule, subject]) => limiter.consume(rule, subject)));
  const blocked = results.filter((r) => !r.allowed);
  if (blocked.length) throw Errors.rateLimited(Math.max(...blocked.map((r) => r.retryAfterSeconds)));
}
