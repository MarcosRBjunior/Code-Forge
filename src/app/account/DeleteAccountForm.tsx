"use client";

import { useState } from "react";
import { FormError, PasswordInput, useFormError } from "@/lib/input";

type ApiError = { error?: { code?: string; message?: string } };

/** Exclusão da conta: exige marcar a confirmação e digitar a senha atual. Apaga tudo e leva ao login. */
export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { error, attempt, formRef, fail, clear, fieldProps } =
    useFormError("delete-error");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    if (!understood)
      return fail("Marque a confirmação para continuar.", "delete-understood");

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
    if (res?.status === 401) {
      window.location.href = "/login?next=/account";
      return;
    }
    setLoading(false);
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    fail(
      body?.error?.message ??
        (res
          ? "Não foi possível excluir a conta."
          : "Sem conexão. Confira a internet e tente de novo."),
      body?.error?.code === "WRONG_PASSWORD" ? "delete-password" : null,
    );
  }

  function cancel() {
    setOpen(false);
    setUnderstood(false);
    setPassword("");
    clear();
  }

  return (
    <section
      className="mt-6 rounded-xl border border-danger/40 bg-surface-1 p-6 shadow-sm"
      aria-labelledby="excluir-conta"
    >
      <h2 id="excluir-conta" className="text-lg font-semibold text-danger">
        Excluir conta
      </h2>
      <p className="mt-1 text-sm text-fg-muted">
        Apaga a sua conta e todos os seus dados: progresso, destaques, notas,
        rascunhos de código, revisões, entrevistas e histórico de atividade. Não
        dá para desfazer.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 min-h-10 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
        >
          Quero excluir minha conta
        </button>
      ) : (
        // Staging: a confirmação abre no lugar do botão, com o foco já na primeira escolha.
        // (cf-pop no wrapper: o form recebe o cf-shake e as animações não podem disputar.)
        <div className="cf-pop">
          <form ref={formRef} onSubmit={submit} noValidate>
            <label className="mt-4 flex min-h-10 cursor-pointer items-start gap-2 text-sm">
              <input
                id="delete-understood"
                type="checkbox"
                autoFocus
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                {...fieldProps("delete-understood")}
                className="mt-0.5 size-4 accent-danger"
              />
              <span>
                Entendo que a conta e todos os dados serão apagados para sempre.
              </span>
            </label>

            <label
              className="mt-2 block text-sm font-medium"
              htmlFor="delete-password"
            >
              Senha atual
            </label>
            <PasswordInput
              id="delete-password"
              name="current-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              {...fieldProps("delete-password")}
            />

            <FormError id="delete-error" message={error} attempt={attempt} />
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!loading && (!understood || !password)}
                aria-busy={loading || undefined}
                className={`min-h-10 rounded-md bg-danger px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-45 ${loading ? "cf-busy" : ""}`}
              >
                {loading ? "Excluindo…" : "Excluir conta definitivamente"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={loading}
                className="min-h-10 rounded-md border border-line px-4 py-2 text-sm hover:bg-surface-2 disabled:opacity-45"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
