"use client";

import { useState } from "react";

type ApiError = { error?: { code?: string; message?: string } };

/** Exclusão da conta: exige marcar a confirmação e digitar a senha atual. Apaga tudo e leva ao login. */
export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!understood) return setError("Marque a confirmação para continuar.");

    setLoading(true);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.href = "/login?conta=excluida";
      return;
    }
    setLoading(false);
    if (res?.status === 401) {
      window.location.href = "/login?next=/account";
      return;
    }
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    setError(body?.error?.message ?? "Não foi possível excluir a conta.");
  }

  return (
    <section className="mt-6 rounded-xl border border-danger/40 bg-surface-1 p-6 shadow-sm" aria-labelledby="excluir-conta">
      <h2 id="excluir-conta" className="text-lg font-semibold text-danger">
        Excluir conta
      </h2>
      <p className="mt-1 text-sm text-fg-muted">
        Apaga a sua conta e todos os seus dados: progresso, destaques, notas, rascunhos de código, revisões, entrevistas e
        histórico de atividade. Não dá para desfazer.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
        >
          Quero excluir minha conta
        </button>
      ) : (
        <form onSubmit={submit}>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5" />
            <span>Entendo que a conta e todos os dados serão apagados para sempre.</span>
          </label>

          <label className="mt-4 block text-sm font-medium" htmlFor="delete-password">
            Senha atual
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={error ? "delete-error" : undefined}
            className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
          />

          {error && (
            <p id="delete-error" className="mt-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading || !understood || !password}
              className="rounded-md bg-danger px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-45"
            >
              {loading ? "Excluindo…" : "Excluir conta definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setUnderstood(false);
                setPassword("");
                setError(null);
              }}
              className="rounded-md border border-line px-4 py-2 text-sm hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
