"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS, COLOR_LABEL, type Color } from "./colors";

export interface HighlightRow {
  id: string;
  color: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
  createdAt: string;
}

export interface NoteRow {
  id: string;
  highlightId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

function NoteEditor({
  initial = "",
  placeholder,
  autoFocus,
  onSave,
  onCancel,
}: {
  initial?: string;
  placeholder: string;
  autoFocus?: boolean;
  onSave(body: string): Promise<void>;
  onCancel?(): void;
}) {
  const [body, setBody] = useState(initial);
  // Doherty / UI otimista: a nota aparece na lista na hora; se o servidor recusar, o texto volta para o campo
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const text = body.trim();
        if (!text) return;
        setBody("");
        onSave(text).catch(() => setBody((cur) => cur || text));
      }}
      onKeyDown={(e) => {
        // Jakob: Ctrl/Cmd+Enter salva, Esc cancela a edição
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        } else if (e.key === "Escape" && onCancel) {
          e.stopPropagation();
          onCancel();
        }
      }}
      className="mt-2"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        aria-label={placeholder}
        className="w-full resize-y rounded-md border border-line-input bg-surface-1 px-2.5 py-2 text-sm"
      />
      <div className="mt-1.5 flex gap-2">
        <button type="submit" disabled={!body.trim()} title="Salvar (Ctrl+Enter)" className="min-h-8 rounded-md bg-accent px-3 py-1 text-xs font-medium text-fg-on-accent disabled:opacity-45">
          Salvar
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} title="Cancelar (Esc)" className="min-h-8 rounded-md px-3 py-1 text-xs hover:bg-surface-2">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export function NotesPanel({
  highlights,
  notes,
  focusHighlightId,
  onJump,
  onDeleteHighlight,
  onChangeColor,
  onSaveNote,
  onDeleteNote,
}: {
  highlights: HighlightRow[];
  notes: NoteRow[];
  focusHighlightId: string | null;
  onJump(h: HighlightRow): void;
  onDeleteHighlight(id: string): void;
  onChangeColor(id: string, color: Color): void;
  onSaveNote(body: string, highlightId: string | null, noteId?: string): Promise<void>;
  onDeleteNote(id: string): void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  // Edição que o servidor recusou: o editor reabre com o texto novo, para nada se perder
  const [failedEdit, setFailedEdit] = useState<{ id: string; body: string } | null>(null);
  const editNote = (body: string, highlightId: string | null, id: string) => {
    setEditing(null);
    setFailedEdit(null);
    return onSaveNote(body, highlightId, id).catch((e) => {
      setFailedEdit({ id, body });
      setEditing(id);
      throw e;
    });
  };
  const editInitial = (n: NoteRow) => (failedEdit?.id === n.id ? failedEdit.body : n.body);
  const focusRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: "nearest" });
  }, [focusHighlightId]);

  const free = notes.filter((n) => !n.highlightId || !highlights.some((h) => h.id === n.highlightId));

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Nota do capítulo</h3>
        <NoteEditor placeholder="Escreva uma nota…" onSave={(b) => onSaveNote(b, null)} />
        <ul className="cf-stagger mt-3 space-y-3">
          {free.map((n) => (
            <li key={n.id} className="rounded-md border border-line p-3">
              {editing === n.id ? (
                <NoteEditor initial={editInitial(n)} placeholder="Editar nota" autoFocus onSave={(b) => editNote(b, null, n.id)} onCancel={() => { setEditing(null); setFailedEdit(null); }} />
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <div className="mt-2 flex gap-3 text-xs text-fg-subtle">
                    <button type="button" className="cf-hit rounded-xs hover:text-fg" onClick={() => setEditing(n.id)}>Editar</button>
                    <button type="button" className="cf-hit rounded-xs hover:text-danger" onClick={() => onDeleteNote(n.id)}>Excluir</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Destaques ({highlights.length})</h3>
        {highlights.length === 0 && <p className="mt-2 text-fg-muted">Selecione um trecho do texto para destacar.</p>}
        <ul className="cf-stagger mt-3 space-y-3">
          {highlights.map((h) => {
            const hNotes = notes.filter((n) => n.highlightId === h.id);
            const focused = h.id === focusHighlightId;
            return (
              <li
                key={h.id}
                ref={focused ? focusRef : undefined}
                // Staging: o destaque clicado no texto acende uma vez no painel
                className={`rounded-md border p-3 transition-colors duration-base ${focused ? "cf-spotlight border-accent" : "border-line"}`}
              >
                <button type="button" onClick={() => onJump(h)} className="block w-full text-left">
                  <mark data-hl={h.color} className="font-prose text-[0.95em] leading-relaxed">{h.quote}</mark>
                </button>
                <div className="mt-2 flex items-center gap-2.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Mudar para ${COLOR_LABEL[c]}`}
                      aria-pressed={h.color === c}
                      onClick={() => onChangeColor(h.id, c)}
                      className="cf-hit size-5 rounded-full border border-line-input hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-[var(--cf-focus-ring)]"
                      style={{ background: `var(--cf-hl-${c})` }}
                    />
                  ))}
                  <button type="button" className="cf-hit ml-auto rounded-xs text-xs text-fg-subtle hover:text-danger" onClick={() => onDeleteHighlight(h.id)}>
                    Remover
                  </button>
                </div>
                {hNotes.map((n) => (
                  <div key={n.id} className="mt-2 border-l-2 border-line pl-2">
                    {editing === n.id ? (
                      <NoteEditor initial={editInitial(n)} placeholder="Editar nota" autoFocus onSave={(b) => editNote(b, h.id, n.id)} onCancel={() => { setEditing(null); setFailedEdit(null); }} />
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{n.body}</p>
                        <div className="mt-1 flex gap-3 text-xs text-fg-subtle">
                          <button type="button" className="cf-hit rounded-xs hover:text-fg" onClick={() => setEditing(n.id)}>Editar</button>
                          <button type="button" className="cf-hit rounded-xs hover:text-danger" onClick={() => onDeleteNote(n.id)}>Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(focused || hNotes.length === 0) && (
                  <NoteEditor placeholder="Anotar sobre este trecho…" autoFocus={focused} onSave={(b) => onSaveNote(b, h.id)} />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
