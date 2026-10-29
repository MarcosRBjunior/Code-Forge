/**
 * Contratos públicos da API do CodeForge (Zod v3/v4-compatível).
 * Usados por: route handlers (validação de entrada), tRPC routers, cliente (tipos inferidos),
 * e testes de contrato. Mudança incompatível => nova rota /v2, nunca editar em produção.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitivos
// ---------------------------------------------------------------------------
export const Id = z.string().uuid();
export const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(120);
export const IsoDate = z.string().datetime({ offset: true });
export const Cursor = z.string().max(200).optional();

export const Language = z.enum(["python", "java", "javascript", "typescript", "cpp", "go"]);
export const HighlightColor = z.enum(["yellow", "green", "blue", "pink", "purple"]);
export const PlanKind = z.enum(["monthly", "annual", "lifetime"]);
export const Currency = z.enum(["BRL", "USD"]);
export const Difficulty = z.enum(["easy", "medium", "hard"]);

export const Page = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable() });

// ---------------------------------------------------------------------------
// Erros — formato único (RFC 9457 "problem details" simplificado)
// ---------------------------------------------------------------------------
export const ErrorCode = z.enum([
  "BAD_REQUEST",            // 400 JSON malformado / parâmetros ausentes
  "UNAUTHENTICATED",        // 401 sem sessão ou sessão revogada
  "FORBIDDEN",              // 403 autenticado mas sem permissão (ex.: não é dono do recurso)
  "PREMIUM_REQUIRED",       // 403 conteúdo/feature exige passe ativo
  "DEVICE_LIMIT",           // 403 limite de dispositivos atingido
  "NOT_FOUND",              // 404
  "CONFLICT",               // 409 idempotency-key reutilizada com corpo diferente
  "VALIDATION_FAILED",      // 422 corpo válido como JSON mas viola o schema/regras
  "RATE_LIMITED",           // 429 limite de requisições
  "QUOTA_EXCEEDED",         // 429 cota diária de IA/execução
  "EXECUTOR_BUSY",          // 503 fila do executor saturada
  "INTERNAL",               // 500
]);

export const ApiError = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),                               // pt-BR, seguro para exibir
    requestId: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(), // 422
    retryAfterSeconds: z.number().int().optional(),   // 429/503 (também no header Retry-After)
    upgradeUrl: z.string().optional(),                 // PREMIUM_REQUIRED / QUOTA_EXCEEDED
  }),
});
export type ApiError = z.infer<typeof ApiError>;

// ---------------------------------------------------------------------------
// Sessão / usuário — GET /api/me
// ---------------------------------------------------------------------------
export const Me = z.object({
  id: Id,
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  locale: z.string(),
  entitlement: z.object({
    active: z.boolean(),
    isLifetime: z.boolean(),
    accessExpiresAt: IsoDate.nullable(),
  }),
  quotas: z.object({
    tutorRemainingToday: z.number().int(),
    runsRemainingToday: z.number().int(),
    interviewsRemainingThisMonth: z.number().int(),
  }),
});

export const ReaderPreferences = z.object({
  theme: z.enum(["light", "dark", "system"]),
  size: z.enum(["xs", "s", "m", "l", "xl"]),
  leading: z.enum(["tight", "normal", "relaxed"]),
  width: z.enum(["compact", "normal", "wide", "full"]),
  font: z.enum(["serif", "sans", "mono"]),
  voice: z.string().max(64),
  playbackRate: z.number().min(0.75).max(2),
  preferredLanguage: Language,
});
// PATCH /api/me/preferences
export const UpdatePreferencesRequest = ReaderPreferences.partial();

// GET /api/me/devices · DELETE /api/me/devices/:id
export const Device = z.object({
  id: Id,
  label: z.string(),
  current: z.boolean(),
  lastSeenAt: IsoDate,
  country: z.string().length(2).nullable(),
});

// ---------------------------------------------------------------------------
// Conteúdo
// ---------------------------------------------------------------------------
// GET /api/content/courses/:slug/nav?v=hash  (público, immutable) — ver Fase 1 §6
export const NavManifest = z.object({
  v: z.string(),
  course: Slug,
  modules: z.array(z.tuple([z.string(), z.string(), z.number().int(), z.number().int()])),
  groups: z.array(z.tuple([z.number().int(), z.string(), z.number().int(), z.number().int()])),
  chapters: z.array(z.tuple([z.string(), z.string(), z.union([z.literal(0), z.literal(1), z.literal(2)]), z.union([z.literal(0), z.literal(1)])])),
});

// GET /api/content/chapters/:id/body  (premium gate) → 200 | 401 | 403 PREMIUM_REQUIRED | 404
export const ChapterBody = z.object({
  chapterId: Id,
  contentVersion: z.string(),
  html: z.string(),                                    // HTML sanitizado gerado no build (não MDX executável)
});

// GET /api/content/chapters/:id/audio → URLs assinadas (2h)
export const ChapterAudio = z.object({
  status: z.enum(["ready", "generating", "unavailable"]),
  voice: z.string(),
  audioUrl: z.string().url().nullable(),
  alignmentUrl: z.string().url().nullable(),
  durationMs: z.number().int().nullable(),
  expiresAt: IsoDate.nullable(),
});

// GET /api/search?q=&course=&type=
export const SearchRequest = z.object({
  q: z.string().trim().min(2).max(120),
  course: Slug.optional(),
  type: z.enum(["chapter", "problem", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

// ---------------------------------------------------------------------------
// Progresso
// ---------------------------------------------------------------------------
// GET /api/me/progress?course=dsa
export const CourseProgress = z.object({
  v: z.string(),                                       // nav_version usado no bitset
  completed: z.string(),                               // bitset base64
  starred: z.array(z.number().int()),
  percent: z.number().min(0).max(100),
  lastChapterSlug: z.string().nullable(),
});

// GET /api/me/chapter-state?chapterId=  (ilha personalizada do capítulo — Fase 1 [R1])
export const ChapterState = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  percentRead: z.number().int(),
  lastBlockId: z.string().nullable(),
  audioPositionMs: z.number().int().nullable(),
  starred: z.boolean(),
  hasAccess: z.boolean(),
  highlights: z.array(z.lazy(() => Highlight)),
  notes: z.array(z.lazy(() => Note)),
});

// PUT /api/me/progress/:chapterId  (idempotente; enviado com debounce + sendBeacon ao sair)
export const UpsertProgressRequest = z.object({
  percentRead: z.number().int().min(0).max(100).optional(),
  lastBlockId: z.string().max(64).optional(),
  audioPositionMs: z.number().int().min(0).optional(),
  timeSpentDeltaS: z.number().int().min(0).max(600).optional(), // anti-fraude de streak
  completed: z.boolean().optional(),
});

// PUT/DELETE /api/me/stars
export const StarRequest = z.object({ targetType: z.enum(["chapter", "problem"]), targetId: Id });

// ---------------------------------------------------------------------------
// Destaques, notas, caderno
// ---------------------------------------------------------------------------
export const TextAnchor = z.object({
  blockId: z.string().max(64),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(1),
  quoteExact: z.string().min(1).max(5000),
  quotePrefix: z.string().max(64),
  quoteSuffix: z.string().max(64),
}).refine((a) => a.endOffset > a.startOffset, { message: "endOffset deve ser maior que startOffset" });

export const Highlight = z.object({
  id: Id,
  chapterId: Id,
  color: HighlightColor,
  anchor: TextAnchor,
  orphaned: z.boolean(),
  createdAt: IsoDate,
});
// POST /api/me/highlights
export const CreateHighlightRequest = z.object({
  chapterId: Id,
  contentVersion: z.string(),
  color: HighlightColor,
  anchor: TextAnchor,
});
// PATCH /api/me/highlights/:id
export const UpdateHighlightRequest = z.object({ color: HighlightColor });

export const Note = z.object({
  id: Id,
  courseId: Id,
  chapterId: Id.nullable(),
  highlightId: Id.nullable(),
  bodyMd: z.string(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
// POST /api/me/notes · PATCH /api/me/notes/:id
export const CreateNoteRequest = z.object({
  courseId: Id,
  chapterId: Id.optional(),
  highlightId: Id.optional(),
  bodyMd: z.string().trim().min(1).max(20000),
});
export const UpdateNoteRequest = z.object({ bodyMd: z.string().trim().min(1).max(20000) });

// GET /api/me/notebook?course=dsa&q=&cursor=
export const NotebookQuery = z.object({ course: Slug, q: z.string().max(120).optional(), cursor: Cursor });
export const NotebookEntry = z.object({
  chapter: z.object({ id: Id, slug: z.string(), title: z.string(), moduleTitle: z.string() }),
  highlights: z.array(Highlight),
  notes: z.array(Note),
});
// POST /api/me/notebook/export → 202 { exportId }; GET /api/me/notebook/export/:id
export const NotebookExportRequest = z.object({ course: Slug, format: z.enum(["md", "pdf"]) });

// ---------------------------------------------------------------------------
// Prática / submissões
// ---------------------------------------------------------------------------
// GET /api/practice/problems?track=&list=&difficulty=&pattern=&status=&sort=&cursor=
export const ProblemListQuery = z.object({
  track: z.enum(["dsa", "system-design", "lld", "concurrency"]),
  list: Slug.optional(),
  difficulty: Difficulty.optional(),
  pattern: Slug.optional(),
  status: z.enum(["any", "unsolved", "solved", "starred"]).default("any"),
  sort: z.enum(["default", "difficulty", "frequency", "title"]).default("default"),
  cursor: Cursor,
});

// POST /api/practice/submissions  (header Idempotency-Key obrigatório)
export const CreateSubmissionRequest = z.object({
  problemId: Id,
  language: Language,
  mode: z.enum(["run", "submit"]),
  code: z.string().min(1).max(65536),
  customInput: z.string().max(10000).optional(),       // só em mode=run
});
export const CreateSubmissionResponse = z.object({ submissionId: Id, streamUrl: z.string() });

export const Verdict = z.enum([
  "queued", "running", "accepted", "wrong_answer", "time_limit",
  "memory_limit", "runtime_error", "compile_error", "internal_error",
]);
// SSE GET /api/practice/submissions/:id/stream → events: status | result
export const SubmissionResult = z.object({
  submissionId: Id,
  verdict: Verdict,
  passed: z.number().int(),
  total: z.number().int(),
  cpuMs: z.number().int().nullable(),
  memoryKb: z.number().int().nullable(),
  compileOutput: z.string().nullable(),
  cases: z.array(z.object({
    ordinal: z.number().int(),
    hidden: z.boolean(),
    verdict: Verdict,
    input: z.unknown().optional(),                     // ausente para casos ocultos
    expected: z.unknown().optional(),
    actual: z.unknown().optional(),
    stdout: z.string().optional(),
    cpuMs: z.number().int().nullable(),
  })),
});

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------
// POST /api/quizzes/:id/attempts → { attemptId, questions (sem gabarito) }
// POST /api/quizzes/attempts/:attemptId/answers
export const QuizAnswerRequest = z.object({
  questionId: Id,
  answer: z.union([
    z.object({ kind: z.literal("single_choice"), optionId: z.string() }),
    z.object({ kind: z.literal("multiple_choice"), optionIds: z.array(z.string()).min(1).max(10) }),
    z.object({ kind: z.literal("code_completion"), blanks: z.record(z.string(), z.string().max(200)) }),
    z.object({ kind: z.literal("matching"), pairs: z.array(z.tuple([z.string(), z.string()])).max(20) }),
  ]),
});
export const QuizAnswerResponse = z.object({
  correct: z.boolean(),
  correctAnswer: z.unknown(),                          // revelado somente após responder
  explanationHtml: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// IA
// ---------------------------------------------------------------------------
// POST /api/ai/tutor  → text/event-stream (events: delta | refusal | done | error)
export const TutorRequest = z.object({
  threadId: Id.optional(),
  chapterId: Id.optional(),
  problemId: Id.optional(),
  action: z.enum(["ask", "explain_selection", "summarize", "hint", "review_code", "quiz_me"]),
  message: z.string().trim().min(1).max(4000),
  selection: z.string().max(4000).optional(),
  code: z.object({ language: Language, source: z.string().max(65536) }).optional(),
  hintLevel: z.number().int().min(1).max(3).optional(),
}).refine((r) => r.chapterId || r.problemId, { message: "chapterId ou problemId é obrigatório" });

export const TutorSseEvent = z.discriminatedUnion("event", [
  z.object({ event: z.literal("delta"), data: z.object({ t: z.string() }) }),
  z.object({ event: z.literal("refusal"), data: z.object({}) }),
  z.object({ event: z.literal("done"), data: z.object({ threadId: Id, messageId: Id, remainingToday: z.number().int() }) }),
  z.object({ event: z.literal("error"), data: z.object({ code: ErrorCode }) }),
]);

// POST /api/interviews → cria sessão
export const CreateInterviewRequest = z.object({
  type: z.enum(["coding", "system_design", "low_level_design", "behavioral"]),
  problemId: Id.optional(),                            // ausente = sorteio por nível
  language: Language.optional(),
  companyStyle: z.string().max(40).optional(),
  durationMinutes: z.union([z.literal(30), z.literal(45), z.literal(60)]).default(45),
});
// POST /api/interviews/:id/turns → SSE (mesmos eventos do tutor)
export const InterviewTurnRequest = z.object({
  message: z.string().trim().max(4000),
  editorSnapshot: z.string().max(65536).optional(),
  whiteboardSnapshot: z.unknown().optional(),
});
// GET /api/interviews/:id/report
export const InterviewReport = z.object({
  overall: z.number().min(1).max(4),
  hireSignal: z.enum(["strong_no", "no", "lean_no", "lean_yes", "yes", "strong_yes"]),
  dimensions: z.array(z.object({
    key: z.enum(["communication", "problem_solving", "coding", "testing", "complexity", "design_tradeoffs"]),
    score: z.number().int().min(1).max(4),
    evidence: z.array(z.string()).max(5),
    advice: z.string(),
  })),
  studyPlan: z.array(z.object({ title: z.string(), href: z.string() })).max(8),
});

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
// GET /api/billing/plans?currency=BRL
export const PlanOffer = z.object({
  id: Id,
  kind: PlanKind,
  currency: Currency,
  amountCents: z.number().int(),
  listCents: z.number().int().nullable(),
  durationDays: z.number().int().nullable(),
  methods: z.array(z.enum(["card", "pix"])),
});
// POST /api/billing/checkout  (header Idempotency-Key)
export const CheckoutRequest = z.object({
  planId: Id,
  method: z.enum(["card", "pix"]),
  couponCode: z.string().trim().max(40).optional(),
});
export const CheckoutResponse = z.object({ checkoutUrl: z.string().url(), sessionId: z.string() });

// ---------------------------------------------------------------------------
// LGPD
// ---------------------------------------------------------------------------
// POST /api/me/privacy/export → 202 · POST /api/me/privacy/delete → 202 (requer reautenticação < 5 min)
export const PrivacyRequestResponse = z.object({
  requestId: Id,
  kind: z.enum(["export", "delete"]),
  status: z.enum(["received", "processing", "ready", "completed", "failed"]),
  scheduledFor: IsoDate.nullable(),
});
export const DeleteAccountRequest = z.object({ confirmEmail: z.string().email(), reason: z.string().max(500).optional() });
