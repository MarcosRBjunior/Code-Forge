"use client";

import { Children, useState } from "react";

/** Mostra vários <Quiz /> um por vez, com contador "1 / N" e navegação. */
export function QuizSet({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children).filter((c) => typeof c === "object");
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const btn = "rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-40";

  return (
    <section aria-label="Perguntas de fixação" className="rounded-xl border border-line bg-surface-2 p-3 font-ui" data-quiz-set>
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-fg-muted">
        <span className="font-semibold uppercase tracking-wide">Teste seu entendimento</span>
        <span className="tabular-nums" aria-live="polite">
          {index + 1} / {items.length}
        </span>
      </div>
      {/* key força remontar o Quiz, limpando a resposta anterior ao trocar de pergunta */}
      <div key={index}>{items[index]}</div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-between">
          <button type="button" className={btn} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            ← Anterior
          </button>
          <button type="button" className={btn} disabled={index === items.length - 1} onClick={() => setIndex((i) => i + 1)}>
            Próxima →
          </button>
        </div>
      )}
    </section>
  );
}
