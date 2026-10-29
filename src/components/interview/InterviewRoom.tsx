"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ProblemWorkspace, type ProblemSpec } from "@/components/practice/ProblemWorkspace";
import { PROGRESS_EVENT, type ProgressEventDetail } from "@/lib/events";
import {
  decodeConfig,
  LEVELS,
  MINUTES,
  RUBRIC,
  SCORE_LABELS,
  STYLES,
  totalScore,
  type Difficulty,
  type RubricKey,
} from "@/lib/interview";

interface PoolItem {
  course: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
}
interface Loaded extends PoolItem {
  statementHtml: string;
  statementHtmlNoHints: string;
  problem: ProblemSpec;
}

const DIFF_LABEL: Record<Difficulty, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" };

function fmt(s: number) {
  const m = Math.floor(Math.abs(s) / 60);
  const r = Math.abs(s) % 60;
  return `${s < 0 ? "-" : ""}${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Room({ pool }: { pool: PoolItem[] }) {
  const params = useSearchParams();
  const config = useMemo(() => decodeConfig(params.get("c")), [params]);
  const [problems, setProblems] = useState<Loaded[] | null>(null);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"running" | "review" | "saved">("running");
  const [elapsed, setElapsed] = useState(0);
  const [scores, setScores] = useState<Record<RubricKey, number>>(
    () => Object.fromEntries(RUBRIC.map((r) => [r.key, 3])) as Record<RubricKey, number>,
  );
  const [notes, setNotes] = useState("");
  const id = useRef(crypto.randomUUID());

  // Sorteia os problemas uma vez
  useEffect(() => {
    if (!config) return;
    const picked: PoolItem[] = [];
    for (const d of ["easy", "medium", "hard"] as Difficulty[]) {
      const candidates = pool.filter((p) => p.difficulty === d).sort(() => Math.random() - 0.5);
      picked.push(...candidates.slice(0, config.mix[d]));
    }
    Promise.all(
      picked.map((p) =>
        fetch(`/api/problems/${p.course}/${p.slug}`)
          .then((r) => r.json())
          .then((d) => ({
            ...p,
            statementHtml: d.statementHtml as string,
            statementHtmlNoHints: d.statementHtmlNoHints as string,
            problem: d.problem as ProblemSpec,
          })),
      ),
    ).then(setProblems);
  }, [config, pool]);

  useEffect(() => {
    if (phase !== "running" || !problems) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase, problems]);

  // Problema resolvido (todos os testes passaram) → marca na sessão
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<ProgressEventDetail>).detail;
      if (d.completed) setSolved((s) => new Set(s).add(d.key));
    };
    window.addEventListener(PROGRESS_EVENT, on);
    return () => window.removeEventListener(PROGRESS_EVENT, on);
  }, []);

  if (!config) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p>Configuração inválida.</p>
        <Link href="/interview" className="mt-3 inline-block text-accent-text underline">Voltar</Link>
      </main>
    );
  }
  if (!problems) return <main className="px-4 py-16 text-center text-fg-muted">Sorteando problemas…</main>;

  const budget = problems.reduce((s, p) => s + MINUTES[p.difficulty] * 60, 0);
  const remaining = budget - elapsed;
  const current = problems[index];
  const key = (p: PoolItem) => `${p.course}/${p.slug}`;
  const total = totalScore(scores);
  const bar = LEVELS[config.level].bar;

  async function save() {
    await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id.current,
        config,
        problems: problems!.map((p) => ({ key: key(p), title: p.title, difficulty: p.difficulty, solved: solved.has(key(p)) })),
        scores,
        total,
        notes,
        durationS: elapsed,
      }),
    });
    setPhase("saved");
  }

  if (phase !== "running") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Avaliação</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Tempo usado: {fmt(elapsed)} de {fmt(budget)} · {solved.size}/{problems.length} problema(s) com todos os testes passando.
          Seja honesto: a nota só serve para você.
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {problems.map((p) => (
            <li key={key(p)}>
              {solved.has(key(p)) ? "✓" : "✗"}{" "}
              <Link href={`/learn/${p.course}/${p.slug}`} className="underline" target="_blank">{p.title}</Link>{" "}
              <span className="text-fg-subtle">({DIFF_LABEL[p.difficulty]})</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          {RUBRIC.map((r) => (
            <fieldset key={r.key} className="rounded-lg border border-line bg-surface-1 p-4" disabled={phase === "saved"}>
              <legend className="sr-only">{r.label}</legend>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{r.label} <span className="text-xs text-fg-subtle">peso {r.weight}%</span></p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={scores[r.key] === v}
                      title={SCORE_LABELS[v]}
                      onClick={() => setScores((s) => ({ ...s, [r.key]: v }))}
                      className="size-8 rounded-md border border-line text-sm aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-fg-on-accent"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-fg-muted">{r.hint} · <span className="font-medium">{SCORE_LABELS[scores[r.key]]}</span></p>
            </fieldset>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium" htmlFor="notes">O que melhorar na próxima</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={phase === "saved"}
          className="mt-1 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2 text-sm" />

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface-2 p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-fg-subtle">Nota</p>
            <p className={`text-4xl font-semibold tabular-nums ${total >= bar ? "text-success" : "text-danger"}`}>{total}<span className="text-lg text-fg-subtle">/100</span></p>
          </div>
          <p className="flex-1 text-sm text-fg-muted">
            {total >= bar ? "Acima" : "Abaixo"} da linha de aprovação para {LEVELS[config.level].label} ({bar}/100).
          </p>
          {phase === "saved" ? (
            <Link href="/interview" className="rounded-md border border-line px-4 py-2 text-sm hover:bg-surface-1">Salvo ✓ · Nova entrevista</Link>
          ) : (
            <button type="button" onClick={save} className="rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover">
              Salvar no histórico
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-16 pt-4 lg:px-8">
      <div className="sticky top-header z-30 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur lg:-mx-8 lg:px-8">
        <span className={`font-mono text-lg font-semibold tabular-nums ${remaining < 0 ? "text-danger" : remaining < 300 ? "text-warning" : ""}`} aria-live="off">
          ⏱ {fmt(remaining)}
        </span>
        <span className="text-xs text-fg-subtle">{STYLES[config.style].label} · {LEVELS[config.level].label}{config.noRun ? " · sem executar" : ""}</span>
        <nav className="ml-auto flex gap-1" aria-label="Problemas da entrevista">
          {problems.map((p, i) => (
            <button key={key(p)} type="button" aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)}
              className="rounded-md border border-line px-3 py-1 text-sm aria-[current=step]:border-accent aria-[current=step]:bg-accent-soft">
              {solved.has(key(p)) ? "✓ " : ""}{i + 1}. {DIFF_LABEL[p.difficulty]}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => { if (confirm("Encerrar a entrevista e ir para a avaliação?")) setPhase("review"); }}
          className="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-fg-on-accent">
          Encerrar
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-label="Enunciado" className="rounded-xl border border-line bg-surface-1 p-5">
          <h1 className="text-xl font-semibold">{current.title}</h1>
          <p className="mt-1 text-xs text-fg-subtle">{DIFF_LABEL[current.difficulty]} · {MINUTES[current.difficulty]} min sugeridos</p>
          {/* HTML gerado no servidor a partir do Markdown do próprio repositório */}
          <div
            className="cf-prose mt-4 text-[0.95rem]"
            dangerouslySetInnerHTML={{ __html: config.style === "coaching" ? current.statementHtml : current.statementHtmlNoHints }}
          />
          {config.style !== "coaching" && <p className="mt-4 text-xs text-fg-subtle">Dicas ocultas neste modo de entrevistador.</p>}
        </section>
        <div key={key(current)}>
          <ProblemWorkspace chapterKey={key(current)} problem={current.problem} allowRun={!config.noRun} />
        </div>
      </div>
    </main>
  );
}

export function InterviewRoom({ pool }: { pool: PoolItem[] }) {
  return (
    <Suspense fallback={<main className="px-4 py-16 text-center text-fg-muted">Carregando…</main>}>
      <Room pool={pool} />
    </Suspense>
  );
}
