-- EDITADA À MÃO (o snapshot 0001 é o gerado pelo drizzle-kit e descreve o estado final).
-- Serve aos dois casos:
--   * banco que já existia (produção): as 8 tabelas de estudo foram criadas pelo DDL solto do modo pessoal, sem user_id,
--     e têm dados. Os CREATE ... IF NOT EXISTS abaixo não fazem nada; os dados passam para o ÚNICO usuário cadastrado.
--   * banco novo (PGlite, testes): os CREATE criam as tabelas no formato antigo e os ALTER as levam ao formato novo.
-- Se houver dados de estudo e não houver exatamente 1 usuário, a migração aborta (nada é apagado nem adivinhado).
-- O migrator do drizzle roda cada migração numa transação: se algo falhar, nada muda.

-- 1. Tabelas no formato antigo (cópia do DDL que ficava em src/db/index.ts)
CREATE TABLE IF NOT EXISTS chapter_progress (
  chapter_key text PRIMARY KEY,
  percent_read integer NOT NULL DEFAULT 0 CHECK (percent_read BETWEEN 0 AND 100),
  last_block_id text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now());
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS stars (
  chapter_key text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now());
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY,
  chapter_key text NOT NULL,
  color text NOT NULL CHECK (color IN ('yellow','green','blue','pink','purple')),
  block_id text NOT NULL,
  start_offset integer NOT NULL CHECK (start_offset >= 0),
  end_offset integer NOT NULL,
  quote text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_offset > start_offset));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS highlights_chapter_idx ON highlights (chapter_key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY,
  chapter_key text NOT NULL,
  highlight_id uuid REFERENCES highlights(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) <= 20000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now());
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS notes_chapter_idx ON notes (chapter_key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS code_drafts (
  chapter_key text NOT NULL,
  language text NOT NULL,
  code text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chapter_key, language));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS mock_interviews (
  id uuid PRIMARY KEY,
  config jsonb NOT NULL,
  problems jsonb NOT NULL,
  scores jsonb NOT NULL,
  total integer NOT NULL CHECK (total BETWEEN 0 AND 100),
  notes text NOT NULL DEFAULT '',
  duration_s integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now());
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS review_cards (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('problem','highlight')),
  ref text NOT NULL,
  ease real NOT NULL DEFAULT 2.5 CHECK (ease >= 1.3),
  interval_days integer NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  reps integer NOT NULL DEFAULT 0,
  lapses integer NOT NULL DEFAULT 0,
  due date NOT NULL,
  last_reviewed date,
  first_reviewed date,
  suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now());
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS review_cards_due_idx ON review_cards (due) WHERE NOT suspended;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS activity_days (
  day date PRIMARY KEY,
  events integer NOT NULL DEFAULT 0);
--> statement-breakpoint

-- 2. Dono dos dados existentes: exige exatamente 1 usuário quando há dados
DO $$
DECLARE
  n_users integer;
  has_data boolean;
BEGIN
  SELECT count(*) INTO n_users FROM users;
  has_data := EXISTS (SELECT 1 FROM chapter_progress) OR EXISTS (SELECT 1 FROM stars)
    OR EXISTS (SELECT 1 FROM highlights) OR EXISTS (SELECT 1 FROM notes)
    OR EXISTS (SELECT 1 FROM code_drafts) OR EXISTS (SELECT 1 FROM mock_interviews)
    OR EXISTS (SELECT 1 FROM review_cards) OR EXISTS (SELECT 1 FROM activity_days);
  IF has_data AND n_users <> 1 THEN
    RAISE EXCEPTION 'CodeForge 0001: há dados de estudo sem dono e % usuários cadastrados; é preciso exatamente 1 para receber os dados. Crie a conta (ou apague as extras) e reinicie o app.', n_users;
  END IF;
END $$;
--> statement-breakpoint

-- 3. user_id em todas as tabelas, preenchido com o único usuário (UPDATE sem linhas quando o banco está vazio)
ALTER TABLE chapter_progress ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE stars ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE highlights ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE notes ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE code_drafts ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE mock_interviews ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE review_cards ADD COLUMN user_id uuid;
--> statement-breakpoint
ALTER TABLE activity_days ADD COLUMN user_id uuid;
--> statement-breakpoint
UPDATE chapter_progress SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE stars SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE highlights SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE notes SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE code_drafts SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE mock_interviews SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE review_cards SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
UPDATE activity_days SET user_id = (SELECT id FROM users LIMIT 1);
--> statement-breakpoint
ALTER TABLE chapter_progress ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE stars ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE highlights ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE code_drafts ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE mock_interviews ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE review_cards ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint
ALTER TABLE activity_days ALTER COLUMN user_id SET NOT NULL;
--> statement-breakpoint

-- 4. FK para users (apagar a conta apaga os dados de estudo)
ALTER TABLE "activity_days" ADD CONSTRAINT "activity_days_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "code_drafts" ADD CONSTRAINT "code_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "stars" ADD CONSTRAINT "stars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- 5. Chaves primárias por usuário
ALTER TABLE chapter_progress DROP CONSTRAINT chapter_progress_pkey;
--> statement-breakpoint
ALTER TABLE chapter_progress ADD CONSTRAINT "chapter_progress_user_id_chapter_key_pk" PRIMARY KEY ("user_id", "chapter_key");
--> statement-breakpoint
ALTER TABLE stars DROP CONSTRAINT stars_pkey;
--> statement-breakpoint
ALTER TABLE stars ADD CONSTRAINT "stars_user_id_chapter_key_pk" PRIMARY KEY ("user_id", "chapter_key");
--> statement-breakpoint
ALTER TABLE code_drafts DROP CONSTRAINT code_drafts_pkey;
--> statement-breakpoint
ALTER TABLE code_drafts ADD CONSTRAINT "code_drafts_user_id_chapter_key_language_pk" PRIMARY KEY ("user_id", "chapter_key", "language");
--> statement-breakpoint
ALTER TABLE review_cards DROP CONSTRAINT review_cards_pkey;
--> statement-breakpoint
ALTER TABLE review_cards ADD CONSTRAINT "review_cards_user_id_id_pk" PRIMARY KEY ("user_id", "id");
--> statement-breakpoint
ALTER TABLE activity_days DROP CONSTRAINT activity_days_pkey;
--> statement-breakpoint
ALTER TABLE activity_days ADD CONSTRAINT "activity_days_user_id_day_pk" PRIMARY KEY ("user_id", "day");
--> statement-breakpoint

-- 6. Nota só aponta para destaque do mesmo usuário. SET NULL (highlight_id): só a coluna do destaque vira null (PG 15+).
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_id_user_id_unique" UNIQUE ("id", "user_id");
--> statement-breakpoint
ALTER TABLE notes DROP CONSTRAINT notes_highlight_id_fkey;
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_highlight_id_user_id_fk" FOREIGN KEY ("highlight_id", "user_id") REFERENCES "public"."highlights"("id", "user_id") ON DELETE SET NULL ("highlight_id") ON UPDATE no action;
--> statement-breakpoint

-- 7. Índices começando por user_id
DROP INDEX highlights_chapter_idx;
--> statement-breakpoint
DROP INDEX notes_chapter_idx;
--> statement-breakpoint
DROP INDEX review_cards_due_idx;
--> statement-breakpoint
CREATE INDEX "highlights_user_id_chapter_key_idx" ON "highlights" USING btree ("user_id", "chapter_key");
--> statement-breakpoint
CREATE INDEX "mock_interviews_user_id_created_at_idx" ON "mock_interviews" USING btree ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "notes_user_id_chapter_key_idx" ON "notes" USING btree ("user_id", "chapter_key");
--> statement-breakpoint
CREATE INDEX "review_cards_user_id_due_idx" ON "review_cards" USING btree ("user_id", "due") WHERE NOT "review_cards"."suspended";
