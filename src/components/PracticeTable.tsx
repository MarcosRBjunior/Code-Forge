"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PracticeList } from "@/lib/practice-lists";
import { Fragment, useEffect, useMemo, useState } from "react";
import { replayAnimation } from "@/lib/motion";

export interface PracticeProblem {
  key: string;
  course: string;
  courseTitle: string;
  slug: string;
  title: string;
  pattern: string;
  difficulty: "easy" | "medium" | "hard";
  available: boolean;
}

type Status = "all" | "unsolved" | "solved" | "starred";

const DIFF = {
  easy: { label: "Fácil", text: "text-success", bar: "bg-success" },
  medium: { label: "Médio", text: "text-warning", bar: "bg-warning" },
  hard: { label: "Difícil", text: "text-danger", bar: "bg-danger" },
} as const;

/** Pílula de dificuldade: fundo a 10% da cor e borda a 20% (cores semânticas dos tokens). */
const PILL = {
  easy: "border-success/20 bg-success-soft text-success",
  medium: "border-warning/20 bg-warning-soft text-warning",
  hard: "border-danger/20 bg-danger-soft text-danger",
} as const;

const input = "min-h-10 rounded-md border border-line-input bg-surface-1 px-2.5 py-1.5 text-sm";

/** Postel: busca tolerante a maiúsculas, acentos e espaços extras ("arvore  binaria" acha "Árvore Binária"). */
function fold(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function PracticeTable({ problems: allProblems, lists }: { problems: PracticeProblem[]; lists: PracticeList[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const listId = params.get("lista") ?? "";
  const activeList = lists.find((l) => l.id === listId);
  const problems = useMemo(() => {
    if (!activeList) return allProblems;
    const order = new Map(activeList.keys.map((k, i) => [k, i]));
    return allProblems.filter((p) => order.has(p.key));
  }, [allProblems, activeList]);
  const chooseList = (id: string) => router.replace(id ? `/practice?lista=${id}` : "/practice", { scroll: false });
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [pattern, setPattern] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [showPlanned, setShowPlanned] = useState(false);
  const [grouped, setGrouped] = useState(true);
  // Follow through só na primeira renderização: depois, filtrar não deve fazer a tabela "dançar"
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { progress: Record<string, { completed: boolean }>; starred: string[] } | null) => {
        if (!s) return;
        setSolved(new Set(Object.entries(s.progress).filter(([, p]) => p.completed).map(([k]) => k)));
        setStarred(new Set(s.starred));
      })
      .catch(() => {});
  }, []);

  const patterns = useMemo(() => Array.from(new Set(problems.map((p) => p.pattern))), [problems]);
  const available = problems.filter((p) => p.available);

  const filtered = useMemo(() => {
    const needle = fold(q);
    return problems.filter(
      (p) =>
        (showPlanned || p.available) &&
        (!needle || fold(p.title).includes(needle) || fold(p.pattern).includes(needle)) &&
        (!pattern || p.pattern === pattern) &&
        (!difficulty || p.difficulty === difficulty) &&
        (status === "all" ||
          (status === "solved" && solved.has(p.key)) ||
          (status === "unsolved" && !solved.has(p.key)) ||
          (status === "starred" && starred.has(p.key))),
    );
  }, [problems, q, pattern, difficulty, status, solved, starred, showPlanned]);

  const hasFilters = q.trim() !== "" || pattern !== "" || difficulty !== "" || status !== "all" || showPlanned;
  function clearFilters() {
    setQ("");
    setPattern("");
    setDifficulty("");
    setStatus("all");
    setShowPlanned(false);
  }

  /** Doherty: favoritar é otimista; se o servidor recusar, desfaz. */
  function toggleStar(key: string, el: HTMLElement) {
    const next = !starred.has(key);
    const apply = (on: boolean) =>
      setStarred((s) => {
        const copy = new Set(s);
        if (on) copy.add(key);
        else copy.delete(key);
        return copy;
      });
    apply(next);
    // Exagero: a estrela dá um "pulo" ao mudar de estado
    replayAnimation(el, "cf-bounce");
    fetch("/api/stars", {
      method: next ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {
        apply(!next);
        replayAnimation(el, "cf-wiggle");
      });
  }

  function pickRandom() {
    const pool = filtered.filter((p) => p.available && !solved.has(p.key));
    const list = pool.length ? pool : filtered.filter((p) => p.available);
    if (!list.length) return;
    const p = list[Math.floor(Math.random() * list.length)];
    router.push(`/learn/${p.course}/${p.slug}`);
  }

  return (
    <>
      {/* Listas por prazo */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Lista de problemas">
        {[{ id: "", title: "Todos os problemas", period: "sem prazo", description: "Tudo, com os filtros abaixo.", keys: allProblems.filter((p) => p.available).map((p) => p.key) }, ...lists].map((l) => {
          const done = l.keys.filter((k) => solved.has(k)).length;
          const selected = (activeList?.id ?? "") === l.id;
          return (
            <button
              key={l.id || "todos"}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseList(l.id)}
              className={`cf-lift rounded-lg border p-3 text-left hover:bg-surface-2 ${selected ? "border-accent bg-accent-soft ring-1 ring-accent" : "border-line bg-surface-1"}`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{l.title}</span>
                <span className="text-xs text-fg-subtle">{l.period}</span>
              </span>
              <span className="mt-1 block text-xs text-fg-muted">{l.description}</span>
              <span className="mt-2 block text-xs tabular-nums text-fg-muted">
                {done} de {l.keys.length} resolvidos
              </span>
            </button>
          );
        })}
      </div>

      {/* Progresso por dificuldade */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(Object.keys(DIFF) as Array<keyof typeof DIFF>).map((d) => {
          const total = available.filter((p) => p.difficulty === d).length;
          const done = available.filter((p) => p.difficulty === d && solved.has(p.key)).length;
          return (
            <div key={d} className="rounded-lg border border-line bg-surface-1 p-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className={`font-medium ${DIFF[d].text}`}>{DIFF[d].label}</span>
                <span className="tabular-nums text-fg-muted">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className={`cf-progress-fill h-full rounded-full ${DIFF[d].bar}`} style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar problema…"
          aria-label="Buscar problema"
          className={`${input} w-full sm:w-56`}
        />
        <select value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Padrão" className={input}>
          <option value="">Todos os padrões</option>
          {patterns.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Dificuldade" className={input}>
          <option value="">Todas as dificuldades</option>
          <option value="easy">Fácil</option>
          <option value="medium">Médio</option>
          <option value="hard">Difícil</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as Status)} aria-label="Situação" className={input}>
          <option value="all">Todos</option>
          <option value="unsolved">Não resolvidos</option>
          <option value="solved">Resolvidos</option>
          <option value="starred">Favoritos</option>
        </select>
        <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-sm text-fg-muted">
          <input type="checkbox" checked={showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} />
          Mostrar “em breve”
        </label>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="cf-fade-in min-h-10 rounded-md px-2.5 py-1.5 text-sm text-fg-muted underline hover:text-fg">
            Limpar filtros
          </button>
        )}
        <button
          type="button"
          aria-pressed={!grouped}
          onClick={() => setGrouped((g) => !g)}
          className="ml-auto min-h-10 rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2"
        >
          {grouped ? "Ocultar grupos" : "Mostrar grupos"}
        </button>
        <button
          type="button"
          onClick={pickRandom}
          className="min-h-10 rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-fg-on-accent hover:bg-accent-hover"
        >
          🎲 Problema aleatório
        </button>
      </div>

      {/* Tabela */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface-1">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-fg-muted">
            <tr>
              <th scope="col" className="w-10 px-3 py-2 text-right">#</th>
              <th scope="col" className="w-20 px-3 py-2 text-center">Status</th>
              <th scope="col" className="px-3 py-2">Problema</th>
              <th scope="col" className="hidden px-3 py-2 sm:table-cell">Padrão</th>
              <th scope="col" className="px-3 py-2">Dificuldade</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-line ${entering ? "cf-stagger" : ""}`}>
            {filtered.map((p, i) => (
              <Fragment key={p.key}>
              {grouped && (i === 0 || filtered[i - 1].pattern !== p.pattern) && (
                <tr className="bg-surface-2">
                  <th colSpan={5} scope="colgroup" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
                    {p.pattern}
                    <span className="ml-2 font-normal normal-case tabular-nums text-fg-subtle">
                      {filtered.filter((x) => x.pattern === p.pattern && solved.has(x.key)).length}/
                      {filtered.filter((x) => x.pattern === p.pattern).length}
                    </span>
                  </th>
                </tr>
              )}
              <tr className={p.available ? "hover:bg-surface-2" : "opacity-60"}>
                <td className="px-3 py-2.5 text-right tabular-nums text-fg-subtle">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center justify-center gap-1.5">
                    {solved.has(p.key) ? (
                      <span className="w-3 text-success" title="Resolvido">✓</span>
                    ) : (
                      <span className="w-3 text-center text-fg-subtle" aria-hidden>·</span>
                    )}
                    <button
                      type="button"
                      aria-pressed={starred.has(p.key)}
                      aria-label={starred.has(p.key) ? `Remover ${p.title} dos favoritos` : `Favoritar ${p.title}`}
                      title={starred.has(p.key) ? "Favorito" : "Favoritar"}
                      onClick={(e) => toggleStar(p.key, e.currentTarget)}
                      className={`cf-hit inline-grid size-6 place-items-center rounded-md leading-none ${
                        starred.has(p.key) ? "text-warning" : "text-fg-subtle opacity-60 hover:text-warning hover:opacity-100"
                      }`}
                    >
                      {starred.has(p.key) ? "★" : "☆"}
                    </button>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/learn/${p.course}/${p.slug}`} className="font-medium hover:text-accent-text">
                    {p.title}
                  </Link>
                  {!p.available && <span className="ml-2 text-[10px] uppercase tracking-wide text-fg-subtle">em breve</span>}
                </td>
                <td className="hidden px-3 py-2.5 text-fg-muted sm:table-cell">{p.pattern}</td>
                <td className="px-3 py-2.5"><span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${PILL[p.difficulty]}`}>{DIFF[p.difficulty].label}</span></td>
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="cf-fade-in px-3 py-6 text-center text-fg-muted">
            Nenhum problema com esses filtros.{" "}
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-accent-text underline">
                Limpar filtros
              </button>
            )}
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-fg-subtle">
        {filtered.length} problema(s) · {available.length} disponíveis de {problems.length} planejados
      </p>
    </>
  );
}
