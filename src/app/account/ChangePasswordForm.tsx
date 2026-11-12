"use client";

import { useState } from "react";
import { NewPassword } from "@/contracts/api";

type ApiError = { error?: { code?: string; message?: string; details?: Record<string, string[] | undefined> } };

/** Troca de senha com a sessão aberta: exige a atual; as outras sessões são encerradas, esta continua. */
export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return setError(policy.error.issues[0].message);
    if (password !== confirm) return setError("As senhas não conferem.");
    if (password === current) return setError("A nova senha precisa ser diferente da atual.");

    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: password }),
    }).catch(() => null);
    setLoading(false);
    if (res?.ok) {
      setCurrent("");
      setPassword("");
      setConfirm("");
      setDone(true);
      return;
    }
    if (res?.status === 401) {
      window.location.href = "/login?next=/account";
      return;
    }
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    const field = body?.error?.details && Object.values(body.error.details).flat().find(Boolean);
    setError(field ?? body?.error?.message ?? "Não foi possível trocar a senha.");
  }

  const input = "mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2";
  const describedBy = error ? "password-error" : undefined;

  return (
    <section className="mt-6 rounded-xl border border-line bg-surface-1 p-6 shadow-sm" aria-labelledby="trocar-senha">
      <h2 id="trocar-senha" className="text-lg font-semibold">
        Trocar senha
      </h2>
      <p className="mt-1 text-sm text-fg-muted">Ao trocar, as sessões abertas em outros aparelhos são encerradas.</p>
      <form onSubmit={submit}>
        <label className="mt-4 block text-sm font-medium" htmlFor="current-password">
          Senha atual
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          aria-describedby={describedBy}
          className={input}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="new-password">
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={describedBy ? `new-password-hint ${describedBy}` : "new-password-hint"}
          className={input}
        />
        <p id="new-password-hint" className="mt-1 text-xs text-fg-muted">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="confirm-password">
          Repita a nova senha
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-describedby={describedBy}
          className={input}
        />

        {error && (
          <p id="password-error" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
        {done && (
          <p className="mt-2 text-sm" role="status">
            Senha alterada. As outras sessões foram encerradas; esta continua aberta.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !current || !password || !confirm}
          className="mt-5 rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
        >
          {loading ? "Salvando…" : "Trocar senha"}
        </button>
      </form>
    </section>
  );
}
