import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/*
 * Tabelas do módulo de autenticação (multiusuário).
 * Migradas pelo drizzle-kit (pasta drizzle/). As tabelas antigas do modo pessoal continuam no DDL de src/db/index.ts.
 * Tokens (sessão e reset) nunca são guardados em claro: só o SHA-256 em hex (64 caracteres).
 */

export const userRole = pgEnum("user_role", ["student", "admin"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Sempre normalizado na aplicação (trim + lowercase); o CHECK impede gravar fora desse formato. */
    email: text("email").notNull().unique("users_email_unique"),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRole("role").notNull().default("student"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("users_email_normalized", sql`${t.email} = lower(btrim(${t.email}))`),
    check("users_email_length", sql`char_length(${t.email}) <= 254`),
    check("users_name_length", sql`char_length(${t.name}) BETWEEN 1 AND 80`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique("sessions_token_hash_unique"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId), index("sessions_expires_at_idx").on(t.expiresAt)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique("password_reset_tokens_token_hash_unique"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("password_reset_tokens_user_id_idx").on(t.userId)],
);

/** Janela fixa por chave (ex.: "login:ip:1.2.3.4"). Implementação Postgres da interface RateLimiter. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  },
  // Para a limpeza periódica de janelas vencidas.
  (t) => [index("rate_limits_window_start_idx").on(t.windowStart)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
