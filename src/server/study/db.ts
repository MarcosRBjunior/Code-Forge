import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { activityDays } from "@/server/db/schema/study";

/*
 * Dados de estudo por usuário. REGRA: toda função deste módulo recebe o userId da sessão e filtra por ele.
 * Nunca exponha aqui uma consulta sem `user_id` no WHERE (ou no valor inserido).
 */

/** Postgres (node-postgres) ou PGlite. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StudyDb = PgDatabase<PgQueryResultHKT, any>;

const studyTz = () => process.env.TZ_STUDY ?? "America/Sao_Paulo";

/** Dia (YYYY-MM-DD) de um instante no fuso de estudo (America/Sao_Paulo por padrão). */
export function dayOf(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: studyTz() }).format(date);
}

/** Dia de hoje no fuso de estudo. */
export function today(): string {
  return dayOf(new Date());
}

/** Registra atividade de estudo do usuário no dia (alimenta a sequência de dias e o mapa de calor). */
export async function recordActivity(db: StudyDb, userId: string): Promise<void> {
  await db
    .insert(activityDays)
    .values({ userId, day: today(), events: 1 })
    .onConflictDoUpdate({ target: [activityDays.userId, activityDays.day], set: { events: sql`${activityDays.events} + 1` } });
}
