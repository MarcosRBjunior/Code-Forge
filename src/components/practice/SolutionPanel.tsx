"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isLang, LANG_LABEL, LANGS, type Lang } from "@/lib/langs";

/** Solução de referência de um problema, escondida até você pedir, com uma aba por linguagem. */
export function SolutionPanel({
  idea,
  complexity,
  codes,
}: {
  idea: ReactNode;
  complexity: ReactNode;
  codes: Partial<Record<Lang, ReactNode>>;
}) {
  const available = LANGS.filter((l) => codes[l] !== undefined);
  const [lang, setLang] = useState<Lang>(available[0]);

  // Começa na linguagem que você usa no editor, se a solução existir nela.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cf-lang");
      if (isLang(saved) && codes[saved] !== undefined) setLang(saved);
    } catch {
      /* sem acesso ao armazenamento: fica na primeira aba */
    }
  }, [codes]);

  return (
    <details className="group rounded-xl border border-line bg-surface-1">
      <summary className="cursor-pointer select-none px-4 py-3 font-medium">Ver solução de referência</summary>
      <div className="border-t border-line px-4 pb-4 pt-3">
        <p className="rounded-md bg-warning-soft px-3 py-2 text-sm">Tente resolver sozinho antes de olhar. Ler a solução cedo demais tira o ganho do exercício.</p>
        <div className="cf-prose mt-4">
          <h3 className="text-lg font-semibold">Ideia</h3>
          {idea}
          <h3 className="mt-4 text-lg font-semibold">Complexidade</h3>
          {complexity}
        </div>
        <div role="tablist" aria-label="Linguagem da solução" className="mt-4 flex flex-wrap gap-1.5">
          {available.map((l) => (
            <button
              key={l}
              role="tab"
              type="button"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className="rounded-md px-2.5 py-1 text-sm text-fg-muted hover:bg-surface-2 aria-selected:bg-accent-soft aria-selected:font-medium aria-selected:text-fg"
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <div className="cf-prose mt-2 overflow-x-auto">{codes[lang]}</div>
      </div>
    </details>
  );
}
