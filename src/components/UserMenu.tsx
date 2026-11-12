"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserResponse } from "@/contracts/api";

type User = UserResponse["user"];

/** Páginas acessadas sem login: nelas o menu de conta não aparece. */
const PUBLIC_PAGES = new Set(["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/privacidade"]);

function initials(user: User): string {
  const source = user.name.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 1);
  return letters.toUpperCase();
}

/** Botão com as iniciais do usuário no cabeçalho: abre nome, e-mail, "Minha conta" e "Sair". */
export function UserMenu() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isPublic = PUBLIC_PAGES.has(pathname);

  // Busca a conta ao montar e ao navegar enquanto ainda não há usuário (ex.: confirmação de e-mail que já loga).
  useEffect(() => {
    if (isPublic || user) return;
    const ctrl = new AbortController();
    fetch("/api/auth/me", { signal: ctrl.signal, cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<UserResponse>) : null))
      .then((body) => body && setUser(body.user))
      .catch(() => {
        /* sem sessão ou rede fora: o menu simplesmente não aparece */
      });
    return () => ctrl.abort();
  }, [isPublic, user]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  if (isPublic || !user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Conta de ${user.name || user.email}`}
        title={user.email}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-2 text-xs font-semibold hover:bg-surface-1"
      >
        {initials(user)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-line bg-surface-1 p-2 shadow-lg">
          <div className="border-b border-line px-2 pb-2 pt-1">
            {user.name && <p className="truncate text-sm font-medium">{user.name}</p>}
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
          >
            Minha conta
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
