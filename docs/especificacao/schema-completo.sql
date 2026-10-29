-- =====================================================================
-- CodeForge — schema canônico (PostgreSQL 16)
-- Fonte de verdade das migrations; o schema Drizzle (src/server/db/schema.ts)
-- espelha estas tabelas. IDs: UUIDv7 (ordenáveis no tempo, sem hot-spot de índice).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- UUIDv7 (Postgres 16 não tem uuidv7() nativo; no PG 18 trocar por uuidv7()).
CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid
LANGUAGE sql VOLATILE AS $$
  SELECT encode(
    set_bit(set_bit(
      overlay(uuid_send(gen_random_uuid())
              PLACING substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
              FROM 1 FOR 6),
    52, 1), 53, 1), 'hex')::uuid
$$;

-- unaccent() é STABLE; colunas geradas exigem IMMUTABLE.
CREATE OR REPLACE FUNCTION unaccent_immutable(text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
CREATE TYPE user_role          AS ENUM ('student', 'author', 'admin');
CREATE TYPE content_access     AS ENUM ('free', 'premium');
CREATE TYPE chapter_kind       AS ENUM ('lesson', 'problem', 'quiz');
CREATE TYPE publish_status     AS ENUM ('draft', 'published', 'archived');
CREATE TYPE progress_status    AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE difficulty         AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE code_language      AS ENUM ('python', 'java', 'javascript', 'typescript', 'cpp', 'go');
CREATE TYPE submission_mode    AS ENUM ('run', 'submit');
CREATE TYPE submission_verdict AS ENUM ('queued', 'running', 'accepted', 'wrong_answer', 'time_limit',
                                        'memory_limit', 'runtime_error', 'compile_error', 'internal_error');
CREATE TYPE plan_kind          AS ENUM ('monthly', 'annual', 'lifetime');
CREATE TYPE currency_code      AS ENUM ('BRL', 'USD');
CREATE TYPE payment_status     AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'disputed', 'expired');
CREATE TYPE payment_method     AS ENUM ('card', 'pix');
CREATE TYPE grant_source       AS ENUM ('purchase', 'manual', 'coupon', 'migration');
CREATE TYPE highlight_color    AS ENUM ('yellow', 'green', 'blue', 'pink', 'purple');
CREATE TYPE quiz_question_kind AS ENUM ('single_choice', 'multiple_choice', 'code_completion', 'matching');
CREATE TYPE interview_type     AS ENUM ('coding', 'system_design', 'low_level_design', 'behavioral');
CREATE TYPE interview_status   AS ENUM ('active', 'evaluating', 'completed', 'abandoned');
CREATE TYPE ai_feature         AS ENUM ('tutor', 'hint', 'code_review', 'interview', 'interview_report');
CREATE TYPE privacy_request_kind   AS ENUM ('export', 'delete');
CREATE TYPE privacy_request_status AS ENUM ('received', 'processing', 'ready', 'completed', 'failed');

-- ---------------------------------------------------------------------
-- 1. USUÁRIOS, AUTH E SESSÕES POR DISPOSITIVO
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  email             citext NOT NULL UNIQUE,
  email_verified_at timestamptz,
  name              text,
  avatar_url        text,
  role              user_role NOT NULL DEFAULT 'student',
  locale            text NOT NULL DEFAULT 'pt-BR',
  timezone          text NOT NULL DEFAULT 'America/Sao_Paulo',
  preferences       jsonb NOT NULL DEFAULT '{}'::jsonb,  -- tema, leitor, voz, idioma do código
  max_devices       smallint NOT NULL DEFAULT 3,
  marketing_opt_in  boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz NOT NULL,
  terms_version     text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz                          -- soft delete; anonimização em 30 dias
);

CREATE TABLE auth_accounts (                             -- OAuth / credenciais (Better Auth)
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            text NOT NULL,                     -- 'google' | 'github' | 'email'
  provider_account_id text NOT NULL,
  access_token_enc    bytea,                             -- criptografado (AES-GCM, chave em KMS)
  refresh_token_enc   bytea,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE devices (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint_hash bytea NOT NULL,                       -- SHA-256(device_id cookie + UA família); nunca IP cru
  label            text NOT NULL,                        -- "Chrome · Windows"
  first_seen_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at     timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz,
  UNIQUE (user_id, fingerprint_hash)
);

CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id       uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  token_hash      bytea NOT NULL UNIQUE,                 -- SHA-256 do token opaco do cookie
  ip_prefix       inet,                                  -- /24 IPv4 ou /48 IPv6 (minimização)
  country         char(2),
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_active_at  timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  revoked_at      timestamptz,
  revoked_reason  text                                   -- 'logout' | 'device_limit' | 'admin' | 'password_change'
);
CREATE INDEX sessions_user_active_idx ON sessions (user_id) WHERE revoked_at IS NULL;

-- Sinais de compartilhamento de conta (consumidos por job anti-abuso)
CREATE TABLE session_anomalies (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        text NOT NULL,                             -- 'concurrent_streams' | 'impossible_travel' | 'device_churn'
  details     jsonb NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. PLANOS, PAGAMENTOS E DIREITOS DE ACESSO
-- ---------------------------------------------------------------------
CREATE TABLE plans (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  kind          plan_kind NOT NULL,
  currency      currency_code NOT NULL,
  amount_cents  integer NOT NULL CHECK (amount_cents > 0),
  list_cents    integer,                                 -- preço "de" (riscado)
  duration_days integer,                                 -- NULL para lifetime
  price_version integer NOT NULL,
  provider_price_id text NOT NULL,                       -- price_... no Stripe
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'lifetime') = (duration_days IS NULL)),
  UNIQUE (kind, currency, price_version)
);

CREATE TABLE coupons (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  code           citext NOT NULL UNIQUE,
  percent_off    smallint CHECK (percent_off BETWEEN 1 AND 100),
  max_redemptions integer,
  redeemed_count integer NOT NULL DEFAULT 0,
  valid_until    timestamptz,
  plan_kinds     plan_kind[] NOT NULL DEFAULT '{monthly,annual,lifetime}'
);

CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- obrigação fiscal: não apagar
  plan_id             uuid NOT NULL REFERENCES plans(id),
  coupon_id           uuid REFERENCES coupons(id),
  provider            text NOT NULL DEFAULT 'stripe',
  provider_session_id text NOT NULL UNIQUE,
  provider_payment_id text UNIQUE,
  method              payment_method,
  status              payment_status NOT NULL DEFAULT 'pending',
  currency            currency_code NOT NULL,
  amount_cents        integer NOT NULL,
  refunded_cents      integer NOT NULL DEFAULT 0,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_user_idx ON payments (user_id, created_at DESC);

CREATE TABLE webhook_events (                            -- idempotência de webhooks
  provider     text NOT NULL,
  event_id     text NOT NULL,
  type         text NOT NULL,
  received_at  timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error        text,
  PRIMARY KEY (provider, event_id)
);

-- Ledger: cada concessão de tempo de acesso. O direito efetivo é derivado daqui.
CREATE TABLE entitlement_grants (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      grant_source NOT NULL,
  payment_id  uuid REFERENCES payments(id),
  days        integer,                                   -- NULL = vitalício
  granted_by  uuid REFERENCES users(id),                 -- admin em concessões manuais
  note        text,
  revoked_at  timestamptz,                               -- estorno/chargeback
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (source <> 'purchase' OR payment_id IS NOT NULL)
);

-- Projeção materializada (1 linha por usuário), recalculada em transação a cada grant/revogação.
CREATE TABLE entitlements (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_lifetime       boolean NOT NULL DEFAULT false,
  access_expires_at timestamptz,                         -- NULL + is_lifetime=false => sem acesso
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX entitlements_expiring_idx ON entitlements (access_expires_at)
  WHERE is_lifetime = false AND access_expires_at IS NOT NULL;

-- ---------------------------------------------------------------------
-- 3. CONTEÚDO: CURSOS → MÓDULOS → GRUPOS → CAPÍTULOS
-- ---------------------------------------------------------------------
CREATE TABLE courses (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  slug          text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text NOT NULL,
  subtitle      text,
  description   text NOT NULL,
  category      text NOT NULL,                           -- 'interview-prep' | 'backend' | 'core-cs' | 'ai-ml' | 'languages'
  level         text NOT NULL,
  cover_url     text,
  default_access content_access NOT NULL DEFAULT 'premium',
  status        publish_status NOT NULL DEFAULT 'draft',
  nav_version   text,                                    -- hash do nav manifest (Fase 1 §6)
  position      integer NOT NULL,
  published_at  timestamptz,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  course_id  uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug       text NOT NULL,
  title      text NOT NULL,
  access     content_access,                             -- NULL = herda do curso
  position   integer NOT NULL,
  UNIQUE (course_id, slug),
  UNIQUE (course_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE chapter_groups (
  id        uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title     text NOT NULL,
  position  integer NOT NULL,
  UNIQUE (module_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE chapters (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  course_id        uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id        uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  group_id         uuid REFERENCES chapter_groups(id) ON DELETE SET NULL,
  slug             text NOT NULL,
  title            text NOT NULL,
  kind             chapter_kind NOT NULL,
  access           content_access,                       -- NULL = herda do módulo/curso
  status           publish_status NOT NULL DEFAULT 'draft',
  position         integer NOT NULL,                     -- esparso (múltiplos de 1000) dentro do módulo
  global_index     integer,                              -- índice no bitset de progresso (por nav_version)
  problem_id       uuid,                                 -- FK adicionada abaixo
  quiz_id          uuid,
  content_version  text,                                 -- sha256 do MDX
  body_ast         jsonb,                                -- MDX compilado (árvore serializável)
  body_plain       text,                                 -- texto plano p/ busca, RAG, TTS
  toc              jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_block_count smallint NOT NULL DEFAULT 6,       -- blocos visíveis antes do paywall
  reading_minutes  smallint,
  search_tsv       tsvector GENERATED ALWAYS AS (
                     setweight(to_tsvector('portuguese', unaccent_immutable(coalesce(title, ''))), 'A') ||
                     setweight(to_tsvector('portuguese', unaccent_immutable(coalesce(body_plain, ''))), 'C')
                   ) STORED,
  published_at     timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug),
  CHECK ((kind = 'problem') = (problem_id IS NOT NULL)),
  CHECK ((kind = 'quiz') = (quiz_id IS NOT NULL))
);
-- unaccent_immutable(): wrapper IMMUTABLE de unaccent() criado na migration 0000.
CREATE INDEX chapters_module_pos_idx ON chapters (module_id, position) WHERE status = 'published';
CREATE INDEX chapters_search_idx ON chapters USING gin (search_tsv);
CREATE INDEX chapters_title_trgm_idx ON chapters USING gin (title gin_trgm_ops);

CREATE TABLE chapter_redirects (                         -- slug renomeado => 308 permanente
  course_id  uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  old_slug   text NOT NULL,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, old_slug)
);

CREATE TABLE chapter_audio (
  chapter_id      uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  content_version text NOT NULL,
  voice           text NOT NULL,
  status          text NOT NULL CHECK (status IN ('queued', 'generating', 'ready', 'failed')),
  audio_key       text,                                  -- chave no R2
  alignment_key   text,
  duration_ms     integer,
  chars_billed    integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chapter_id, content_version, voice)
);

-- Chunks para RAG do tutor (Fase 3 §4.2)
CREATE TABLE content_chunks (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id      uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content_version text NOT NULL,
  heading_path    text NOT NULL,                         -- "Two Pointers > Quando usar"
  block_ids       text[] NOT NULL,
  access          content_access NOT NULL,               -- desnormalizado: filtro de acesso no SELECT
  text            text NOT NULL,
  embedding       vector(1024) NOT NULL
);
CREATE INDEX content_chunks_embedding_idx ON content_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX content_chunks_course_idx ON content_chunks (course_id, access);

-- ---------------------------------------------------------------------
-- 4. PROGRESSO, FAVORITOS, CERTIFICADOS
-- ---------------------------------------------------------------------
CREATE TABLE chapter_progress (
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id      uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status          progress_status NOT NULL DEFAULT 'in_progress',
  percent_read    smallint NOT NULL DEFAULT 0 CHECK (percent_read BETWEEN 0 AND 100),
  last_block_id   text,                                  -- retomar leitura
  audio_position_ms integer,
  time_spent_s    integer NOT NULL DEFAULT 0,
  completed_at    timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);
CREATE INDEX chapter_progress_course_idx ON chapter_progress (user_id, course_id) WHERE status = 'completed';

CREATE TABLE course_enrollments (                        -- agregado por curso (dashboard, certificado)
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id          uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_count    integer NOT NULL DEFAULT 0,
  total_at_snapshot  integer NOT NULL,
  last_chapter_id    uuid REFERENCES chapters(id) ON DELETE SET NULL,
  started_at         timestamptz NOT NULL DEFAULT now(),
  last_activity_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE stars (                                     -- favoritos (capítulos ou problemas)
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('chapter', 'problem')),
  target_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE activity_days (                             -- streak e heatmap
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         date NOT NULL,                             -- no fuso do usuário
  units       integer NOT NULL DEFAULT 0,                -- capítulos + problemas concluídos
  minutes     integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE certificates (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  public_code   text NOT NULL UNIQUE,                    -- ex.: CF-DSA-7K3M-Q9P2 (verificável)
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id),
  holder_name   text NOT NULL,                           -- congelado na emissão
  issued_at     timestamptz NOT NULL DEFAULT now(),
  is_public     boolean NOT NULL DEFAULT false,
  signature     bytea NOT NULL,                          -- Ed25519 sobre (code|user|course|issued_at)
  UNIQUE (user_id, course_id)
);

-- ---------------------------------------------------------------------
-- 5. DESTAQUES, NOTAS E CADERNO
-- ---------------------------------------------------------------------
CREATE TABLE highlights (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id      uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  color           highlight_color NOT NULL,
  -- Âncora robusta: bloco + offsets + citação com contexto (W3C TextQuoteSelector)
  block_id        text NOT NULL,
  start_offset    integer NOT NULL CHECK (start_offset >= 0),
  end_offset      integer NOT NULL CHECK (end_offset > start_offset),
  quote_exact     text NOT NULL CHECK (char_length(quote_exact) <= 5000),
  quote_prefix    text NOT NULL DEFAULT '',
  quote_suffix    text NOT NULL DEFAULT '',
  content_version text NOT NULL,                         -- versão em que foi criado
  orphaned        boolean NOT NULL DEFAULT false,        -- re-ancoragem falhou após edição do capítulo
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX highlights_user_chapter_idx ON highlights (user_id, chapter_id);
CREATE INDEX highlights_user_course_idx ON highlights (user_id, course_id, created_at);

CREATE TABLE notes (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id    uuid REFERENCES chapters(id) ON DELETE SET NULL,
  highlight_id  uuid REFERENCES highlights(id) ON DELETE SET NULL, -- nota inline presa a um destaque
  body_md       text NOT NULL CHECK (char_length(body_md) <= 20000),
  search_tsv    tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', unaccent_immutable(body_md))) STORED,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notes_user_course_idx ON notes (user_id, course_id, updated_at DESC);
CREATE INDEX notes_search_idx ON notes USING gin (search_tsv);

CREATE TABLE notebook_exports (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  format      text NOT NULL CHECK (format IN ('md', 'pdf')),
  status      text NOT NULL CHECK (status IN ('queued', 'ready', 'failed')),
  object_key  text,
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. PROBLEMAS, CASOS DE TESTE, LISTAS E SUBMISSÕES
-- ---------------------------------------------------------------------
CREATE TABLE problems (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  difficulty      difficulty NOT NULL,
  track           text NOT NULL,                         -- 'dsa' | 'system-design' | 'lld' | 'concurrency'
  patterns        text[] NOT NULL DEFAULT '{}',          -- 'two-pointers', 'sliding-window'
  companies       text[] NOT NULL DEFAULT '{}',
  access          content_access NOT NULL DEFAULT 'free',
  statement_ast   jsonb NOT NULL,
  signature       jsonb NOT NULL,                        -- {fn, params:[{name,type}], returns} → gera harness e stubs
  starter_code    jsonb NOT NULL,                        -- {python: "...", java: "..."}
  checker         text NOT NULL DEFAULT 'exact',         -- 'exact' | 'unordered' | 'float_1e-6' | 'custom'
  time_factor     jsonb NOT NULL DEFAULT '{"python":2,"java":2,"javascript":1.5}'::jsonb,
  external_url    text,                                  -- link de referência (ex.: LeetCode)
  editorial_ast   jsonb,                                 -- solução comentada (premium)
  tests_version   integer NOT NULL DEFAULT 1,
  status          publish_status NOT NULL DEFAULT 'draft',
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX problems_track_idx ON problems (track, difficulty) WHERE status = 'published';
CREATE INDEX problems_patterns_idx ON problems USING gin (patterns);

ALTER TABLE chapters ADD CONSTRAINT chapters_problem_fk FOREIGN KEY (problem_id) REFERENCES problems(id);

CREATE TABLE test_cases (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  problem_id  uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  ordinal     smallint NOT NULL,
  is_hidden   boolean NOT NULL,
  input       jsonb,                                     -- só casos públicos ficam em claro
  expected    jsonb,
  sealed      bytea,                                     -- ocultos: AES-GCM(input||expected), chave do executor
  reveal_on_fail boolean NOT NULL DEFAULT false,
  tests_version integer NOT NULL,
  UNIQUE (problem_id, tests_version, ordinal),
  CHECK (is_hidden = (sealed IS NOT NULL AND input IS NULL AND expected IS NULL)
         OR (NOT is_hidden AND input IS NOT NULL AND expected IS NOT NULL))
);

CREATE TABLE problem_lists (                             -- am-75 / am-150 / company-google
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  description text,
  prep_time   text                                       -- '< 1 mês', '1–3 meses'
);
CREATE TABLE problem_list_items (
  list_id    uuid NOT NULL REFERENCES problem_lists(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  section    text,                                       -- agrupamento por padrão dentro da lista
  position   integer NOT NULL,
  PRIMARY KEY (list_id, problem_id)
);

CREATE TABLE submissions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id    uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  mode          submission_mode NOT NULL,
  language      code_language NOT NULL,
  code          text NOT NULL CHECK (octet_length(code) <= 65536),
  code_sha256   bytea NOT NULL,                          -- dedup de reenvio idêntico
  tests_version integer NOT NULL,
  verdict       submission_verdict NOT NULL DEFAULT 'queued',
  passed_count  smallint,
  total_count   smallint,
  cpu_ms        integer,
  memory_kb     integer,
  compile_output text,                                   -- truncado em 8 KB
  created_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz
);
CREATE INDEX submissions_user_problem_idx ON submissions (user_id, problem_id, created_at DESC);

CREATE TABLE submission_case_results (
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  ordinal       smallint NOT NULL,
  is_hidden     boolean NOT NULL,
  verdict       submission_verdict NOT NULL,
  cpu_ms        integer,
  stdout_excerpt text,                                   -- ≤ 2 KB; vazio para ocultos
  actual        jsonb,                                   -- só para casos públicos
  PRIMARY KEY (submission_id, ordinal)
);

CREATE TABLE problem_status (                            -- leitura rápida da tabela de prática
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id   uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved       boolean NOT NULL DEFAULT false,
  attempts     integer NOT NULL DEFAULT 0,
  first_solved_at timestamptz,
  last_code    jsonb,                                    -- rascunho por linguagem {python: "..."}
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

-- ---------------------------------------------------------------------
-- 7. QUIZZES
-- ---------------------------------------------------------------------
CREATE TABLE quizzes (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  pass_percent  smallint NOT NULL DEFAULT 70,
  shuffle       boolean NOT NULL DEFAULT true
);
ALTER TABLE chapters ADD CONSTRAINT chapters_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes(id);

CREATE TABLE quiz_questions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  quiz_id      uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position     smallint NOT NULL,
  kind         quiz_question_kind NOT NULL,
  prompt_ast   jsonb NOT NULL,
  options      jsonb NOT NULL,                           -- sem o gabarito
  answer_key   jsonb NOT NULL,                           -- NUNCA enviado ao cliente antes da resposta
  explanation_ast jsonb,
  UNIQUE (quiz_id, position)
);

CREATE TABLE quiz_attempts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id      uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers      jsonb NOT NULL DEFAULT '{}'::jsonb,       -- {questionId: resposta}
  score_percent smallint,
  passed       boolean,
  started_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);
CREATE INDEX quiz_attempts_user_idx ON quiz_attempts (user_id, quiz_id, started_at DESC);

-- ---------------------------------------------------------------------
-- 8. IA: CONVERSAS DO TUTOR, MOCK INTERVIEWS, USO
-- ---------------------------------------------------------------------
CREATE TABLE ai_threads (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id  uuid REFERENCES chapters(id) ON DELETE SET NULL,
  problem_id  uuid REFERENCES problems(id) ON DELETE SET NULL,
  title       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  thread_id   uuid NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     jsonb NOT NULL,                            -- blocos de conteúdo completos (inclui thinking p/ replay)
  model       text,
  stop_reason text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_thread_idx ON ai_messages (thread_id, created_at);

CREATE TABLE interview_sessions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          interview_type NOT NULL,
  problem_id    uuid REFERENCES problems(id),
  company_style text,
  language      code_language,
  status        interview_status NOT NULL DEFAULT 'active',
  phase         text NOT NULL DEFAULT 'intro',
  duration_limit_s integer NOT NULL DEFAULT 2700,
  editor_state  text,                                    -- último snapshot do código
  whiteboard    jsonb,                                   -- cena do whiteboard (system design)
  thread_id     uuid NOT NULL REFERENCES ai_threads(id),
  report        jsonb,                                   -- relatório validado por schema
  overall_score numeric(3, 2),
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz
);
CREATE INDEX interview_sessions_user_idx ON interview_sessions (user_id, started_at DESC);

CREATE TABLE ai_usage (                                  -- contabilidade de custo por chamada
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               uuid REFERENCES users(id) ON DELETE SET NULL,
  feature               ai_feature NOT NULL,
  model                 text NOT NULL,
  input_tokens          integer NOT NULL,
  cache_read_tokens     integer NOT NULL DEFAULT 0,
  cache_write_tokens    integer NOT NULL DEFAULT 0,
  output_tokens         integer NOT NULL,
  cost_micro_usd        bigint NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_user_day_idx ON ai_usage (user_id, created_at);

-- ---------------------------------------------------------------------
-- 9. LGPD E AUDITORIA
-- ---------------------------------------------------------------------
CREATE TABLE consents (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose     text NOT NULL,                             -- 'terms' | 'marketing' | 'analytics'
  granted     boolean NOT NULL,
  version     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE privacy_requests (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         privacy_request_kind NOT NULL,
  status       privacy_request_status NOT NULL DEFAULT 'received',
  object_key   text,                                     -- zip do export (URL assinada, 7 dias)
  scheduled_for timestamptz,                             -- exclusão: now() + 30 dias (janela de arrependimento)
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    uuid,
  action      text NOT NULL,                             -- 'entitlement.grant' | 'user.delete' | ...
  target_type text NOT NULL,
  target_id   text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
