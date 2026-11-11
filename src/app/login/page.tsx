"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get("next");
      // Só volta para o próprio site: resolve a URL como o navegador faria ("/\host", "/\t/host" viram "//host")
      // e compara a origem.
      let destino = "/";
      if (next) {
        const u = new URL(next, window.location.origin);
        if (u.origin === window.location.origin) destino = u.pathname + u.search + u.hash;
      }
      window.location.href = destino;
    } else {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(body?.error?.message ?? "Não foi possível entrar.");
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">CodeForge</h1>
        <p className="mt-1 text-sm text-fg-muted">Entre com seu e-mail e senha.</p>
        <label className="mt-5 block text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
        />
        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={error ? "login-error" : undefined}
          className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
        />
        {error && (
          <p id="login-error" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-fg-muted hover:underline">
            Esqueci minha senha
          </Link>
          <Link href="/register" className="text-accent hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </main>
  );
}
