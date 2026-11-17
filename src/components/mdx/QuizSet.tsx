"use client";

import { Children, useState } from "react";
import { useBounceOnChange } from "@/lib/motion";

/** Mostra vários <Quiz /> um por vez, com contador "1 / N" e navegação. */
export function QuizSet({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children).filter((c) => typeof c === "object");
  const [index, setIndex] = useState(0);
  // Feedback exagerado: o contador "pula" ao trocar de pergunta
  const counterRef = useBounceOnChange<HTMLSpanElement>(index);
  if (items.length === 0) return null;
  const btn = "inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-40";

  return (
    <section aria-label="Perguntas de fixação" className="rounded-xl border border-line bg-surface-2 p-3 font-ui" data-quiz-set>
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-fg-muted">
        <span className="font-semibold uppercase tracking-wide">Teste seu entendimento</span>
        <span ref={counterRef} className="inline-block tabular-nums" aria-live="polite">
          {index + 1} / {items.length}
        </span>
      </div>
      {/* key força remontar o Quiz, limpando a resposta anterior ao trocar de pergunta */}
      <div key={index} className="cf-fade-in">{items[index]}</div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-between">
          <button type="button" className={btn} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            {/* seta espelhada: a antecipação da .cf-nudge aponta para a esquerda */}
            <span aria-hidden className="cf-nudge -scale-x-100">→</span> Anterior
          </button>
          <button type="button" className={btn} disabled={index === items.length - 1} onClick={() => setIndex((i) => i + 1)}>
            Próxima <span aria-hidden className="cf-nudge">→</span>
          </button>
        </div>
      )}
    </section>
  );
}
