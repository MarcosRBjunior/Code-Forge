/**
 * Testes dos dados de estudo por usuário: a migração 0001 (banco novo e banco antigo com dados) e o isolamento
 * entre usuários nos services de src/server/study/ (que as rotas de src/app/api só repassam).
 * PGlite em memória, com as mesmas migrações do drizzle-kit usadas em produção.
 * Rodar: npm run test:study
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";

import { MIGRATIONS_FOLDER, migratePglite } from "../src/server/db/migrate.ts";
import { users } from "../src/server/db/schema/auth.ts";
import { highlights, notes, reviewCards } from "../src/server/db/schema/study.ts";
import type { StudyDb } from "../src/server/study/db.ts";
import {
  getChapterState,
  getCourseState,
  getDashboard,
  saveDraft,
  setStar,
  upsertProgress,
} from "../src/server/study/progress.ts";
import {
  createHighlight,
  createNote,
  deleteHighlight,
  deleteNote,
  getNotebook,
  updateHighlightColor,
  updateNote,
} from "../src/server/study/annotations.ts";
import { answerCard, getReview, suspendCard, type ReviewChapter } from "../src/server/study/reviews.ts";
import { listInterviews, saveInterview, type InterviewInput } from "../src/server/study/interviews.ts";
import { AppError } from "../src/server/errors.ts";

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

const CHAPTERS: ReviewChapter[] = [
  { course: "dsa", slug: "two-sum", title: "Two Sum", moduleTitle: "Arrays", kind: "problem", available: true, difficulty: "easy" },
  { course: "dsa", slug: "arrays", title: "Arrays", moduleTitle: "Arrays", kind: "lesson", available: true },
  { course: "redes", slug: "tcp", title: "TCP", moduleTitle: "Transporte", kind: "lesson", available: true },
];

async function addUser(db: StudyDb, email: string): Promise<string> {
  const [u] = await db.insert(users).values({ email, passwordHash: "x", name: email.split("@")[0] }).returning({ id: users.id });
  return u.id;
}

async function setup() {
  const client = new PGlite();
  await migratePglite(client);
  const db = drizzle(client) as unknown as StudyDb;
  const ana = await addUser(db, "ana@exemplo.com");
  const bia = await addUser(db, "bia@exemplo.com");
  return { client, db, ana, bia };
}

const hl = (key = "dsa/arrays") => ({
  id: randomUUID(),
  key,
  color: "yellow",
  blockId: "p-1",
  startOffset: 0,
  endOffset: 5,
  quote: "array",
});

const interview = (): InterviewInput => ({
  id: randomUUID(),
  config: { style: "standard", level: "mid", noRun: false, mix: { easy: 1, medium: 0, hard: 0 } },
  problems: [],
  scores: {},
  total: 50,
  notes: "",
  durationS: 600,
});

async function rejectsWith(p: Promise<unknown>, code: string, status: number) {
  try {
    await p;
  } catch (err) {
    assert.ok(AppError.is(err), `esperava AppError, veio ${String(err)}`);
    assert.equal(err.code, code);
    assert.equal(err.status, status);
    return;
  }
  assert.fail(`esperava erro ${code}, mas resolveu`);
}

// ---------------------------------------------------------------------------
// Migração 0001
// ---------------------------------------------------------------------------

/** Banco no estado de produção antes desta mudança: só a migração 0000 + as tabelas antigas criadas pelo DDL solto. */
async function legacyDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-mig-"));
  fs.mkdirSync(path.join(dir, "meta"));
  fs.copyFileSync(path.join(MIGRATIONS_FOLDER, "0000_auth_init.sql"), path.join(dir, "0000_auth_init.sql"));
  const journal = JSON.parse(fs.readFileSync(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8"));
  journal.entries = journal.entries.slice(0, 1);
  fs.writeFileSync(path.join(dir, "meta", "_journal.json"), JSON.stringify(journal));

  const client = new PGlite();
  await migrate(drizzle(client), { migrationsFolder: dir });
  // A seção 1 da 0001 é cópia literal do DDL antigo.
  const sql0001 = fs.readFileSync(path.join(MIGRATIONS_FOLDER, "0001_study_per_user.sql"), "utf8");
  await client.exec(sql0001.slice(0, sql0001.indexOf("-- 2.")).replaceAll("--> statement-breakpoint", ""));
  return client;
}

async function seedLegacy(client: PGlite) {
  const h = randomUUID();
  await client.exec(`
    INSERT INTO chapter_progress (chapter_key, percent_read, completed, completed_at) VALUES ('dsa/two-sum', 100, true, now());
    INSERT INTO stars (chapter_key) VALUES ('dsa/arrays');
    INSERT INTO highlights (id, chapter_key, color, block_id, start_offset, end_offset, quote)
      VALUES ('${h}', 'dsa/arrays', 'blue', 'p-1', 0, 4, 'nota');
    INSERT INTO notes (id, chapter_key, highlight_id, body) VALUES ('${randomUUID()}', 'dsa/arrays', '${h}', 'minha nota');
    INSERT INTO code_drafts (chapter_key, language, code) VALUES ('dsa/two-sum', 'python', 'print(1)');
    INSERT INTO review_cards (id, kind, ref, due) VALUES ('problem:dsa/two-sum', 'problem', 'dsa/two-sum', '2026-11-10');
    INSERT INTO activity_days (day, events) VALUES ('2026-11-10', 3);
  `);
  return h;
}

const count = async (client: PGlite, q: string) => Number((await client.query<{ n: number }>(q)).rows[0].n);
const hasUserId = async (client: PGlite) =>
  count(client, "SELECT count(*)::int AS n FROM information_schema.columns WHERE table_name = 'highlights' AND column_name = 'user_id'");

describe("migração 0001", () => {
  test("banco novo: cria as 8 tabelas já com user_id NOT NULL", async () => {
    const client = new PGlite();
    await migratePglite(client);
    const rows = await client.query<{ table_name: string; is_nullable: string }>(
      "SELECT table_name, is_nullable FROM information_schema.columns WHERE column_name = 'user_id' ORDER BY table_name",
    );
    const study = rows.rows.filter((r) => !["sessions", "password_reset_tokens"].includes(r.table_name));
    assert.deepEqual(
      study.map((r) => r.table_name),
      ["activity_days", "chapter_progress", "code_drafts", "highlights", "mock_interviews", "notes", "review_cards", "stars"],
    );
    assert.ok(study.every((r) => r.is_nullable === "NO"));
  });

  test("banco antigo com dados e 1 usuário: tudo passa para esse usuário, sem perder linhas", async () => {
    const client = await legacyDb();
    const h = await seedLegacy(client);
    const db = drizzle(client) as unknown as StudyDb;
    const ana = await addUser(db, "ana@exemplo.com");

    await migratePglite(client);

    for (const t of ["chapter_progress", "stars", "highlights", "notes", "code_drafts", "review_cards", "activity_days"]) {
      assert.equal(await count(client, `SELECT count(*)::int AS n FROM ${t}`), 1, t);
      assert.equal(await count(client, `SELECT count(*)::int AS n FROM ${t} WHERE user_id = '${ana}'`), 1, t);
    }
    const state = await getChapterState(db, ana, "dsa/arrays");
    assert.equal(state.starred, true);
    assert.equal(state.notes[0].highlightId, h);
    // O cartão migrado (problema) continua e o destaque migrado ganha o seu: 2, ambos da Ana.
    const review = await getReview(db, ana, CHAPTERS);
    assert.equal(review.counts.total, 2);
    assert.equal(await count(client, `SELECT count(*)::int AS n FROM review_cards WHERE user_id = '${ana}'`), 2);
  });

  test("banco antigo vazio e sem usuário: migra (nada para atribuir)", async () => {
    const client = await legacyDb();
    await migratePglite(client);
    assert.equal(await hasUserId(client), 1);
  });

  test("dados sem usuário, ou com 2 usuários: aborta e não muda nada (transação)", async () => {
    for (const n of [0, 2]) {
      const client = await legacyDb();
      await seedLegacy(client);
      const db = drizzle(client) as unknown as StudyDb;
      for (let i = 0; i < n; i++) await addUser(db, `u${i}@exemplo.com`);

      await assert.rejects(migratePglite(client), (err: unknown) => {
        const text = `${String(err)} ${String((err as { cause?: unknown }).cause)}`;
        assert.match(text, /exatamente 1/);
        return true;
      });
      assert.equal(await hasUserId(client), 0, `${n} usuários: user_id não deveria existir`);
      assert.equal(await count(client, "SELECT count(*)::int AS n FROM highlights"), 1);
    }
  });
});

// ---------------------------------------------------------------------------
// Isolamento entre usuários
// ---------------------------------------------------------------------------

describe("progresso, favoritos e rascunhos", () => {
  test("o mesmo capítulo é independente para cada usuário", async () => {
    const { db, ana, bia } = await setup();
    await upsertProgress(db, ana, { key: "dsa/arrays", percentRead: 80 });
    await upsertProgress(db, bia, { key: "dsa/arrays", percentRead: 10 });
    await setStar(db, ana, "dsa/arrays", true);
    await saveDraft(db, ana, { key: "dsa/two-sum", language: "python", code: "ana" });
    await saveDraft(db, bia, { key: "dsa/two-sum", language: "python", code: "bia" });

    const a = await getChapterState(db, ana, "dsa/arrays");
    const b = await getChapterState(db, bia, "dsa/arrays");
    assert.equal(a.progress?.percentRead, 80);
    assert.equal(b.progress?.percentRead, 10);
    assert.equal(a.starred, true);
    assert.equal(b.starred, false);
    assert.equal((await getChapterState(db, ana, "dsa/two-sum")).drafts.python, "ana");
    assert.equal((await getChapterState(db, bia, "dsa/two-sum")).drafts.python, "bia");

    assert.deepEqual((await getCourseState(db, bia, "dsa")).starred, []);
    assert.deepEqual(Object.keys((await getCourseState(db, bia)).progress), ["dsa/arrays"]);
  });

  test("tirar o favorito de um não mexe no do outro", async () => {
    const { db, ana, bia } = await setup();
    await setStar(db, ana, "dsa/arrays", true);
    await setStar(db, bia, "dsa/arrays", true);
    await setStar(db, bia, "dsa/arrays", false);
    assert.deepEqual((await getCourseState(db, ana)).starred, ["dsa/arrays"]);
    assert.deepEqual((await getCourseState(db, bia)).starred, []);
  });

  test("painel: sequência, totais e recentes só do usuário", async () => {
    const { db, ana, bia } = await setup();
    await upsertProgress(db, ana, { key: "dsa/arrays", completed: true });
    await createHighlight(db, ana, hl());
    const a = await getDashboard(db, ana);
    const b = await getDashboard(db, bia);
    assert.equal(a.streak, 1);
    assert.deepEqual(a.totals, { completed: 1, highlights: 1, notes: 0 });
    assert.equal(b.streak, 0);
    assert.deepEqual(b.totals, { completed: 0, highlights: 0, notes: 0 });
    assert.deepEqual(b.recent, []);
  });
});

describe("destaques e notas", () => {
  test("B não vê, não edita e não apaga os destaques e notas de A", async () => {
    const { db, ana, bia } = await setup();
    const h = await createHighlight(db, ana, hl());
    const n = await createNote(db, ana, { id: randomUUID(), key: "dsa/arrays", highlightId: h.id, body: "da ana" });

    assert.deepEqual((await getChapterState(db, bia, "dsa/arrays")).highlights, []);
    assert.deepEqual(await getNotebook(db, bia, "dsa"), { highlights: [], notes: [] });

    await rejectsWith(updateHighlightColor(db, bia, h.id, "pink"), "NOT_FOUND", 404);
    await rejectsWith(updateNote(db, bia, n.id, "hackeado"), "NOT_FOUND", 404);
    await deleteHighlight(db, bia, h.id);
    await deleteNote(db, bia, n.id);

    const a = await getChapterState(db, ana, "dsa/arrays");
    assert.equal(a.highlights.length, 1);
    assert.equal(a.highlights[0].color, "yellow");
    assert.equal(a.notes[0].body, "da ana");
  });

  test("id de outro usuário na criação → 409, sem sobrescrever; reenvio do próprio id devolve a linha", async () => {
    const { db, ana, bia } = await setup();
    const input = hl();
    const h = await createHighlight(db, ana, input);
    await rejectsWith(createHighlight(db, bia, { ...input, color: "pink" }), "CONFLICT", 409);
    assert.deepEqual(await createHighlight(db, ana, input), h);

    const note = { id: randomUUID(), key: "dsa/arrays", body: "x" };
    const n = await createNote(db, ana, note);
    await rejectsWith(createNote(db, bia, { ...note, body: "y" }), "CONFLICT", 409);
    assert.deepEqual(await createNote(db, ana, note), n);
    assert.equal((await getChapterState(db, ana, "dsa/arrays")).notes[0].body, "x");
  });

  test("nota não pode apontar para destaque de outro usuário (service e banco)", async () => {
    const { db, ana, bia } = await setup();
    const h = await createHighlight(db, ana, hl());
    await rejectsWith(createNote(db, bia, { id: randomUUID(), key: "dsa/arrays", highlightId: h.id, body: "x" }), "VALIDATION_FAILED", 422);
    // Mesmo pulando o service, a FK composta recusa.
    await assert.rejects(db.insert(notes).values({ id: randomUUID(), userId: bia, chapterKey: "dsa/arrays", highlightId: h.id, body: "x" }));
  });

  test("apagar o destaque solta a nota (highlight_id null) e mantém o dono", async () => {
    const { db, ana } = await setup();
    const h = await createHighlight(db, ana, hl());
    const n = await createNote(db, ana, { id: randomUUID(), key: "dsa/arrays", highlightId: h.id, body: "x" });
    await deleteHighlight(db, ana, h.id);
    const [row] = await db.select().from(notes).where(eq(notes.id, n.id));
    assert.equal(row.highlightId, null);
    assert.equal(row.userId, ana);
  });
});

describe("revisão espaçada", () => {
  test("o mesmo cartão problem:dsa/two-sum existe para os dois, cada um com seu agendamento", async () => {
    const { db, ana, bia } = await setup();
    await upsertProgress(db, ana, { key: "dsa/two-sum", completed: true });
    await upsertProgress(db, bia, { key: "dsa/two-sum", completed: true });
    await getReview(db, ana, CHAPTERS);
    await getReview(db, bia, CHAPTERS);
    // Vence hoje para poder responder.
    await db.update(reviewCards).set({ due: "2000-01-01" });

    await answerCard(db, ana, "problem:dsa/two-sum", 4);
    const rows = await db.select().from(reviewCards).orderBy(reviewCards.userId);
    assert.equal(rows.length, 2);
    const a = rows.find((r) => r.userId === ana)!;
    const b = rows.find((r) => r.userId === bia)!;
    assert.equal(a.reps, 1);
    assert.equal(b.reps, 0);
    assert.equal(b.due, "2000-01-01");
  });

  test("B não vê, não responde e não suspende os cartões de A", async () => {
    const { db, ana, bia } = await setup();
    const h = await createHighlight(db, ana, hl());
    await upsertProgress(db, ana, { key: "dsa/two-sum", completed: true });
    await getReview(db, ana, CHAPTERS);
    await db.update(reviewCards).set({ due: "2000-01-01" });

    const b = await getReview(db, bia, CHAPTERS);
    assert.deepEqual(b.queue, []);
    assert.equal(b.counts.total, 0);
    await rejectsWith(answerCard(db, bia, `highlight:${h.id}`, 1), "NOT_FOUND", 404);
    await rejectsWith(suspendCard(db, bia, "problem:dsa/two-sum", true), "NOT_FOUND", 404);

    const a = await getReview(db, ana, CHAPTERS);
    assert.equal(a.queue.length, 2);
    assert.ok(a.queue.every((c) => c.state.reps === 0));
  });

  test("a sincronização de B não apaga os cartões de A como órfãos", async () => {
    const { db, ana, bia } = await setup();
    await createHighlight(db, ana, hl());
    await getReview(db, ana, CHAPTERS);
    await getReview(db, bia, CHAPTERS); // B não tem destaques: os de A não são órfãos para ele
    assert.equal((await db.select().from(reviewCards).where(eq(reviewCards.userId, ana))).length, 1);
  });
});

describe("entrevistas simuladas", () => {
  test("cada usuário vê só as suas; id de outro usuário não sobrescreve", async () => {
    const { db, ana, bia } = await setup();
    const i = interview();
    await saveInterview(db, ana, i);
    await saveInterview(db, bia, { ...i, total: 99 });
    assert.equal((await listInterviews(db, ana))[0].total, 50);
    assert.deepEqual(await listInterviews(db, bia), []);
  });
});

describe("conta apagada", () => {
  test("apagar o usuário apaga os dados de estudo dele (cascade) e só os dele", async () => {
    const { db, client, ana, bia } = await setup();
    for (const u of [ana, bia]) {
      await upsertProgress(db, u, { key: "dsa/two-sum", completed: true });
      await setStar(db, u, "dsa/arrays", true);
      const h = await createHighlight(db, u, hl());
      await createNote(db, u, { id: randomUUID(), key: "dsa/arrays", highlightId: h.id, body: "x" });
      await saveDraft(db, u, { key: "dsa/two-sum", language: "go", code: "x" });
      await saveInterview(db, u, interview());
      await getReview(db, u, CHAPTERS);
    }
    await db.delete(users).where(eq(users.id, ana));
    for (const t of ["chapter_progress", "stars", "highlights", "notes", "code_drafts", "mock_interviews", "review_cards", "activity_days"]) {
      assert.equal(await count(client, `SELECT count(*)::int AS n FROM ${t} WHERE user_id = '${ana}'`), 0, t);
      assert.ok((await count(client, `SELECT count(*)::int AS n FROM ${t} WHERE user_id = '${bia}'`)) > 0, t);
    }
    assert.equal((await db.select().from(highlights)).length, 1);
  });
});
