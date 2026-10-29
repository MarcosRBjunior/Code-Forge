"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function TutorPanel({
  course,
  chapter,
  selection,
  onSelectionUsed,
}: {
  course: string;
  chapter: string;
  selection?: string;
  onSelectionUsed(): void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pendingSelection, setPendingSelection] = useState<string | undefined>(selection);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selection) {
      setPendingSelection(selection);
      onSelectionUsed();
    }
  }, [selection, onSelectionUsed]);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [messages]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim() || (pendingSelection ? "Explique este trecho." : "");
    if (!message || streaming) return;
    const history = messages.slice(-20);
    setMessages([...messages, { role: "user", content: message }, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, chapter, history, message, selection: pendingSelection }),
        signal: ctrl.signal,
      });
      setPendingSelection(undefined);
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Erro no tutor.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: m[m.length - 1].content + chunk }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: `⚠ ${(err as Error).message}` }]);
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col text-sm">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-fg-muted">Pergunte sobre este capítulo. O tutor conhece o conteúdo da página e dá dicas sem entregar a solução.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-lg px-3 py-2 ${m.role === "user" ? "ml-8 bg-accent-soft" : "mr-4 bg-surface-2"}`}
          >
            {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={ask} className="border-t border-line p-3">
        {pendingSelection && (
          <p className="mb-2 line-clamp-2 rounded-md bg-surface-2 px-2 py-1 text-xs text-fg-muted">
            Trecho: “{pendingSelection}”
            <button type="button" className="ml-2 underline" onClick={() => setPendingSelection(undefined)}>remover</button>
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sua pergunta…"
            aria-label="Pergunta para o tutor"
            className="min-w-0 flex-1 rounded-md border border-line-input bg-surface-1 px-2.5 py-2"
          />
          {streaming ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-md border border-line px-3">
              Parar
            </button>
          ) : (
            <button type="submit" className="rounded-md bg-accent px-3 font-medium text-fg-on-accent">
              Enviar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
