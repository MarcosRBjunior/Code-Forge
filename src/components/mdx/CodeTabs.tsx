"use client";

import { Children, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { isLang, LANG_LABEL, type Lang } from "@/lib/langs";

/** Evento disparado quando a linguagem preferida muda, para todas as abas da página acompanharem. */
const LANG_EVENT = "cf:lang";

function savedLang(): string | null {
  try {
    return localStorage.getItem("cf-lang");
  } catch {
    return null;
  }
}

/**
 * O mesmo código em várias linguagens, com uma aba por linguagem: `<CodeTabs>` envolvendo blocos de código.
 * A escolha é a mesma do editor de prática (cf-lang) e vale para todas as abas da página.
 */
export function CodeTabs({ langs = "", children }: { langs?: string; children: ReactNode }) {
  const list = langs.split(",").filter(Boolean);
  const blocks = Children.toArray(children);
  const [active, setActive] = useState(0);
  // Só anima a troca feita pelo usuário; a aba inicial aparece sem movimento (leitura calma)
  const [switched, setSwitched] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useEffect(() => {
    const sync = () => {
      const i = list.indexOf(savedLang() ?? "");
      if (i >= 0) setActive(i);
    };
    sync();
    window.addEventListener(LANG_EVENT, sync);
    return () => window.removeEventListener(LANG_EVENT, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langs]);

  const choose = (i: number) => {
    setActive(i);
    setSwitched(true);
    try {
      localStorage.setItem("cf-lang", list[i]);
    } catch {
      /* sem armazenamento: vale só nesta página */
    }
    window.dispatchEvent(new Event(LANG_EVENT));
  };

  const label = (l: string) => (isLang(l) ? LANG_LABEL[l as Lang] : l);

  // Jakob: abas seguem o padrão WAI-ARIA (← → Home End movem entre abas)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = list.length;
    const to =
      e.key === "ArrowRight" ? (active + 1) % n : e.key === "ArrowLeft" ? (active - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0 || n === 0) return;
    e.preventDefault();
    choose(to);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[to]?.focus();
  };

  return (
    <div className="cf-code-tabs not-prose my-6">
      <div ref={tabsRef} role="tablist" aria-label="Linguagem do exemplo" onKeyDown={onKeyDown} className="flex flex-wrap gap-1 border-b border-line">
        {list.map((l, i) => (
          <button
            key={l}
            id={`${baseId}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => choose(i)}
            className="-mb-px min-h-8 rounded-t-md border-b-2 border-transparent px-3 py-1.5 text-xs text-fg-muted hover:text-fg aria-selected:border-accent aria-selected:font-medium aria-selected:text-fg"
          >
            {label(l)}
          </button>
        ))}
      </div>
      {blocks.map((b, i) => (
        <div
          key={i}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className={switched && i === active ? "cf-fade-in" : undefined}
        >
          {b}
        </div>
      ))}
    </div>
  );
}
