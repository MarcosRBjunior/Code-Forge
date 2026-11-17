"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { replayAnimation } from "@/lib/motion";

/** `<pre>` dos blocos de código com botão de copiar (aparece ao passar o mouse ou focar). */
export function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [state, setState] = useState<"idle" | "ok" | "erro">("idle");

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const text = ref.current?.innerText ?? "";
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    setState(ok ? "ok" : "erro");
    // Feedback exagerado: "Copiado" pula; a falha balança
    replayAnimation(btnRef.current, ok ? "cf-jelly" : "cf-shake");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="group relative">
      <pre ref={ref} {...props} />
      {/* depois do <pre>: o texto do botão não desloca as âncoras de destaque, que contam caracteres a partir do início do bloco */}
      <button
        ref={btnRef}
        type="button"
        onClick={copy}
        aria-label="Copiar código"
        className={`cf-hit absolute right-2 top-2 z-10 rounded-md border bg-surface-1/90 px-2.5 py-1 font-ui text-xs backdrop-blur hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${
          state === "ok"
            ? "border-success text-success opacity-100"
            : state === "erro"
              ? "border-danger text-danger opacity-100"
              : "border-line text-fg-muted opacity-0"
        }`}
      >
        {state === "ok" ? "✓ Copiado" : state === "erro" ? "Não foi possível copiar" : "Copiar"}
      </button>
      <span role="status" className="sr-only">
        {state === "ok" ? "Código copiado" : ""}
      </span>
    </div>
  );
}
