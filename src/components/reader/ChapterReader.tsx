"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { paintHighlight, recolorHighlight, selectionToAnchor, unpaintHighlight, type Anchor } from "./anchoring";
import { useSpeech } from "./useSpeech";
import { PROGRESS_EVENT, type ProgressEventDetail } from "@/lib/events";
import { COLORS, COLOR_LABEL, type Color } from "./colors";
import { NotesPanel, type HighlightRow, type NoteRow } from "./NotesPanel";
import { TutorPanel } from "./TutorPanel";
import { BookModeButton } from "./BookModeButton";

interface ChapterState {
  progress: { percentRead: number; lastBlockId: string | null; completed: boolean } | null;
  starred: boolean;
  highlights: HighlightRow[];
  notes: NoteRow[];
}

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export function ChapterReader({
  chapterKey,
  course,
  chapter,
  tutorEnabled,
  children,
}: {
  chapterKey: string;
  course: string;
  chapter: string;
  tutorEnabled: boolean;
  children: React.ReactNode;
}) {
  const proseRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<ChapterState | null>(null);
  const [toolbar, setToolbar] = useState<{ anchor: Anchor; x: number; y: number } | null>(null);
  const [aside, setAside] = useState<null | "notes" | "tutor">(null);
  const [focusHighlight, setFocusHighlight] = useState<string | null>(null);
  const [tutorSelection, setTutorSelection] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const speech = useSpeech(proseRef);

  // ---- carregar estado e pintar destaques ----
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/state?chapter=${chapterKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: ChapterState) => {
        if (cancelled || !proseRef.current) return;
        for (const h of s.highlights) paintHighlight(proseRef.current, h);
        setState(s);
      })
      .catch(() => !cancelled && setError("Não foi possível carregar seus destaques e progresso."));
    return () => {
      cancelled = true;
    };
  }, [chapterKey]);

  // ---- progresso de leitura (maior bloco já visto + bloco no topo) ----
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block-id]"));
    if (blocks.length === 0) return;
    let maxSeen = -1;
    let lastBlockId: string | undefined;
    let dirty = false;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = blocks.indexOf(e.target as HTMLElement);
          if (i > maxSeen) {
            maxSeen = i;
            dirty = true;
          }
          lastBlockId = (e.target as HTMLElement).dataset.blockId;
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    blocks.forEach((b) => io.observe(b));

    const flush = (beacon = false) => {
      if (!dirty) return;
      dirty = false;
      const payload = { key: chapterKey, percentRead: Math.round(((maxSeen + 1) / blocks.length) * 100), lastBlockId };
      if (beacon) navigator.sendBeacon("/api/progress", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      else send("/api/progress", "PUT", payload).catch(() => {});
    };
    const timer = setInterval(flush, 5000);
    const onHide = () => flush(true);
    window.addEventListener("pagehide", onHide);
    return () => {
      io.disconnect();
      clearInterval(timer);
      window.removeEventListener("pagehide", onHide);
      flush(true);
    };
  }, [chapterKey]);

  // ---- seleção de texto → barra de destaque ----
  useEffect(() => {
    const onUp = () => {
      setTimeout(() => {
        const root = proseRef.current;
        if (!root) return;
        const sel = selectionToAnchor(root);
        if (!sel) return setToolbar(null);
        setToolbar({ anchor: sel.anchor, x: sel.rect.left + sel.rect.width / 2, y: sel.rect.top + window.scrollY });
      }, 0);
    };
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-selection-toolbar]")) setToolbar(null);
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  // ---- clique em um destaque abre o painel de notas nele ----
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const mark = (e.target as Element).closest<HTMLElement>("mark[data-hl-id]");
      if (mark && window.getSelection()?.isCollapsed) {
        setFocusHighlight(mark.dataset.hlId!);
        setAside("notes");
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  const createHighlight = useCallback(
    async (color: Color, thenNote = false) => {
      if (!toolbar || !proseRef.current) return;
      const h: HighlightRow = { id: crypto.randomUUID(), color, ...toolbar.anchor, createdAt: new Date().toISOString() };
      paintHighlight(proseRef.current, h);
      window.getSelection()?.removeAllRanges();
      setToolbar(null);
      setState((s) => (s ? { ...s, highlights: [...s.highlights, h] } : s));
      if (thenNote) {
        setFocusHighlight(h.id);
        setAside("notes");
      }
      try {
        await send("/api/highlights", "POST", { ...h, key: chapterKey });
      } catch {
        unpaintHighlight(proseRef.current, h.id);
        setState((s) => (s ? { ...s, highlights: s.highlights.filter((x) => x.id !== h.id) } : s));
        setError("Não foi possível salvar o destaque.");
      }
    },
    [toolbar, chapterKey],
  );

  const deleteHighlight = useCallback(async (id: string) => {
    if (proseRef.current) unpaintHighlight(proseRef.current, id);
    setState((s) => (s ? { ...s, highlights: s.highlights.filter((h) => h.id !== id) } : s));
    await send(`/api/highlights?id=${id}`, "DELETE").catch(() => setError("Não foi possível remover o destaque."));
  }, []);

  const changeColor = useCallback(async (id: string, color: Color) => {
    if (proseRef.current) recolorHighlight(proseRef.current, id, color);
    setState((s) => (s ? { ...s, highlights: s.highlights.map((h) => (h.id === id ? { ...h, color } : h)) } : s));
    await send("/api/highlights", "PATCH", { id, color }).catch(() => setError("Não foi possível mudar a cor."));
  }, []);

  const saveNote = useCallback(
    async (body: string, highlightId: string | null, noteId?: string) => {
      if (noteId) {
        const row: NoteRow = await send("/api/notes", "PATCH", { id: noteId, body });
        setState((s) => (s ? { ...s, notes: s.notes.map((n) => (n.id === noteId ? row : n)) } : s));
      } else {
        const row: NoteRow = await send("/api/notes", "POST", { id: crypto.randomUUID(), key: chapterKey, highlightId, body });
        setState((s) => (s ? { ...s, notes: [...s.notes, row] } : s));
      }
    },
    [chapterKey],
  );

  const deleteNote = useCallback(async (id: string) => {
    setState((s) => (s ? { ...s, notes: s.notes.filter((n) => n.id !== id) } : s));
    await send(`/api/notes?id=${id}`, "DELETE").catch(() => setError("Não foi possível remover a nota."));
  }, []);

  const toggleComplete = useCallback(async () => {
    const completed = !state?.progress?.completed;
    setState((s) =>
      s ? { ...s, progress: { percentRead: completed ? 100 : (s.progress?.percentRead ?? 0), lastBlockId: s.progress?.lastBlockId ?? null, completed } } : s,
    );
    window.dispatchEvent(new CustomEvent<ProgressEventDetail>(PROGRESS_EVENT, { detail: { key: chapterKey, completed } }));
    await send("/api/progress", "PUT", { key: chapterKey, completed }).catch(() => setError("Não foi possível salvar o progresso."));
  }, [state, chapterKey]);

  // Problemas resolvidos marcam o capítulo como concluído (evento disparado pelo ProblemWorkspace).
  useEffect(() => {
    const onProgress = (e: Event) => {
      const d = (e as CustomEvent<ProgressEventDetail>).detail;
      if (d.key !== chapterKey) return;
      setState((s) => (s ? { ...s, progress: { percentRead: 100, lastBlockId: s.progress?.lastBlockId ?? null, completed: d.completed } } : s));
    };
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(PROGRESS_EVENT, onProgress);
  }, [chapterKey]);

  const toggleStar = useCallback(async () => {
    const starred = !state?.starred;
    setState((s) => (s ? { ...s, starred } : s));
    await send("/api/stars", starred ? "PUT" : "DELETE", { key: chapterKey }).catch(() => {});
  }, [state, chapterKey]);

  const resumeBlock = state?.progress && !state.progress.completed && state.progress.lastBlockId;
  const completed = state?.progress?.completed ?? false;

  const btn = "rounded-md border border-line px-2.5 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-45";

  return (
    <>
      {/* Barra de ações do capítulo */}
      <div className="mx-auto mt-5 flex cf-measure flex-wrap items-center gap-2">
        {speech.status === "unsupported" ? (
          <span className="text-xs text-fg-subtle">Áudio indisponível neste navegador</span>
        ) : speech.status === "playing" ? (
          <>
            <button type="button" className={btn} onClick={speech.pause}>⏸ Pausar</button>
            <button type="button" className={btn} onClick={speech.stop}>⏹ Parar</button>
          </>
        ) : (
          <>
            <button type="button" className={btn} onClick={() => speech.play()}>
              {speech.status === "paused" ? "▶ Continuar" : "▶ Ouvir"}
            </button>
            {speech.status === "paused" && <button type="button" className={btn} onClick={speech.stop}>⏹ Parar</button>}
          </>
        )}
        {speech.status !== "unsupported" && (
          <label className="flex items-center gap-1 text-xs text-fg-muted">
            Velocidade
            <select
              value={speech.rate}
              onChange={(e) => speech.setRate(Number(e.target.value))}
              className="rounded-md border border-line-input bg-surface-1 px-1 py-1"
            >
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>
          </label>
        )}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <BookModeButton className={btn} />
        <button type="button" className={btn} aria-pressed={state?.starred ?? false} onClick={toggleStar} disabled={!state}>
          {state?.starred ? "★ Favorito" : "☆ Favoritar"}
        </button>
        <button type="button" className={btn} aria-pressed={aside === "notes"} onClick={() => setAside(aside === "notes" ? null : "notes")}>
          ✎ Notas {state && state.highlights.length + state.notes.length > 0 ? `(${state.highlights.length + state.notes.length})` : ""}
        </button>
        {tutorEnabled && (
          <button type="button" className={btn} aria-pressed={aside === "tutor"} onClick={() => setAside(aside === "tutor" ? null : "tutor")}>
            ✦ Tutor IA
          </button>
        )}
        <button
          type="button"
          onClick={toggleComplete}
          disabled={!state}
          className={`ml-auto rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-45 ${
            completed ? "bg-success-soft text-success" : "bg-accent text-fg-on-accent hover:bg-accent-hover"
          }`}
        >
          {completed ? "✓ Concluído" : "Marcar como concluído"}
        </button>
      </div>

      {resumeBlock && (
        <div className="mx-auto mt-3 cf-measure">
          <button
            type="button"
            className="text-sm text-accent-text underline"
            onClick={() => proseRef.current?.querySelector(`[data-block-id="${CSS.escape(resumeBlock)}"]`)?.scrollIntoView({ block: "center" })}
          >
            Continuar de onde parei ({state!.progress!.percentRead}% lido)
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mx-auto mt-3 cf-measure rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <article
        ref={proseRef}
        className="cf-prose mx-auto mt-8"
        onDoubleClick={(e) => {
          // duplo clique com o áudio ativo: ouvir a partir deste parágrafo
          const block = (e.target as Element).closest<HTMLElement>('[data-block-kind="text"]');
          if (block && speech.status !== "idle" && speech.status !== "unsupported") speech.play(block);
        }}
      >
        {children}
      </article>

      {toolbar && (
        <div
          data-selection-toolbar
          role="toolbar"
          aria-label="Destacar seleção"
          className="absolute z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-lg border border-line bg-surface-1 p-1.5 shadow-lg"
          style={{ left: toolbar.x, top: toolbar.y - 8 }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Destacar em ${COLOR_LABEL[c]}`}
              title={COLOR_LABEL[c]}
              onClick={() => createHighlight(c)}
              className="size-6 rounded-full border border-line-input hover:scale-110"
              style={{ background: `var(--cf-hl-${c})` }}
            />
          ))}
          <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
          <button type="button" className="rounded-md px-2 py-1 text-xs hover:bg-surface-2" onClick={() => createHighlight("yellow", true)}>
            + Nota
          </button>
          {tutorEnabled && (
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs hover:bg-surface-2"
              onClick={() => {
                setTutorSelection(toolbar.anchor.quote);
                setAside("tutor");
                setToolbar(null);
              }}
            >
              ✦ Perguntar
            </button>
          )}
        </div>
      )}

      {aside && (
        <aside
          aria-label={aside === "notes" ? "Notas e destaques" : "Tutor de IA"}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-surface-1 shadow-lg sm:top-header sm:w-[var(--cf-layout-aside-w)]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold">{aside === "notes" ? "Notas e destaques" : "Tutor de IA"}</h2>
            <button type="button" aria-label="Fechar painel" className="rounded-md px-2 py-1 hover:bg-surface-2" onClick={() => setAside(null)}>
              ✕
            </button>
          </div>
          {aside === "notes" && state && (
            <NotesPanel
              highlights={state.highlights}
              notes={state.notes}
              focusHighlightId={focusHighlight}
              onJump={(h) =>
                proseRef.current
                  ?.querySelector(`mark[data-hl-id="${CSS.escape(h.id)}"]`)
                  ?.scrollIntoView({ block: "center", behavior: "smooth" })
              }
              onDeleteHighlight={deleteHighlight}
              onChangeColor={changeColor}
              onSaveNote={saveNote}
              onDeleteNote={deleteNote}
            />
          )}
          {aside === "tutor" && (
            <TutorPanel course={course} chapter={chapter} selection={tutorSelection} onSelectionUsed={() => setTutorSelection(undefined)} />
          )}
        </aside>
      )}
    </>
  );
}
