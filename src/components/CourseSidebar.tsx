"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PROGRESS_EVENT, type ProgressEventDetail } from "@/lib/events";

type Kind = "lesson" | "problem" | "quiz";

export interface SidebarModule {
  slug: string;
  title: string;
  chapters: Array<{ slug: string; title: string; kind: Kind; available: boolean }>;
}

const KIND_ICON: Record<Kind, string> = { lesson: "📖", problem: "</>", quiz: "?" };
const KIND_LABEL: Record<Kind, string> = { lesson: "Aula", problem: "Problema", quiz: "Quiz" };

export function CourseSidebar({ course, modules }: { course: { slug: string; title: string }; modules: SidebarModule[] }) {
  const pathname = usePathname();
  const current = pathname.split("/")[3];
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState<Set<string>>(new Set());
  const [railOnly, setRailOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/state?course=${course.slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { progress: Record<string, { completed: boolean; percentRead: number }> } | null) => {
        if (!s) return;
        setCompleted(new Set(Object.entries(s.progress).filter(([, p]) => p.completed).map(([k]) => k.split("/")[1])));
        setStarted(new Set(Object.entries(s.progress).filter(([, p]) => !p.completed && p.percentRead > 0).map(([k]) => k.split("/")[1])));
      })
      .catch(() => {});
  }, [course.slug]);

  useEffect(load, [load]);

  useEffect(() => {
    const onProgress = (e: Event) => {
      const { key, completed: done } = (e as CustomEvent<ProgressEventDetail>).detail;
      const [c, ch] = key.split("/");
      if (c !== course.slug) return;
      setCompleted((prev) => {
        const next = new Set(prev);
        if (done) next.add(ch);
        else next.delete(ch);
        return next;
      });
    };
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(PROGRESS_EVENT, onProgress);
  }, [course.slug]);

  useEffect(() => setMobileOpen(false), [pathname]);

  // Barra recolhida no desktop (fica só um trilho); a preferência vale para todos os cursos.
  useEffect(() => setRailOnly(document.documentElement.dataset.sidebar === "collapsed"), []);
  const toggleRail = () => {
    const next = !railOnly;
    setRailOnly(next);
    if (next) document.documentElement.dataset.sidebar = "collapsed";
    else delete document.documentElement.dataset.sidebar;
    try {
      localStorage.setItem("cf-sidebar", next ? "collapsed" : "open");
    } catch {
      /* sem armazenamento: vale só nesta página */
    }
  };

  const total = modules.reduce((n, m) => n + m.chapters.filter((c) => c.available).length, 0);

  const nav = (
    <nav aria-label={`Capítulos de ${course.title}`} className="flex h-full flex-col">
      <div className="flex items-start gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link href={`/learn/${course.slug}`} className="text-sm font-semibold hover:text-accent-text">
            {course.title}
          </Link>
          <p className="mt-0.5 text-xs tabular-nums text-fg-subtle">
            {completed.size} de {total} concluídos
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            <div className="h-full rounded-full bg-success" style={{ width: `${total ? (completed.size / total) * 100 : 0}%` }} />
          </div>
        </div>
        <button type="button" onClick={toggleRail} aria-label="Recolher a barra de capítulos" title="Recolher" className="hidden rounded-md px-1.5 py-0.5 text-fg-subtle hover:bg-surface-2 hover:text-fg lg:block">
          «
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
        {modules.map((m) => {
          const done = m.chapters.filter((c) => completed.has(c.slug)).length;
          const isCollapsed = collapsed.has(m.slug);
          return (
            <section key={m.slug} className="mb-2">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(m.slug)) next.delete(m.slug);
                    else next.add(m.slug);
                    return next;
                  })
                }
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted hover:bg-surface-2"
              >
                <span>{m.title}</span>
                <span className="tabular-nums font-normal normal-case text-fg-subtle">
                  {done}/{m.chapters.filter((c) => c.available).length} {isCollapsed ? "▸" : "▾"}
                </span>
              </button>
              {!isCollapsed && (
                <ul className="mt-0.5">
                  {m.chapters.map((c) => {
                    const isDone = completed.has(c.slug);
                    const isStarted = !isDone && started.has(c.slug);
                    return (
                      <li key={c.slug}>
                        <Link
                          href={`/learn/${course.slug}/${c.slug}`}
                          aria-current={c.slug === current ? "page" : undefined}
                          data-state={isDone ? "completed" : isStarted ? "in-progress" : undefined}
                          className="relative flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg current:bg-accent-soft current:font-medium current:text-fg current:before:absolute current:before:inset-y-1.5 current:before:left-0 current:before:w-0.5 current:before:rounded-full current:before:bg-accent"
                        >
                          <span
                            aria-hidden
                            className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${
                              isDone
                                ? "bg-success text-fg-on-accent"
                                : isStarted
                                  ? "border border-warning bg-warning-soft text-warning"
                                  : "border border-line-input text-fg-subtle"
                            }`}
                          >
                            {isDone ? "✓" : isStarted ? "◐" : KIND_ICON[c.kind]}
                          </span>
                          <span className={`min-w-0 flex-1 truncate ${c.available ? "" : "text-fg-subtle"}`}>{c.title}</span>
                          {!c.available && <span className="shrink-0 text-[10px] uppercase tracking-wide text-fg-subtle">em breve</span>}
                          <span className="sr-only">
                            {KIND_LABEL[c.kind]}
                            {isDone ? ", concluído" : isStarted ? ", em andamento" : ""}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="m-3 rounded-md border border-line px-3 py-1.5 text-sm lg:hidden"
      >
        ☰ Capítulos
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Capítulos">
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-[var(--cf-surface-overlay)]" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(85vw,320px)] bg-surface-1 shadow-lg">{nav}</div>
        </div>
      )}
      <aside className="cf-course-sidebar sticky top-header hidden h-[calc(100dvh-var(--cf-layout-header-h))] border-r border-line bg-surface-1 lg:block">
        {railOnly ? (
          <div className="flex flex-col items-center gap-3 py-3">
            <button type="button" onClick={toggleRail} aria-label="Mostrar a barra de capítulos" title="Mostrar capítulos" className="rounded-md px-1.5 py-0.5 text-fg-subtle hover:bg-surface-2 hover:text-fg">
              »
            </button>
            <span className="text-xs tabular-nums text-fg-subtle [writing-mode:vertical-rl]">
              {completed.size}/{total}
            </span>
          </div>
        ) : (
          nav
        )}
      </aside>
    </>
  );
}
