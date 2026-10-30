"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MenuSection {
  title?: string;
  items: Array<{ href: string; label: string; hint?: string; badge?: ReactNode }>;
}

const trigger = "flex items-center gap-1 rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg aria-expanded:bg-surface-2 aria-expanded:text-fg";

/** Menu suspenso da barra superior; fecha ao clicar fora, com Esc ou ao navegar. */
export function NavMenu({ label, sections, columns = 1, badge }: { label: string; sections: MenuSection[]; columns?: number; badge?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className={trigger}>
        {label}
        {badge}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-lg border border-line bg-surface-1 p-3 shadow-lg"
          style={{ width: columns > 1 ? `min(${columns * 15}rem, calc(100vw - 2rem))` : "16rem" }}
        >
          <div className={columns > 1 ? "grid gap-x-4 gap-y-3 sm:grid-cols-2" : "grid gap-3"}>
            {sections.map((s, i) => (
              <div key={s.title ?? i}>
                {s.title && <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{s.title}</p>}
                <ul>
                  {s.items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-fg hover:bg-surface-2">
                        <span>
                          {it.label}
                          {it.badge}
                        </span>
                        {it.hint && <span className="shrink-0 text-xs text-fg-subtle">{it.hint}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Quantidade de cartões de revisão de hoje (carregada no cliente para as páginas continuarem estáticas). */
export function ReviewCount({ className = "" }: { className?: string }) {
  const [due, setDue] = useState(0);
  useEffect(() => {
    fetch("/api/reviews?summary=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDue(d.counts.due))
      .catch(() => {});
  }, []);
  if (!due) return null;
  return (
    <span className={`ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg-on-accent ${className}`} aria-label={`${due} para revisar`}>
      {due}
    </span>
  );
}
