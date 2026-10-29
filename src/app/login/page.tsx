"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">CodeForge</h1>
        <p className="mt-1 text-sm text-fg-muted">Digite a senha para continuar.</p>
        <label className="mt-5 block text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoFocus
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
          disabled={loading || !password}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
