"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  encodeConfig,
  LEVELS,
  MAX_MINUTES,
  MINUTES,
  STYLES,
  type Difficulty,
  type InterviewConfig,
  type InterviewLevel,
  type InterviewStyle,
} from "@/lib/interview";

interface PastInterview {
  id: string;
  total: number;
  config: InterviewConfig;
  problems: Array<{ title: string; solved: boolean }>;
  createdAt: string;
}

const DIFF_LABEL: Record<Difficulty, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" };

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface-1 p-5">
      <h2 className="flex items-center gap-3 font-semibold">
        <span className="font-mono text-sm text-fg-subtle">{n}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function InterviewSetup({ counts }: { counts: Record<Difficulty, number> }) {
  const router = useRouter();
  const [style, setStyle] = useState<InterviewStyle>("standard");
  const [level, setLevel] = useState<InterviewLevel>("mid");
  const [noRun, setNoRun] = useState(false);
  const [mix, setMix] = useState<Record<Difficulty, number>>({ easy: 0, medium: 2, hard: 0 });
  const [history, setHistory] = useState<PastInterview[] | null>(null);

  useEffect(() => {
    fetch("/api/interviews")
      .then((r) => (r.ok ? r.json() : []))
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  const minutes = (Object.keys(mix) as Difficulty[]).reduce((m, d) => m + mix[d] * MINUTES[d], 0);
  const total = mix.easy + mix.medium + mix.hard;
  const tooLong = minutes > MAX_MINUTES;
  const notEnough = (Object.keys(mix) as Difficulty[]).some((d) => mix[d] > counts[d]);

  const choice = (active: boolean) =>
    `rounded-lg border p-3 text-left transition-colors duration-fast ${active ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"}`;

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Step n="01" title="Entrevistador">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(STYLES) as InterviewStyle[]).map((s) => (
              <button key={s} type="button" aria-pressed={style === s} className={choice(style === s)} onClick={() => setStyle(s)}>
                <p className="font-medium">{STYLES[s].label}</p>
                <p className="text-xs text-fg-muted">{STYLES[s].hint}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step n="02" title="Nível e formato">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(LEVELS) as InterviewLevel[]).map((l) => (
              <button key={l} type="button" aria-pressed={level === l} className={choice(level === l)} onClick={() => setLevel(l)}>
                <p className="font-medium">{LEVELS[l].label}</p>
                <p className="text-xs text-fg-muted">Aprovação a partir de {LEVELS[l].bar}/100</p>
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-line p-3">
            <input type="checkbox" checked={noRun} onChange={(e) => setNoRun(e.target.checked)} className="mt-1" />
            <span>
              <span className="font-medium">Modo sem executar</span>
              <span className="block text-xs text-fg-muted">
                Você não pode rodar o código durante a entrevista: percorre os exemplos de cabeça, como num quadro branco. Os testes rodam no
                final.
              </span>
            </span>
          </label>
        </Step>

        <Step n="03" title="Problemas">
          <div className="space-y-2">
            {(Object.keys(mix) as Difficulty[]).map((d) => (
              <div key={d} className="flex items-center justify-between rounded-lg border border-line p-3">
                <div>
                  <p className="font-medium">{DIFF_LABEL[d]}</p>
                  <p className="text-xs text-fg-muted">
                    {MINUTES[d]} min cada · {counts[d]} disponíveis
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={`Menos ${DIFF_LABEL[d]}`} disabled={mix[d] === 0}
                    onClick={() => setMix((m) => ({ ...m, [d]: m[d] - 1 }))}
                    className="size-8 rounded-md border border-line text-lg hover:bg-surface-2 disabled:opacity-40">−</button>
                  <span className="w-5 text-center tabular-nums">{mix[d]}</span>
                  <button type="button" aria-label={`Mais ${DIFF_LABEL[d]}`} disabled={mix[d] === 3 || mix[d] >= counts[d]}
                    onClick={() => setMix((m) => ({ ...m, [d]: m[d] + 1 }))}
                    className="size-8 rounded-md border border-line text-lg hover:bg-surface-2 disabled:opacity-40">+</button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-accent-text underline"
              onClick={() => {
                const opts: Array<Record<Difficulty, number>> = [
                  { easy: 1, medium: 1, hard: 0 },
                  { easy: 0, medium: 2, hard: 0 },
                  { easy: 0, medium: 1, hard: 1 },
                  { easy: 1, medium: 2, hard: 0 },
                ].filter((o) => (Object.keys(o) as Difficulty[]).every((d) => o[d] <= counts[d]));
                if (opts.length) setMix(opts[Math.floor(Math.random() * opts.length)]);
              }}
            >
              Me surpreenda
            </button>
          </div>
        </Step>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-surface-1 p-5 lg:sticky lg:top-[calc(var(--cf-layout-header-h)+1rem)]">
        <h2 className="font-semibold">Resumo</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-fg-muted">Duração</dt><dd className={tooLong ? "text-danger" : ""}>{minutes} min / {MAX_MINUTES} máx.</dd></div>
          <div className="flex justify-between"><dt className="text-fg-muted">Problemas</dt><dd>{(Object.keys(mix) as Difficulty[]).filter((d) => mix[d]).map((d) => `${mix[d]} ${DIFF_LABEL[d]}`).join(", ") || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-fg-muted">Entrevistador</dt><dd>{STYLES[style].label}</dd></div>
          <div className="flex justify-between"><dt className="text-fg-muted">Nível</dt><dd>{LEVELS[level].label}</dd></div>
          <div className="flex justify-between"><dt className="text-fg-muted">Formato</dt><dd>{noRun ? "Sem executar" : "Executar à vontade"}</dd></div>
        </dl>
        <button
          type="button"
          disabled={total === 0 || tooLong || notEnough}
          onClick={() => router.push(`/interview/session?c=${encodeConfig({ style, level, noRun, mix })}`)}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
        >
          Começar entrevista
        </button>
        {tooLong && <p className="mt-2 text-xs text-danger">Reduza para no máximo {MAX_MINUTES} minutos.</p>}
      </aside>

      <section className="lg:col-span-2">
        <h2 className="mt-4 font-semibold">Entrevistas anteriores</h2>
        {history === null ? (
          <p className="mt-2 text-sm text-fg-muted">Carregando…</p>
        ) : history.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">Nenhuma ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface-1">
            {history.map((h) => {
              const bar = LEVELS[h.config.level]?.bar ?? 70;
              return (
                <li key={h.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className={`w-14 text-lg font-semibold tabular-nums ${h.total >= bar ? "text-success" : "text-danger"}`}>{h.total}</span>
                  <span className="flex-1">{h.problems.map((p) => `${p.solved ? "✓" : "✗"} ${p.title}`).join(" · ")}</span>
                  <span className="text-xs text-fg-subtle">{new Date(h.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-fg-subtle">
          Dica: antes de começar, revise <Link href="/learn/dsa/framework-de-resolucao" className="underline">o roteiro para resolver problemas</Link>.
        </p>
      </section>
    </div>
  );
}
