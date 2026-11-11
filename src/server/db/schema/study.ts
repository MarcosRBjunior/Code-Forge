import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

/*
 * Tabelas de estudo, uma "cópia" por usuário: toda linha tem user_id (FK para users, ON DELETE CASCADE)
 * e toda consulta da aplicação filtra por ele (src/server/study/).
 * chapter_key = "<curso>/<capitulo>".
 *
 * Os nomes de PK, CHECK e índices antigos repetem os que o Postgres deu quando estas tabelas eram criadas por
 * DDL solto (modo pessoal), para o snapshot do drizzle-kit bater com os bancos que já existiam.
 * A migração 0001 foi editada à mão (ver o comentário no topo dela).
 */

const userId = () =>
  uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const chapterProgress = pgTable(
  "chapter_progress",
  {
    userId: userId(),
    chapterKey: text("chapter_key").notNull(),
    percentRead: integer("percent_read").notNull().default(0),
    lastBlockId: text("last_block_id"),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ name: "chapter_progress_user_id_chapter_key_pk", columns: [t.userId, t.chapterKey] }),
    check("chapter_progress_percent_read_check", sql`${t.percentRead} BETWEEN 0 AND 100`),
  ],
);

export const stars = pgTable(
  "stars",
  {
    userId: userId(),
    chapterKey: text("chapter_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ name: "stars_user_id_chapter_key_pk", columns: [t.userId, t.chapterKey] })],
);

/** id gerado no cliente (criação otimista); único no banco inteiro, e (id, user_id) é alvo da FK das notas. */
export const highlights = pgTable(
  "highlights",
  {
    id: uuid("id").primaryKey(),
    userId: userId(),
    chapterKey: text("chapter_key").notNull(),
    color: text("color").notNull(),
    blockId: text("block_id").notNull(),
    startOffset: integer("start_offset").notNull(),
    endOffset: integer("end_offset").notNull(),
    quote: text("quote").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("highlights_id_user_id_unique").on(t.id, t.userId),
    index("highlights_user_id_chapter_key_idx").on(t.userId, t.chapterKey),
    check("highlights_color_check", sql`${t.color} IN ('yellow','green','blue','pink','purple')`),
    check("highlights_start_offset_check", sql`${t.startOffset} >= 0`),
    check("highlights_check", sql`${t.endOffset} > ${t.startOffset}`),
  ],
);

/**
 * A FK composta (highlight_id, user_id) impede ligar uma nota ao destaque de outro usuário.
 * No banco ela é ON DELETE SET NULL (highlight_id): só a coluna do destaque vira null, o user_id fica.
 * O drizzle não sabe declarar a lista de colunas, então aqui aparece como "set null" (a migração tem a forma real).
 */
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey(),
    userId: userId(),
    chapterKey: text("chapter_key").notNull(),
    highlightId: uuid("highlight_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "notes_highlight_id_user_id_fk",
      columns: [t.highlightId, t.userId],
      foreignColumns: [highlights.id, highlights.userId],
    }).onDelete("set null"),
    index("notes_user_id_chapter_key_idx").on(t.userId, t.chapterKey),
    check("notes_body_check", sql`char_length(${t.body}) <= 20000`),
  ],
);

export const drafts = pgTable(
  "code_drafts",
  {
    userId: userId(),
    chapterKey: text("chapter_key").notNull(),
    language: text("language").notNull(),
    code: text("code").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ name: "code_drafts_user_id_chapter_key_language_pk", columns: [t.userId, t.chapterKey, t.language] })],
);

export const mockInterviews = pgTable(
  "mock_interviews",
  {
    id: uuid("id").primaryKey(),
    userId: userId(),
    config: jsonb("config").notNull(),
    problems: jsonb("problems").notNull(),
    scores: jsonb("scores").notNull(),
    total: integer("total").notNull(),
    notes: text("notes").notNull().default(""),
    durationS: integer("duration_s").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("mock_interviews_user_id_created_at_idx").on(t.userId, t.createdAt),
    check("mock_interviews_total_check", sql`${t.total} BETWEEN 0 AND 100`),
  ],
);

/** Cartões de revisão espaçada. id = "problem:<curso>/<capitulo>" ou "highlight:<uuid>", único por usuário. */
export const reviewCards = pgTable(
  "review_cards",
  {
    userId: userId(),
    id: text("id").notNull(),
    kind: text("kind").notNull(),
    ref: text("ref").notNull(),
    ease: real("ease").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    due: date("due").notNull(),
    lastReviewed: date("last_reviewed"),
    firstReviewed: date("first_reviewed"),
    suspended: boolean("suspended").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ name: "review_cards_user_id_id_pk", columns: [t.userId, t.id] }),
    index("review_cards_user_id_due_idx").on(t.userId, t.due).where(sql`NOT ${t.suspended}`),
    check("review_cards_kind_check", sql`${t.kind} IN ('problem','highlight')`),
    check("review_cards_ease_check", sql`${t.ease} >= 1.3`),
    check("review_cards_interval_days_check", sql`${t.intervalDays} >= 0`),
  ],
);

export const activityDays = pgTable(
  "activity_days",
  {
    userId: userId(),
    day: date("day").notNull(),
    events: integer("events").notNull().default(0),
  },
  (t) => [primaryKey({ name: "activity_days_user_id_day_pk", columns: [t.userId, t.day] })],
);
