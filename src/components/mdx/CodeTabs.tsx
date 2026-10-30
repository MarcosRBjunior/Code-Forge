"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
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
    try {
      localStorage.setItem("cf-lang", list[i]);
    } catch {
      /* sem armazenamento: vale só nesta página */
    }
    window.dispatchEvent(new Event(LANG_EVENT));
  };

  const label = (l: string) => (isLang(l) ? LANG_LABEL[l as Lang] : l);

  return (
    <div className="cf-code-tabs not-prose my-6">
      <div role="tablist" aria-label="Linguagem do exemplo" className="flex flex-wrap gap-1 border-b border-line">
        {list.map((l, i) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => choose(i)}
            className="-mb-px rounded-t-md border-b-2 border-transparent px-2.5 py-1 text-xs text-fg-muted hover:text-fg aria-selected:border-accent aria-selected:font-medium aria-selected:text-fg"
          >
            {label(l)}
          </button>
        ))}
      </div>
      {blocks.map((b, i) => (
        <div key={i} role="tabpanel" hidden={i !== active}>
          {b}
        </div>
      ))}
    </div>
  );
}
