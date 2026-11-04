"use client";

import { useId, useMemo, useState } from "react";

/** Opções que só fazem sentido no fim ("Nenhuma das anteriores", "Todas as anteriores"). */
const PINNED_LAST = /^(nenhuma|todas)\s+(d?as?\s+)?(anteriores|acima|alternativas|op[cç][õo]es)/i;

/**
 * Ordem de exibição: embaralhada, mas determinística (semente = texto da pergunta), para o HTML do servidor
 * e o do navegador coincidirem. Nos .mdx a resposta certa quase sempre ficava na posição B; embaralhar impede
 * acertar pela posição. Devolve os índices originais na ordem em que as opções aparecem.
 */
function displayOrder(question: string, options: string[]): number[] {
  let h = 2166136261;
  for (let i = 0; i < question.length; i++) h = Math.imul(h ^ question.charCodeAt(i), 16777619);
  let a = h >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = options.map((_, i) => i);
  const pinned = idx.filter((i) => PINNED_LAST.test(options[i].trim()));
  const free = idx.filter((i) => !pinned.includes(i));
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return [...free, ...pinned];
}

export function Quiz({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const id = useId();
  const order = useMemo(() => displayOrder(question, options), [question, options]);
  const answered = chosen !== null;
  const correct = chosen === answer;

  return (
    <fieldset className="rounded-lg border border-line bg-surface-1 p-4 font-ui text-[0.95em]" data-quiz>
      <legend className="sr-only">Pergunta</legend>
      <p id={id} className="font-medium text-fg">{question}</p>
      <div className="mt-3 grid gap-2" role="radiogroup" aria-labelledby={id}>
        {order.map((orig, pos) => {
          const opt = options[orig];
          const i = orig;
          const state = !answered ? "idle" : i === answer ? "right" : i === chosen ? "wrong" : "dim";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={chosen === i}
              disabled={answered}
              onClick={() => setChosen(i)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors duration-fast ${
                state === "right"
                  ? "border-success bg-success-soft text-fg"
                  : state === "wrong"
                    ? "border-danger bg-danger-soft text-fg"
                    : state === "dim"
                      ? "border-line text-fg-subtle"
                      : "border-line-input hover:bg-surface-2"
              }`}
            >
              <span aria-hidden className="mr-2 font-mono text-xs text-fg-subtle">{String.fromCharCode(65 + pos)}</span>
              {opt}
              {state === "right" && <span className="sr-only"> (resposta correta)</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div role="status" className="mt-3 text-sm">
          <p className={`font-semibold ${correct ? "text-success" : "text-danger"}`}>{correct ? "✓ Correto!" : "✗ Não foi dessa vez."}</p>
          {explanation && <p className="mt-1 text-fg-muted">{explanation}</p>}
          <button type="button" onClick={() => setChosen(null)} className="mt-2 text-xs text-accent-text underline">
            Tentar de novo
          </button>
        </div>
      )}
    </fieldset>
  );
}
