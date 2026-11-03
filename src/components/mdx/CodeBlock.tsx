"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";

/** `<pre>` dos blocos de código com botão de copiar (aparece ao passar o mouse ou focar). */
export function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [state, setState] = useState<"idle" | "ok" | "erro">("idle");

  async function copy() {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      setState("erro");
    }
    setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="group relative">
      <pre ref={ref} {...props} />
      {/* depois do <pre>: o texto do botão não desloca as âncoras de destaque, que contam caracteres a partir do início do bloco */}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar código"
        className="absolute right-2 top-2 z-10 rounded-md border border-line bg-surface-1/90 px-2 py-1 font-ui text-xs text-fg-muted opacity-0 backdrop-blur transition-opacity hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        {state === "ok" ? "✓ Copiado" : state === "erro" ? "Não foi possível copiar" : "Copiar"}
      </button>
      <span role="status" className="sr-only">
        {state === "ok" ? "Código copiado" : ""}
      </span>
    </div>
  );
}
