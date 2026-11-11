"use client";

import Link from "next/link";
import { useState } from "react";

/** Pede o link de redefinição. A resposta é sempre a mesma, exista o e-mail ou não. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    const body = (await res?.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    if (res?.ok) setSent(body?.message ?? "Se o e-mail existir em nossa base, um link foi enviado");
    else setError(body?.error?.message ?? "Não foi possível enviar o pedido.");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
        {sent ? (
          <>
            <p className="mt-3 text-sm" role="status">
              {sent}. O link vale por 30 minutos; confira também a caixa de spam.
            </p>
            <Link href="/login" className="mt-5 inline-block text-sm text-accent hover:underline">
              Voltar para o login
            </Link>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="mt-1 text-sm text-fg-muted">Informe seu e-mail para receber um link de redefinição.</p>
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
              aria-describedby={error ? "forgot-error" : undefined}
              className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
            />
            {error && (
              <p id="forgot-error" className="mt-2 text-sm text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !email}
              className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
            >
              {loading ? "Enviando…" : "Enviar link"}
            </button>
            <Link href="/login" className="mt-4 inline-block text-sm text-fg-muted hover:underline">
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
