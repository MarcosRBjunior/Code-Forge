import "server-only";
import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, uuid, boolean, date } from "drizzle-orm/pg-core";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

/*
 * Modo pessoal: um único estudante, sem tabela de usuários.
 * Local: PGlite (Postgres embutido, arquivo em .data/). Produção (Vercel): Neon free via DATABASE_URL.
 * chapter_key = "<curso>/<capitulo>".
 */
export const chapterProgress = pgTable("chapter_progress", {
  chapterKey: text("chapter_key").primaryKey(),
  percentRead: integer("percent_read").notNull().default(0),
  lastBlockId: text("last_block_id"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stars = pgTable("stars", {
  chapterKey: text("chapter_key").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").primaryKey(),
  chapterKey: text("chapter_key").notNull(),
  color: text("color").notNull(),
  blockId: text("block_id").notNull(),
  startOffset: integer("start_offset").notNull(),
  endOffset: integer("end_offset").notNull(),
  quote: text("quote").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey(),
  chapterKey: text("chapter_key").notNull(),
  highlightId: uuid("highlight_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const drafts = pgTable("code_drafts", {
  chapterKey: text("chapter_key").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityDays = pgTable("activity_days", {
  day: date("day").primaryKey(),
  events: integer("events").notNull().default(0),
});

const DDL = [
  `CREATE TABLE IF NOT EXISTS chapter_progress (
     chapter_key text PRIMARY KEY,
     percent_read integer NOT NULL DEFAULT 0 CHECK (percent_read BETWEEN 0 AND 100),
     last_block_id text,
     completed boolean NOT NULL DEFAULT false,
     completed_at timestamptz,
     updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS stars (
     chapter_key text PRIMARY KEY,
     created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS highlights (
     id uuid PRIMARY KEY,
     chapter_key text NOT NULL,
     color text NOT NULL CHECK (color IN ('yellow','green','blue','pink','purple')),
     block_id text NOT NULL,
     start_offset integer NOT NULL CHECK (start_offset >= 0),
     end_offset integer NOT NULL,
     quote text NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now(),
     CHECK (end_offset > start_offset))`,
  `CREATE INDEX IF NOT EXISTS highlights_chapter_idx ON highlights (chapter_key)`,
  `CREATE TABLE IF NOT EXISTS notes (
     id uuid PRIMARY KEY,
     chapter_key text NOT NULL,
     highlight_id uuid REFERENCES highlights(id) ON DELETE SET NULL,
     body text NOT NULL CHECK (char_length(body) <= 20000),
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS notes_chapter_idx ON notes (chapter_key)`,
  `CREATE TABLE IF NOT EXISTS code_drafts (
     chapter_key text NOT NULL,
     language text NOT NULL,
     code text NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now(),
     PRIMARY KEY (chapter_key, language))`,
  `CREATE TABLE IF NOT EXISTS activity_days (
     day date PRIMARY KEY,
     events integer NOT NULL DEFAULT 0)`,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<PgQueryResultHKT, any>;

const globalForDb = globalThis as unknown as { cfDb?: Promise<Db> };

async function connect(): Promise<Db> {
  let db: Db;
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    db = drizzle(neon(process.env.DATABASE_URL)) as unknown as Db;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { mkdirSync } = await import("node:fs");
    const dataDir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dataDir, { recursive: true });
    db = drizzle(new PGlite(dataDir)) as unknown as Db;
  }
  for (const stmt of DDL) await db.execute(sql.raw(stmt));
  return db;
}

/** Dia de hoje no fuso de estudo (America/Sao_Paulo por padrão), formato YYYY-MM-DD. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: process.env.TZ_STUDY ?? "America/Sao_Paulo" }).format(new Date());
}

/** Registra atividade de estudo no dia (alimenta a sequência de dias e o mapa de calor). */
export async function recordActivity(db: Db) {
  await db
    .insert(activityDays)
    .values({ day: today(), events: 1 })
    .onConflictDoUpdate({ target: activityDays.day, set: { events: sql`${activityDays.events} + 1` } });
}

/** Conexão única por processo (sobrevive ao hot reload em dev). */
export function getDb(): Promise<Db> {
  globalForDb.cfDb ??= connect().catch((err) => {
    globalForDb.cfDb = undefined;
    throw err;
  });
  return globalForDb.cfDb;
}
