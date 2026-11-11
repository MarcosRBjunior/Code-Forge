"use client";

import Link from "next/link";
import { useState } from "react";
import { NewPassword } from "@/contracts/api";

type ApiError = { error?: { code?: string; message?: string; details?: Record<string, string[] | undefined> } };

/** Cadastro com e-mail e senha. Quem pode se cadastrar é decidido no servidor (REGISTRATION_OPEN / allowlist). */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return setError(policy.error.issues[0].message);
    if (password !== confirm) return setError("As senhas não conferem.");

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.href = "/"; // a sessão já vem aberta no cookie
      return;
    }
    setLoading(false);
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    const field = body?.error?.details && Object.values(body.error.details).flat().find(Boolean);
    setError(field ?? body?.error?.message ?? "Não foi possível criar a conta.");
  }

  const input = "mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2";
  const describedBy = error ? "register-error" : undefined;

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-fg-muted">Seu progresso, destaques e notas ficam só na sua conta.</p>

        <label className="mt-5 block text-sm font-medium" htmlFor="name">
          Nome
        </label>
        <input id="name" autoComplete="name" autoFocus maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={input} />

        <label className="mt-4 block text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={describedBy ? `password-hint ${describedBy}` : "password-hint"}
          className={input}
        />
        <p id="password-hint" className="mt-1 text-xs text-fg-muted">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="confirm">
          Repita a senha
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-describedby={describedBy}
          className={input}
        />

        {error && (
          <p id="register-error" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !name.trim() || !email || !password || !confirm}
          className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
        >
          {loading ? "Criando…" : "Criar conta"}
        </button>
        <p className="mt-4 text-sm text-fg-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
