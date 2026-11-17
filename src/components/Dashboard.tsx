"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDelayedFlag } from "@/lib/motion";

interface DashboardData {
  today: string;
  streak: number;
  activity: Array<{ day: string; events: number }>;
  recent: Array<{ key: string; percentRead: number; completed: boolean; updatedAt: string }>;
  totals: { completed: number; highlights: number; notes: number };
}

type Recent = DashboardData["recent"][number];

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function level(events: number) {
  if (events === 0) return 0;
  if (events < 5) return 1;
  if (events < 15) return 2;
  if (events < 40) return 3;
  return 4;
}
const LEVEL_BG = [
  "var(--cf-surface-3)",
  "color-mix(in oklab, var(--cf-success) 30%, var(--cf-surface-1))",
  "color-mix(in oklab, var(--cf-success) 55%, var(--cf-surface-1))",
  "color-mix(in oklab, var(--cf-success) 80%, var(--cf-surface-1))",
  "var(--cf-success)",
];

function formatDay(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Quantidade de cartões de revisão de hoje; falha vira null (o card mostra só o atalho). */
function fetchDue(): Promise<number | null> {
  return fetch("/api/reviews?summary=1")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { counts?: { due?: number } } | null) => d?.counts?.due ?? null)
    .catch(() => null);
}

/**
 * Frequência de uso + Hick: os três destinos mais usados (continuar, revisar, praticar) num só lugar,
 * com "continuar" em destaque (staging). Usado no painel e na página inicial.
 */
export function NextSteps({
  recent,
  due,
  titles,
  courseTitles = {},
}: {
  recent: Recent[];
  due: number | null;
  titles: Record<string, string>;
  courseTitles?: Record<string, string>;
}) {
  // Último capítulo ainda não concluído; se todos foram concluídos, o mais recente.
  const resume = recent.find((r) => !r.completed) ?? recent[0];
  const [course, slug] = resume ? resume.key.split("/") : [];
  // cf-lift fica no link e a cascata no invólucro: a animação de entrada (fill "both") prenderia o transform do hover.
  const card = "cf-lift group flex h-full min-h-24 flex-col justify-between rounded-lg border p-4";

  return (
    <div className="cf-stagger grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-2">
        {resume ? (
          <Link
            href={`/learn/${course}/${slug}`}
            className={`${card} border-accent bg-accent-soft`}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-accent-text">Continuar de onde parou</span>
            <span className="mt-1 flex items-center gap-2 font-semibold">
              <span className="truncate">{titles[resume.key] ?? slug}</span>
              <span aria-hidden className="cf-nudge ml-auto text-accent-text">→</span>
            </span>
            <span className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
              {courseTitles[course] && <span className="truncate">{courseTitles[course]}</span>}
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span
                  className="cf-progress-fill block h-full rounded-full bg-accent"
                  style={{ width: `${resume.completed ? 100 : resume.percentRead}%` }}
                />
              </span>
              <span className="tabular-nums">{resume.completed ? "concluído" : `${resume.percentRead}%`}</span>
            </span>
          </Link>
        ) : (
          <Link href="/learn/dsa" className={`${card} border-accent bg-accent-soft`}>
            <span className="text-xs font-medium uppercase tracking-wide text-accent-text">Primeiro passo</span>
            <span className="mt-1 flex items-center gap-2 font-semibold">
              Comece pelo curso de algoritmos <span aria-hidden className="cf-nudge ml-auto text-accent-text">→</span>
            </span>
          </Link>
        )}
      </div>
      <div>
        <Link href="/review" className={`${card} ${due ? "border-accent" : "border-line"} bg-surface-1`}>
          <span className="text-xs uppercase tracking-wide text-fg-subtle">Revisão de hoje</span>
          <span className="mt-1 flex items-baseline gap-1.5">
            {due ? (
              <>
                <span className="text-2xl font-semibold tabular-nums">{due}</span>
                <span className="text-sm text-fg-muted">{due === 1 ? "cartão" : "cartões"}</span>
              </>
            ) : (
              <span className="text-sm text-fg-muted">{due === 0 ? "Tudo em dia" : "Abrir revisão"}</span>
            )}
            <span aria-hidden className="cf-nudge ml-auto text-fg-subtle">→</span>
          </span>
        </Link>
      </div>
      <div>
        <Link href="/practice?lista=75" className={`${card} border-line bg-surface-1`}>
          <span className="text-xs uppercase tracking-wide text-fg-subtle">Praticar</span>
          <span className="mt-1 flex items-baseline gap-1.5 text-sm font-medium">
            CodeForge 75
            <span aria-hidden className="cf-nudge ml-auto text-fg-subtle">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/** Placeholder no formato dos cards de próximos passos (Doherty: algo aparece antes dos dados). */
function NextStepsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-4" aria-hidden>
      <div className="cf-skeleton min-h-24 rounded-lg sm:col-span-2" />
      <div className="cf-skeleton min-h-24 rounded-lg" />
      <div className="cf-skeleton min-h-24 rounded-lg" />
    </div>
  );
}

/** Página inicial: atalho para retomar o estudo. Sem sessão ou com erro, simplesmente não aparece. */
export function ResumeStrip({ titles, courseTitles }: { titles: Record<string, string>; courseTitles: Record<string, string> }) {
  const [state, setState] = useState<{ recent: Recent[]; due: number | null } | null | "error">(null);
  const showSkeleton = useDelayedFlag(state === null);

  useEffect(() => {
    Promise.all([fetch("/api/dashboard").then((r) => (r.ok ? (r.json() as Promise<DashboardData>) : Promise.reject())), fetchDue()])
      .then(([d, due]) => setState({ recent: d.recent, due }))
      .catch(() => setState("error"));
  }, []);

  if (state === "error") return null;
  return (
    <section aria-label="Próximos passos" className="mt-8">
      {state ? (
        <NextSteps recent={state.recent} due={state.due} titles={titles} courseTitles={courseTitles} />
      ) : showSkeleton ? (
        <NextStepsSkeleton />
      ) : (
        <div className="min-h-24" />
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando painel">
      <div className="mt-6">
        <NextStepsSkeleton />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="cf-skeleton h-[88px] rounded-lg" />
        ))}
      </div>
      <div className="cf-skeleton mt-8 h-40 rounded-lg" aria-hidden />
    </div>
  );
}

export function Dashboard({
  courses,
  titles,
}: {
  courses: Array<{ slug: string; title: string; total: number }>;
  titles: Record<string, string>;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [progress, setProgress] = useState<Record<string, { completed: boolean }>>({});
  const [due, setDue] = useState<number | null>(null);
  const [error, setError] = useState(false);
  // Pose to pose: as barras nascem em 0 e crescem até o valor real no frame seguinte.
  const [grown, setGrown] = useState(false);
  const showSkeleton = useDelayedFlag(!data && !error);

  useEffect(() => {
    Promise.all([fetch("/api/dashboard").then((r) => r.json()), fetch("/api/state").then((r) => r.json()), fetchDue()])
      .then(([d, s, n]) => {
        setData(d);
        setProgress(s.progress);
        setDue(n);
        requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="mt-6 text-danger">Não foi possível carregar o painel.</p>;
  if (!data) return showSkeleton ? <DashboardSkeleton /> : null;

  // Mapa de calor em colunas de semanas (domingo no topo), como no GitHub.
  const firstWeekday = new Date(`${data.activity[0].day}T12:00:00Z`).getUTCDay();
  const cells: Array<{ day: string; events: number } | null> = [...Array(firstWeekday).fill(null), ...data.activity];
  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const activeDays = data.activity.filter((d) => d.events > 0).length;

  // Miller: cursos em andamento primeiro (mais adiantados no topo); os não iniciados ficam agrupados à parte.
  const courseRows = courses.map((c) => {
    const done = Object.entries(progress).filter(([k, p]) => k.startsWith(`${c.slug}/`) && p.completed).length;
    return { ...c, done, pct: c.total ? Math.round((done / c.total) * 100) : 0 };
  });
  const started = courseRows.filter((c) => c.done > 0).sort((a, b) => b.pct - a.pct);
  const notStarted = courseRows.filter((c) => c.done === 0);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));

  const stat = (label: string, value: number | string, hint?: string) => (
    <div className="rounded-lg border border-line bg-surface-1 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );

  const courseRow = (c: (typeof courseRows)[number]) => (
    <li key={c.slug}>
      <div className="flex justify-between text-sm">
        <Link href={`/learn/${c.slug}`} className="hover:text-accent-text">{c.title}</Link>
        <span className="tabular-nums text-fg-muted">{c.done}/{c.total}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="cf-progress-fill h-full rounded-full bg-success" style={{ width: grown ? `${c.pct}%` : 0 }} />
      </div>
    </li>
  );

  return (
    <>
      <div className="mt-6">
        <NextSteps recent={data.recent} due={due} titles={titles} courseTitles={courseTitles} />
      </div>

      <div className="cf-stagger mt-6 grid gap-3 sm:grid-cols-4">
        {stat("Sequência", `${data.streak} ${data.streak === 1 ? "dia" : "dias"}`, data.streak ? "Continue hoje para manter" : "Estude hoje para começar")}
        {stat("Capítulos concluídos", data.totals.completed)}
        {stat("Destaques", data.totals.highlights)}
        {stat("Notas", data.totals.notes)}
      </div>

      <section className="cf-rise-in mt-8 rounded-lg border border-line bg-surface-1 p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Atividade</h2>
          <p className="text-xs text-fg-muted">
            {activeDays} {activeDays === 1 ? "dia" : "dias"} de estudo nas últimas 16 semanas
          </p>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] leading-3 text-fg-subtle">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="h-3">{i % 2 ? w : ""}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-rows-7 gap-1">
              {week.map((c, di) =>
                c ? (
                  <span
                    key={di}
                    title={`${formatDay(c.day)}: ${c.events ? `${c.events} atividade(s)` : "sem estudo"}`}
                    className={`size-3 rounded-[3px] ${c.day === data.today ? "ring-1 ring-[var(--cf-focus-ring)]" : ""}`}
                    style={{ background: LEVEL_BG[level(c.events)] }}
                  />
                ) : (
                  <span key={di} className="size-3" />
                ),
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="font-semibold">Progresso por curso</h2>
          {started.length > 0 ? (
            <>
              <ul className="mt-3 space-y-3">{started.map(courseRow)}</ul>
              {notStarted.length > 0 && (
                <details className="group mt-4">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-md text-sm text-fg-muted hover:text-fg">
                    <span aria-hidden className="text-[10px] transition-transform duration-fast group-open:rotate-90">▶</span>
                    Não iniciados ({notStarted.length})
                  </summary>
                  <ul className="cf-stagger mt-2 space-y-3">{notStarted.map(courseRow)}</ul>
                </details>
              )}
            </>
          ) : (
            <ul className="mt-3 space-y-3">{courseRows.map(courseRow)}</ul>
          )}
        </section>
        <section>
          <h2 className="font-semibold">Abertos recentemente</h2>
          {data.recent.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Nenhum capítulo aberto ainda.</p>
          ) : (
            <ul className="cf-stagger mt-3 divide-y divide-line rounded-lg border border-line bg-surface-1 shadow-sm">
              {data.recent.map((r) => {
                const [course, slug] = r.key.split("/");
                return (
                  <li key={r.key}>
                    <Link href={`/learn/${course}/${slug}`} className="flex min-h-10 items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-2">
                      <span className="flex-1 truncate">{titles[r.key] ?? slug}</span>
                      <span className={`text-xs tabular-nums ${r.completed ? "text-success" : "text-fg-muted"}`}>
                        {r.completed ? "✓ concluído" : `${r.percentRead}%`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
