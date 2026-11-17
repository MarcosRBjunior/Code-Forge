"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Jakob: ← / → levam ao capítulo anterior / próximo, como em leitores de livro e documentação.
 * Ignora a tecla quando outro componente já a usou (abas, animações, editor) ou quando há foco em campo de texto.
 */
export function ChapterKeyNav({ prev, next }: { prev?: string; next?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest?.(
          'input, textarea, select, [contenteditable], .monaco-editor, [role="tablist"], [role="radiogroup"], [role="slider"], [role="dialog"], [data-keys], [data-reader-aside], [data-selection-toolbar]',
        )
      )
        return;
      const href = e.key === "ArrowLeft" ? prev : next;
      if (!href) return;
      e.preventDefault();
      router.push(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  return null;
}
