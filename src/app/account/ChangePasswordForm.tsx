"use client";

import { useState } from "react";
import { NewPassword } from "@/contracts/api";
import { FormError, PasswordInput, PRIMARY_BUTTON, useFormError } from "@/lib/input";

type ApiError = { error?: { code?: string; message?: string; details?: Record<string, string[] | undefined> } };

/** Campos do servidor (details do Zod) → id do campo na tela. */
const FIELD_IDS: Record<string, string> = { currentPassword: "current-password", newPassword: "new-password" };

/** Troca de senha com a sessão aberta: exige a atual; as outras sessões são encerradas, esta continua. */
export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, attempt, formRef, fail, clear, fieldProps } = useFormError("password-error");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    setDone(false);
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return fail(policy.error.issues[0].message, "new-password");
    if (password !== confirm) return fail("As senhas não conferem.", "confirm-password");
    if (password === current) return fail("A nova senha precisa ser diferente da atual.", "new-password");

    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: password }),
    }).catch(() => null);
    if (res?.status === 401) {
      window.location.href = "/login?next=/account";
      return;
    }
    setLoading(false);
    if (res?.ok) {
      setCurrent("");
      setPassword("");
      setConfirm("");
      setDone(true);
      return;
    }
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    const detailKey = Object.keys(body?.error?.details ?? {}).find((k) => body?.error?.details?.[k]?.length);
    const field = detailKey ? body!.error!.details![detailKey]![0] : undefined;
    const fieldId =
      (detailKey && FIELD_IDS[detailKey]) || (body?.error?.code === "WRONG_PASSWORD" ? "current-password" : null);
    fail(field ?? body?.error?.message ?? (res ? "Não foi possível trocar a senha." : "Sem conexão. Confira a internet e tente de novo."), fieldId);
  }

  return (
    <section className="mt-6 rounded-xl border border-line bg-surface-1 p-6 shadow-sm" aria-labelledby="trocar-senha">
      <h2 id="trocar-senha" className="text-lg font-semibold">
        Trocar senha
      </h2>
      <p className="mt-1 text-sm text-fg-muted">Ao trocar, as sessões abertas em outros aparelhos são encerradas.</p>
      <form ref={formRef} onSubmit={submit} noValidate>
        <label className="mt-4 block text-sm font-medium" htmlFor="current-password">
          Senha atual
        </label>
        <PasswordInput
          id="current-password"
          name="current-password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          {...fieldProps("current-password")}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="new-password">
          Nova senha
        </label>
        <PasswordInput
          id="new-password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldProps("new-password", "new-password-hint")}
        />
        <p id="new-password-hint" className="mt-1 text-xs text-fg-muted">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="confirm-password">
          Repita a nova senha
        </label>
        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...fieldProps("confirm-password")}
        />

        <FormError id="password-error" message={error} attempt={attempt} />
        {done && (
          // Exaggeration: a confirmação "pula" ao aparecer para o acerto ser notado.
          <p className="cf-jelly mt-2 flex items-center gap-1.5 text-sm text-success" role="status">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm3.03 4.72a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 0Z" />
            </svg>
            Senha alterada. As outras sessões foram encerradas; esta continua aberta.
          </p>
        )}
        <button
          type="submit"
          disabled={!loading && (!current || !password || !confirm)}
          aria-busy={loading || undefined}
          className={`mt-5 ${PRIMARY_BUTTON} sm:w-auto ${loading ? "cf-busy" : ""}`}
        >
          {loading ? "Salvando…" : "Trocar senha"}
        </button>
      </form>
    </section>
  );
}
