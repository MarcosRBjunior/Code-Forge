"use client";

import Link from "next/link";
import { useState } from "react";
import { EMAIL_HINT, FIELD, FormError, PRIMARY_BUTTON, isPlausibleEmail, normalizeEmail, useFormError } from "@/lib/input";

/** Pede o link de redefinição. A resposta é sempre a mesma, exista o e-mail ou não. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, attempt, formRef, fail, clear, fieldProps } = useFormError("forgot-error");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    // Postel: e-mail colado com espaços ou maiúsculas é aceito e normalizado.
    const cleanEmail = normalizeEmail(email);
    setEmail(cleanEmail);
    if (!isPlausibleEmail(cleanEmail)) return fail(EMAIL_HINT, "email");

    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    }).catch(() => null);
    setLoading(false);
    const body = (await res?.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    if (res?.ok) setSent(body?.message ?? "Se o e-mail existir em nossa base, um link foi enviado");
    else fail(body?.error?.message ?? (res ? "Não foi possível enviar o pedido." : "Sem conexão. Confira a internet e tente de novo."), "email");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="cf-rise-in w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
        {sent ? (
          // Pose B: a confirmação entra no lugar do form, no mesmo cartão.
          <div className="cf-fade-in">
            <p className="mt-3 text-sm" role="status">
              {sent}. O link vale por 30 minutos; confira também a caixa de spam.
            </p>
            <Link href="/login" className="cf-hit mt-5 inline-block text-sm text-accent hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate>
            <p className="mt-1 text-sm text-fg-muted">Informe seu e-mail para receber um link de redefinição.</p>
            <label className="mt-5 block text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...fieldProps("email")}
              className={`mt-1.5 ${FIELD}`}
            />
            <FormError id="forgot-error" message={error} attempt={attempt} />
            <button
              type="submit"
              disabled={!loading && !email.trim()}
              aria-busy={loading || undefined}
              className={`mt-5 ${PRIMARY_BUTTON} ${loading ? "cf-busy" : ""}`}
            >
              {loading ? "Enviando…" : "Enviar link"}
            </button>
            <Link href="/login" className="cf-hit mt-4 inline-block text-sm text-fg-muted hover:underline">
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
