"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SearchDoc } from "@/app/api/search-index/route";
import { useDelayedFlag } from "@/lib/motion";

/**
 * Postel: remove acentos e caixa ("Programação" casa com "programacao") e trata hífen, sublinhado,
 * ponto e barra como espaço ("two-pointers" casa com "two pointers"). Troca 1 caractere por 1 para
 * os índices continuarem valendo no texto original (usado no trecho de contexto).
 */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[-_./]/g, " ");

interface Hit {
  doc: SearchDoc;
  score: number;
  snippet: string | null;
}

function search(docs: SearchDoc[], query: string): Hit[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const hits: Hit[] = [];
  for (const doc of docs) {
    const title = fold(doc.title);
    const text = fold(doc.text);
    let score = 0;
    let ok = true;
    for (const t of terms) {
      if (title.includes(t)) score += title.startsWith(t) ? 12 : 8;
      else if (fold(doc.module).includes(t)) score += 4;
      else if (text.includes(t)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (!doc.available) score -= 3;
    let snippet: string | null = null;
    const at = text.indexOf(terms[0]);
    if (at >= 0 && !title.includes(terms[0])) {
      const start = Math.max(0, at - 50);
      snippet = (start > 0 ? "…" : "") + doc.text.slice(start, at + 90) + "…";
    }
    hits.push({ doc, score, snippet });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 20);
}

const KIND = { lesson: "Aula", problem: "Problema", quiz: "Quiz" } as const;

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Jakob: ao fechar, o foco volta para onde estava (o botão de busca ou o que estava focado no Ctrl+K)
  const returnFocus = useRef<HTMLElement | null>(null);
  const loadingShown = useDelayedFlag(open && !docs);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
    if (!docs) fetch("/api/search-index").then((r) => r.json()).then(setDocs).catch(() => setDocs([]));
  }, [docs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQ("");
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus();
  }, []);

  // Esc fecha mesmo com o foco fora do campo (ex.: depois de clicar num resultado com o meio do mouse)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const hits = useMemo(() => (docs ? search(docs, q) : []), [docs, q]);
  useEffect(() => setActive(0), [q]);

  // O item ativo pelo teclado fica sempre visível na lista
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (h: Hit) => {
    setOpen(false);
    router.push(`/learn/${h.doc.course}/${h.doc.slug}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex min-h-9 items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm text-fg-muted hover:bg-surface-2"
      >
        <span aria-hidden>⌕</span>
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="hidden rounded-xs border border-line px-1 font-mono text-[10px] sm:inline">Ctrl K</kbd>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Buscar">
          <button
            type="button"
            aria-label="Fechar busca"
            data-no-press
            className="cf-fade-in absolute inset-0 bg-[var(--cf-surface-overlay)]"
            onClick={close}
          />
          {/* Staging: o painel "salta" no centro de atenção enquanto o fundo escurece */}
          <div className="cf-pop relative w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface-1 shadow-lg">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, hits.length - 1));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                }
                if (e.key === "Enter" && hits[active]) go(hits[active]);
              }}
              placeholder="Buscar aulas e problemas…"
              aria-label="Termo de busca"
              aria-controls="search-results"
              className="w-full border-b border-line bg-transparent px-4 py-3 outline-none"
            />
            <ul ref={listRef} id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
              {/* Doherty: esqueleto só se o índice demorar; antes disso, nada pisca */}
              {!docs &&
                (loadingShown ? (
                  <li aria-label="Carregando índice" className="space-y-3 px-4 py-3">
                    <span className="cf-skeleton block h-4 w-2/3" />
                    <span className="cf-skeleton block h-3 w-1/2" />
                    <span className="cf-skeleton block h-4 w-3/5" />
                  </li>
                ) : (
                  <li className="h-[76px]" aria-hidden />
                ))}
              {docs && q && hits.length === 0 && <li className="px-4 py-3 text-sm text-fg-muted">Nada encontrado para “{q}”.</li>}
              {docs && !q && <li className="px-4 py-3 text-sm text-fg-muted">Digite um tema, padrão ou nome de problema.</li>}
              {hits.map((h, i) => (
                <li key={`${h.doc.course}/${h.doc.slug}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h)}
                    className={`block w-full px-4 py-2.5 text-left ${i === active ? "bg-accent-soft" : ""}`}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span className={`font-medium ${h.doc.available ? "" : "text-fg-subtle"}`}>{h.doc.title}</span>
                      {!h.doc.available && <span className="text-[10px] uppercase text-fg-subtle">em breve</span>}
                    </span>
                    <span className="block text-xs text-fg-subtle">
                      {h.doc.courseTitle} · {h.doc.module} · {KIND[h.doc.kind]}
                    </span>
                    {h.snippet && <span className="mt-1 block line-clamp-2 text-xs text-fg-muted">{h.snippet}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>,
        // Portal: o cabeçalho usa backdrop-filter, que prenderia um elemento fixed dentro dele.
        document.body,
      )}
    </>
  );
}
