"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const AVISO = "Faça login para acessar os cursos e o restante do CodeForge.";

/**
 * Na tela de login, o cabeçalho continua visível, mas nenhum item dele funciona: um clique em link ou botão
 * (menus de cursos e prática, busca, preferências) é barrado, mostra um aviso e leva o foco ao campo de e-mail.
 * A proteção de verdade é o middleware; isto só evita que o usuário pense que o site está aberto.
 */
export function HeaderGuard({ children }: { children: React.ReactNode }) {
  const naLogin = usePathname() === "/login";
  const [aviso, setAviso] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const avisar = () => {
    setAviso(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(false), 5000);
    document.getElementById("email")?.focus();
  };

  // Ctrl+K (busca) também fica bloqueado. A escuta em captura na window roda antes da do SearchDialog.
  useEffect(() => {
    if (!naLogin) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        avisar();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [naLogin]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!naLogin) return <>{children}</>;

  return (
    <div
      className="contents"
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) {
          e.preventDefault();
          e.stopPropagation();
          avisar();
        }
      }}
    >
      {children}
      {aviso && (
        <div
          role="alert"
          className="fixed left-1/2 top-[calc(var(--cf-layout-header-h)+0.75rem)] z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-line bg-surface-1 px-4 py-3 text-sm shadow-lg"
        >
          🔒 {AVISO}
        </div>
      )}
    </div>
  );
}
