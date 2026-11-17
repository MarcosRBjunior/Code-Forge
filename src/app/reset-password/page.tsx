"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NewPassword } from "@/contracts/api";
import { FormError, PasswordInput, PRIMARY_BUTTON, useFormError } from "@/lib/input";

type Phase = "loading" | "missing" | "form" | "done";

/**
 * Destino do link do e-mail: /reset-password#token=...
 * O token vem no fragmento (o navegador não o manda ao servidor nem no Referer). Assim que é lido, sai da barra
 * de endereço e do histórico.
 */
export default function ResetPasswordPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { error, attempt, formRef, fail, clear, fieldProps } = useFormError("reset-error");

  useEffect(() => {
    // Também ao mudar só o fragmento (link colado numa aba que já estava nesta página: não há recarga).
    const read = () => {
      const t = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (t) {
        setToken(t);
        clear();
        window.history.replaceState(null, "", window.location.pathname);
        setPhase("form");
      } else {
        setPhase((p) => (p === "loading" ? "missing" : p));
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [clear]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return fail(policy.error.issues[0].message, "password");
    if (password !== confirm) return fail("As senhas não conferem.", "confirm");

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setLoading(false);
    if (res?.ok) {
      setToken("");
      setPhase("done");
      return;
    }
    const body = (await res?.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    if (body?.error?.code === "INVALID_RESET_TOKEN") setPhase("missing");
    else fail(body?.error?.message ?? (res ? "Não foi possível trocar a senha." : "Sem conexão. Confira a internet e tente de novo."));
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="cf-rise-in w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Nova senha</h1>

        {phase === "loading" && (
          // Doherty: o espaço do form já aparece enquanto o token é lido, sem salto de layout.
          <div aria-hidden="true" className="mt-3 space-y-3">
            <div className="cf-skeleton h-4 w-3/4" />
            <div className="cf-skeleton h-10 w-full" />
          </div>
        )}

        {phase === "missing" && (
          <div className="cf-fade-in">
            <p className="mt-3 text-sm" role="alert">
              Este link é inválido, já foi usado ou expirou (vale por 30 minutos).
            </p>
            <Link href="/forgot-password" className="cf-hit mt-5 inline-block text-sm text-accent hover:underline">
              Pedir um novo link <span aria-hidden="true" className="cf-nudge">→</span>
            </Link>
          </div>
        )}

        {phase === "done" && (
          <div className="cf-pop">
            <p className="mt-3 text-sm" role="status">
              Senha alterada. Por segurança, todas as sessões abertas foram encerradas.
            </p>
            <Link
              href="/login"
              className={`cf-press mt-5 flex items-center justify-center text-center ${PRIMARY_BUTTON}`}
            >
              Entrar com a nova senha
            </Link>
          </div>
        )}

        {phase === "form" && (
          <form ref={formRef} onSubmit={submit} noValidate>
            <p id="reset-hint" className="mt-1 text-sm text-fg-muted">
              Mínimo de 8 caracteres, com ao menos uma letra e um número.
            </p>
            <label className="mt-5 block text-sm font-medium" htmlFor="password">
              Nova senha
            </label>
            <PasswordInput
              id="password"
              name="new-password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              {...fieldProps("password", "reset-hint")}
            />
            <label className="mt-4 block text-sm font-medium" htmlFor="confirm">
              Repita a nova senha
            </label>
            <PasswordInput
              id="confirm"
              name="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              {...fieldProps("confirm")}
            />
            <FormError id="reset-error" message={error} attempt={attempt} />
            <button
              type="submit"
              disabled={!loading && (!password || !confirm)}
              aria-busy={loading || undefined}
              className={`mt-5 ${PRIMARY_BUTTON} ${loading ? "cf-busy" : ""}`}
            >
              {loading ? "Salvando…" : "Trocar senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
