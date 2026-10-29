"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  today: string;
  streak: number;
  activity: Array<{ day: string; events: number }>;
  recent: Array<{ key: string; percentRead: number; completed: boolean; updatedAt: string }>;
  totals: { completed: number; highlights: number; notes: number };
}

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

export function Dashboard({
  courses,
  titles,
}: {
  courses: Array<{ slug: string; title: string; total: number }>;
  titles: Record<string, string>;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [progress, setProgress] = useState<Record<string, { completed: boolean }>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/dashboard").then((r) => r.json()), fetch("/api/state").then((r) => r.json())])
      .then(([d, s]) => {
        setData(d);
        setProgress(s.progress);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="mt-6 text-danger">Não foi possível carregar o painel.</p>;
  if (!data) return <p className="mt-6 text-fg-muted">Carregando…</p>;

  // Mapa de calor em colunas de semanas (domingo no topo), como no GitHub.
  const firstWeekday = new Date(`${data.activity[0].day}T12:00:00Z`).getUTCDay();
  const cells: Array<{ day: string; events: number } | null> = [...Array(firstWeekday).fill(null), ...data.activity];
  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const activeDays = data.activity.filter((d) => d.events > 0).length;

  const stat = (label: string, value: number | string, hint?: string) => (
    <div className="rounded-lg border border-line bg-surface-1 p-4">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {stat("Sequência", `${data.streak} ${data.streak === 1 ? "dia" : "dias"}`, data.streak ? "Continue hoje para manter" : "Estude hoje para começar")}
        {stat("Capítulos concluídos", data.totals.completed)}
        {stat("Destaques", data.totals.highlights)}
        {stat("Notas", data.totals.notes)}
      </div>

      <section className="mt-8 rounded-lg border border-line bg-surface-1 p-4">
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
          <ul className="mt-3 space-y-3">
            {courses.map((c) => {
              const done = Object.entries(progress).filter(([k, p]) => k.startsWith(`${c.slug}/`) && p.completed).length;
              const pct = c.total ? Math.round((done / c.total) * 100) : 0;
              return (
                <li key={c.slug}>
                  <div className="flex justify-between text-sm">
                    <Link href={`/learn/${c.slug}`} className="hover:text-accent-text">{c.title}</Link>
                    <span className="tabular-nums text-fg-muted">{done}/{c.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h2 className="font-semibold">Continuar estudando</h2>
          {data.recent.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Nenhum capítulo aberto ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface-1">
              {data.recent.map((r) => {
                const [course, slug] = r.key.split("/");
                return (
                  <li key={r.key}>
                    <Link href={`/learn/${course}/${slug}`} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-2">
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
