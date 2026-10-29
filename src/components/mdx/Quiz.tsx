"use client";

import { useId, useState } from "react";

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
  const answered = chosen !== null;
  const correct = chosen === answer;

  return (
    <fieldset className="rounded-lg border border-line bg-surface-1 p-4 font-ui text-[0.95em]" data-quiz>
      <legend className="sr-only">Pergunta</legend>
      <p id={id} className="font-medium text-fg">{question}</p>
      <div className="mt-3 grid gap-2" role="radiogroup" aria-labelledby={id}>
        {options.map((opt, i) => {
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
              <span aria-hidden className="mr-2 font-mono text-xs text-fg-subtle">{String.fromCharCode(65 + i)}</span>
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
