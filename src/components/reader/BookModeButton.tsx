"use client";

import { useEffect, useState } from "react";

/** Liga/desliga o "modo livro" (só o texto, sem barra lateral e sumário). Tecla de atalho: B. */
export function BookModeButton({ className }: { className: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem("cf-book") === "1";
    } catch {}
    apply(saved);
    setOn(saved);
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key.toLowerCase() !== "b" || e.ctrlKey || e.metaKey || el.closest("input, textarea, [contenteditable], .monaco-editor")) return;
      setOn((v) => {
        apply(!v);
        return !v;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.book; // sair do capítulo restaura o layout
    };
  }, []);

  function apply(v: boolean) {
    if (v) document.documentElement.dataset.book = "";
    else delete document.documentElement.dataset.book;
    try {
      localStorage.setItem("cf-book", v ? "1" : "0");
    } catch {}
  }

  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      title="Modo livro (B)"
      onClick={() => {
        apply(!on);
        setOn(!on);
      }}
    >
      📖 {on ? "Sair do modo livro" : "Modo livro"}
    </button>
  );
}
