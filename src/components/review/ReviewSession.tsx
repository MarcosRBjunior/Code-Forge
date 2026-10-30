"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { previewLabels, RATING_LABELS, schedule, type Rating } from "@/lib/srs";
import type { ReviewCounts, ReviewItem } from "@/lib/reviews";

const RATINGS: Rating[] = [1, 2, 3, 4];
const RATING_STYLE: Record<Rating, string> = {
  1: "border-danger text-danger",
  2: "border-line text-fg",
  3: "border-accent text-accent",
  4: "border-success text-success",
};

/** Pista de um destaque: só o começo do trecho, para você tentar lembrar o resto. */
function cue(quote: string) {
  const words = quote.split(/\s+/);
  return words.length <= 6 ? null : `${words.slice(0, 5).join(" ")} …`;
}

export function ReviewSession() {
  const [queue, setQueue] = useState<ReviewItem[] | null>(null);
  const [counts, setCounts] = useState<ReviewCounts | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [reviewed, setReviewed] = useState<Record<Rating, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setQueue(d.queue);
        setCounts(d.counts);
      })
      .catch(() => setError(true));
  }, []);

  const current = queue?.[0];
  const previews = useMemo(() => (current ? previewLabels(current.state) : null), [current]);

  const answer = useCallback(
    async (rating: Rating) => {
      if (!current || busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/reviews/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: current.id, rating }),
        });
        if (!res.ok) throw new Error();
        setReviewed((r) => ({ ...r, [rating]: r[rating] + 1 }));
        // Errou: o cartão volta ao fim da fila, já com o estado novo, para ser revisto hoje.
        setQueue((q) => {
          if (!q) return q;
          const [head, ...rest] = q;
          return rating === 1 ? [...rest, { ...head, state: schedule(head.state, 1) }] : rest;
        });
        setRevealed(false);
      } catch {
        setError(true);
      } finally {
        setBusy(false);
      }
    },
    [current, busy],
  );

  const suspend = useCallback(async () => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews/suspend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: current.id, suspended: true }),
      });
      if (!res.ok) throw new Error();
      setQueue((q) => q?.slice(1) ?? q);
      setRevealed(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [current, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) return;
      if (!revealed && (e.key === " " || e.key === "Enter") && current) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        void answer(Number(e.key) as Rating);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, current, answer]);

  if (error) return <p className="mt-8 text-danger">Não foi possível carregar a revisão. Recarregue a página.</p>;
  if (!queue || !counts) return <p className="mt-8 text-fg-muted">Carregando…</p>;

  const total = Object.values(reviewed).reduce((a, b) => a + b, 0);

  if (!current) {
    return (
      <section className="mt-8 rounded-lg border border-line bg-surface-1 p-6">
        <h2 className="text-xl font-semibold">{total > 0 ? "Revisão de hoje concluída" : "Nada para revisar agora"}</h2>
        {total > 0 && (
          <p className="mt-2 text-fg-muted">
            {total} {total === 1 ? "cartão revisado" : "cartões revisados"}: {reviewed[1]} errei, {reviewed[2]} difícil, {reviewed[3]} bom, {reviewed[4]} fácil.
          </p>
        )}
        <p className="mt-2 text-fg-muted">
          {counts.next7Days > 0 ? `${counts.next7Days} cartões voltam nos próximos 7 dias.` : "Ainda não há cartões agendados."}
        </p>
        {counts.total === 0 && (
          <p className="mt-2 text-fg-muted">
            Os cartões surgem sozinhos: resolva um{" "}
            <Link className="text-accent underline" href="/practice">
              problema
            </Link>{" "}
            ou destaque um trecho ao ler um capítulo, e eles aparecem aqui no dia seguinte.
          </p>
        )}
      </section>
    );
  }

  const quoteCue = current.kind === "highlight" && current.quote ? cue(current.quote) : null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between text-sm text-fg-muted">
        <span>
          {queue.length} {queue.length === 1 ? "restante" : "restantes"}
          {current.isNew && <span className="ml-2 rounded bg-surface-3 px-1.5 py-0.5 text-xs">novo</span>}
        </span>
        <span>{current.kind === "problem" ? "Problema" : "Destaque"}</span>
      </div>

      <article className="rounded-lg border border-line bg-surface-1 p-6">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">{current.chapter.moduleTitle}</p>
        <h2 className="mt-1 text-xl font-semibold">{current.chapter.title}</h2>

        {current.kind === "problem" ? (
          <>
            {current.difficulty && <p className="mt-1 text-sm text-fg-muted">Dificuldade: {current.difficulty}</p>}
            <p className="mt-4">Resolva este problema de novo, sem olhar a solução. Depois diga como foi.</p>
            <Link href={`/learn/${current.chapter.course}/${current.chapter.slug}`} target="_blank" className="mt-3 inline-block text-accent underline">
              Abrir o problema em outra aba
            </Link>
          </>
        ) : (
          <>
            <p className="mt-4 text-fg-muted">Você destacou um trecho deste capítulo. Consegue lembrar o que ele dizia?</p>
            {quoteCue && <blockquote className="mt-3 border-l-4 border-line pl-3 italic">{quoteCue}</blockquote>}
            {revealed && (
              <>
                <blockquote className="mt-4 rounded-md border-l-4 border-line p-3" style={{ background: `var(--cf-hl-${current.color})` }}>
                  {current.quote}
                </blockquote>
                {current.notes?.map((n, i) => (
                  <p key={i} className="mt-3 whitespace-pre-wrap rounded-md bg-surface-2 p-3 text-sm">
                    <span className="font-medium">Sua nota: </span>
                    {n}
                  </p>
                ))}
                <Link href={`/learn/${current.chapter.course}/${current.chapter.slug}`} target="_blank" className="mt-3 inline-block text-sm text-accent underline">
                  Abrir o capítulo
                </Link>
              </>
            )}
          </>
        )}
      </article>

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="mt-4 w-full rounded-md bg-accent px-4 py-3 font-medium text-fg-on-accent">
          {current.kind === "problem" ? "Já tentei" : "Mostrar o trecho"} <span className="opacity-70">(espaço)</span>
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={busy}
              onClick={() => void answer(r)}
              className={`rounded-md border bg-surface-1 px-3 py-3 text-center transition hover:bg-surface-2 disabled:opacity-50 ${RATING_STYLE[r]}`}
            >
              <span className="block font-medium">{RATING_LABELS[r]}</span>
              <span className="block text-xs text-fg-muted">
                {previews?.[r]} · tecla {r}
              </span>
            </button>
          ))}
        </div>
      )}

      <button type="button" onClick={() => void suspend()} disabled={busy} className="mt-4 text-sm text-fg-subtle underline hover:text-fg">
        Parar de revisar este cartão
      </button>
    </section>
  );
}
