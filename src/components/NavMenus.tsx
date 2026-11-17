"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { useBounceOnChange } from "@/lib/motion";

export interface MenuSection {
  title?: string;
  items: Array<{ href: string; label: string; hint?: string; badge?: ReactNode }>;
}

// Fitts: alvo de 36px de altura na barra superior
const trigger =
  "group flex min-h-9 items-center gap-1 rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg aria-expanded:bg-surface-2 aria-expanded:text-fg";

/**
 * Jakob: navegação de menu como no sistema operacional. Setas, Home e End movem o foco entre os
 * `[role=menuitem]` de `container`, dando a volta nas pontas.
 */
export function moveMenuFocus(container: HTMLElement | null, e: ReactKeyboardEvent) {
  if (!container || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  if (!items.length) return;
  e.preventDefault();
  const at = items.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? items.length - 1
        : e.key === "ArrowDown"
          ? (at + 1) % items.length
          : (at - 1 + items.length) % items.length;
  items[next].focus();
}

/** Menu suspenso da barra superior; fecha ao clicar fora, com Esc, com Tab para fora ou ao navegar. */
export function NavMenu({ label, sections, columns = 1, badge }: { label: string; sections: MenuSection[]; columns?: number; badge?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Aberto pelo teclado: o foco vai para o primeiro item assim que o painel monta
  const focusFirst = useRef(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open && focusFirst.current) panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    focusFirst.current = false;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // O foco volta para o botão que abriu o menu
      if (ref.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onBlur={(e) => {
        if (open && e.relatedTarget && !ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          // detail === 0: ativado por Enter/Espaço, não pelo mouse
          if (!open && e.detail === 0) focusFirst.current = true;
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            focusFirst.current = true;
            setOpen(true);
          }
        }}
        className={trigger}
      >
        {label}
        {badge}
        {/* Pose to pose: a seta gira entre fechado e aberto */}
        <span aria-hidden className="text-[10px] transition-transform duration-fast group-aria-expanded:rotate-180">
          ▾
        </span>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          onKeyDown={(e) => moveMenuFocus(panelRef.current, e)}
          className="cf-pop absolute left-0 top-full z-50 mt-1 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-lg border border-line bg-surface-1 p-3 shadow-lg"
          style={{ width: columns > 1 ? `min(${columns * 15}rem, calc(100vw - 2rem))` : "16rem", ["--cf-origin" as string]: "top left" }}
        >
          {/* Hick/Miller: itens agrupados por seção com título, nunca uma lista corrida */}
          <div className={columns > 1 ? "grid gap-x-4 gap-y-3 sm:grid-cols-2" : "grid gap-3"}>
            {sections.map((s, i) => (
              <div key={s.title ?? i} role="group" aria-label={s.title}>
                {s.title && (
                  <p aria-hidden className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                    {s.title}
                  </p>
                )}
                <ul role="none">
                  {s.items.map((it) => (
                    <li key={it.href} role="none">
                      <Link
                        href={it.href}
                        role="menuitem"
                        className="flex min-h-9 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-fg hover:bg-surface-2 focus-visible:bg-surface-2"
                      >
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

/** Páginas abertas sem login: não há sessão para consultar (evita um 401 em cada visita). */
const PUBLIC_PAGES = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"];

/** Quantidade de cartões de revisão de hoje (carregada no cliente para as páginas continuarem estáticas). */
export function ReviewCount({ className = "" }: { className?: string }) {
  const [due, setDue] = useState(0);
  const pathname = usePathname();
  const isPublic = PUBLIC_PAGES.includes(pathname);
  // Exagero: o selo dá um "pulo" quando a contagem muda (ex.: ao voltar de uma sessão de revisão)
  const ref = useBounceOnChange<HTMLSpanElement>(due);
  // Recarrega a cada navegação para o número não ficar velho depois de revisar
  useEffect(() => {
    if (isPublic) return;
    fetch("/api/reviews?summary=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDue(d.counts.due))
      .catch(() => {});
  }, [isPublic, pathname]);
  if (!due) return null;
  return (
    <span
      ref={ref}
      className={`ml-1.5 inline-block rounded-full bg-accent px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg-on-accent ${className}`}
      aria-label={`${due} para revisar`}
    >
      {due}
    </span>
  );
}
