"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** "Nesta página" com seção ativa e barra de progresso de leitura. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector("article.cf-prose");
      if (!article) return;
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.max(0, Math.min(100, Math.round((-r.top / Math.max(total, 1)) * 100))));
      let current: string | null = null;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < 140) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-fg-subtle">
          <span className="font-semibold uppercase tracking-wide">Progresso de leitura</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-accent transition-[width] duration-fast" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {items.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Nesta página</p>
          <ul className="mt-3 space-y-1.5 border-l border-line text-sm">
            {items.map((t) => (
              <li key={t.id} className={t.depth === 3 ? "pl-6" : "pl-3"}>
                <a
                  href={`#${t.id}`}
                  aria-current={active === t.id ? "location" : undefined}
                  className={`block ${active === t.id ? "font-medium text-accent-text" : "text-fg-muted hover:text-fg"}`}
                >
                  {t.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
