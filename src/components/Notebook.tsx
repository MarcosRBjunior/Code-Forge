"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDelayedFlag } from "@/lib/motion";

/** Postel: a busca ignora acentos e maiúsculas ("funcao" encontra "Função"). */
const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface Hl {
  id: string;
  chapterKey: string;
  color: string;
  quote: string;
}
interface Note {
  id: string;
  chapterKey: string;
  highlightId: string | null;
  body: string;
}

export function Notebook({
  course,
  courseTitle,
  chapters,
}: {
  course: string;
  courseTitle: string;
  chapters: Array<{ slug: string; title: string; module: string }>;
}) {
  const [data, setData] = useState<{ highlights: Hl[]; notes: Note[] } | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`/api/notebook?course=${course}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, [course]);

  const groups = useMemo(() => {
    if (!data) return [];
    const needle = fold(q.trim());
    const match = (s: string) => !needle || fold(s).includes(needle);
    return chapters
      .map((ch) => {
        const key = `${course}/${ch.slug}`;
        const hls = data.highlights.filter((h) => h.chapterKey === key);
        const notes = data.notes.filter((n) => n.chapterKey === key);
        const items = [
          ...hls.map((h) => ({ h, notes: notes.filter((n) => n.highlightId === h.id) })),
        ].filter(({ h, notes: ns }) => match(h.quote) || ns.some((n) => match(n.body)));
        const free = notes.filter((n) => (!n.highlightId || !hls.some((h) => h.id === n.highlightId)) && match(n.body));
        return { ch, items, free };
      })
      .filter((g) => g.items.length + g.free.length > 0);
  }, [data, chapters, course, q]);

  function exportMarkdown() {
    const lines = [`# Caderno — ${courseTitle}`, ""];
    for (const g of groups) {
      lines.push(`## ${g.ch.title}`, `_${g.ch.module}_`, "");
      for (const n of g.free) lines.push(n.body, "");
      for (const { h, notes } of g.items) {
        lines.push(`> ${h.quote.replace(/\n/g, "\n> ")}`, "");
        for (const n of notes) lines.push(`- ${n.body.replace(/\n/g, "\n  ")}`);
        if (notes.length) lines.push("");
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `caderno-${course}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (error) return <p role="alert" className="cf-rise-in mt-8 text-danger">Não foi possível carregar o caderno.</p>;
  if (!data) return <NotebookSkeleton />;

  return (
    <>
      <div className="mt-6 flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nos destaques e notas…"
          aria-label="Buscar no caderno"
          className="min-w-0 flex-1 rounded-md border border-line-input bg-surface-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={exportMarkdown}
          disabled={groups.length === 0}
          className="min-h-10 rounded-md border border-line px-3.5 py-2 text-sm hover:bg-surface-2 disabled:opacity-45"
        >
          Exportar .md
        </button>
      </div>

      {groups.length === 0 && (
        <p className="cf-fade-in mt-10 text-fg-muted">
          {q ? "Nada encontrado." : "Ainda não há destaques. Selecione um trecho em qualquer capítulo para começar."}
        </p>
      )}

      {/* Follow through: os capítulos chegam em cascata */}
      <div className="cf-stagger mt-8 space-y-10">
        {groups.map(({ ch, items, free }) => (
          <section key={ch.slug}>
            <p className="text-xs uppercase tracking-wide text-fg-subtle">{ch.module}</p>
            <h2 className="text-lg font-semibold">
              <Link href={`/learn/${course}/${ch.slug}`} className="hover:text-accent-text">
                {ch.title}
              </Link>
            </h2>
            <ul className="mt-3 space-y-3">
              {free.map((n) => (
                <li key={n.id} className="whitespace-pre-wrap rounded-md border border-line bg-surface-1 p-3 text-sm">
                  {n.body}
                </li>
              ))}
              {items.map(({ h, notes }) => (
                <li key={h.id} className="rounded-md border border-line bg-surface-1 p-3">
                  <mark data-hl={h.color} className="font-prose leading-relaxed">{h.quote}</mark>
                  {notes.map((n) => (
                    <p key={n.id} className="mt-2 whitespace-pre-wrap border-l-2 border-line pl-2 text-sm text-fg-muted">
                      {n.body}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

/** Doherty: o esqueleto só aparece se a carga passar de 150ms, sem "piscar" nas respostas rápidas. */
function NotebookSkeleton() {
  const show = useDelayedFlag(true);
  if (!show) return <p className="sr-only">Carregando…</p>;
  return (
    <div className="mt-6 space-y-4" aria-busy="true" aria-label="Carregando o caderno">
      <div className="cf-skeleton h-10 w-full" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 pt-4">
          <div className="cf-skeleton h-3 w-24" />
          <div className="cf-skeleton h-5 w-2/3" />
          <div className="cf-skeleton h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
