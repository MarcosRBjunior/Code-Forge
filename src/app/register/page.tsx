"use client";

import Link from "next/link";
import { useState } from "react";
import { NewPassword } from "@/contracts/api";
import { EMAIL_HINT, FIELD, FormError, PasswordInput, PRIMARY_BUTTON, isPlausibleEmail, normalizeEmail, useFormError } from "@/lib/input";

type ApiError = { error?: { code?: string; message?: string; details?: Record<string, string[] | undefined> } };

/** Campos do servidor (details do Zod) → id do campo na tela, para marcar e focar o certo. */
const FIELD_IDS = ["name", "email", "password"] as const;

/**
 * Cadastro com e-mail e senha. A conta só é criada quando a pessoa abre o link de confirmação (/verify-email).
 * Quem pode se cadastrar é decidido no servidor (REGISTRATION_OPEN / allowlist).
 */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const { error, attempt, formRef, fail, clear, fieldProps } = useFormError("register-error");

  async function send(cleanEmail: string) {
    return fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password }),
    }).catch(() => null);
  }

  async function resend() {
    if (!sentTo) return;
    setResendError(null);
    setLoading(true);
    const res = await send(sentTo);
    setLoading(false);
    if (res?.ok) setResent(true);
    else setResendError(((await res?.json().catch(() => null)) as ApiError | null)?.error?.message ?? "Não foi possível reenviar.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    // Postel: tolera espaços e maiúsculas no e-mail colado; o que vai ao servidor já sai normalizado.
    const cleanEmail = normalizeEmail(email);
    setEmail(cleanEmail);
    if (!name.trim()) return fail("Informe o nome.", "name");
    if (!isPlausibleEmail(cleanEmail)) return fail(EMAIL_HINT, "email");
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return fail(policy.error.issues[0].message, "password");
    if (password !== confirm) return fail("As senhas não conferem.", "confirm");

    setLoading(true);
    const res = await send(cleanEmail);
    setLoading(false);
    if (res?.ok) {
      setSentTo(cleanEmail);
      return;
    }
    const body = (await res?.json().catch(() => null)) as ApiError | null;
    const details = body?.error?.details ?? {};
    const fieldId = FIELD_IDS.find((k) => details[k]?.length) ?? null;
    const message = fieldId
      ? details[fieldId]![0]
      : (body?.error?.message ?? (res ? "Não foi possível criar a conta." : "Sem conexão. Confira a internet e tente de novo."));
    fail(message, fieldId);
  }

  if (sentTo) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="cf-pop w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
          <h1 className="text-xl font-semibold">Confirme seu e-mail</h1>
          <p className="mt-3 text-sm" role="status">
            Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o link para ativar a conta; ele vale por 24
            horas.
          </p>
          <p className="mt-3 text-sm text-fg-muted">
            Não chegou em alguns minutos? Confira a caixa de spam.{" "}
            {resent ? (
              <span role="status" className="cf-fade-in">
                Enviamos de novo.
              </span>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={loading}
                aria-busy={loading || undefined}
                className={`cf-hit text-accent hover:underline disabled:opacity-45 ${loading ? "cf-busy" : ""}`}
              >
                {loading ? "Reenviando…" : "Reenviar o link"}
              </button>
            )}
          </p>
          <FormError id="resend-error" message={resendError} attempt={0} />
          <Link href="/login" className="cf-hit mt-5 inline-block text-sm text-fg-muted hover:underline">
            Voltar para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    // A entrada (cf-rise-in) fica no <main>: o form recebe o cf-shake e as duas animações não podem disputar.
    <main className="cf-rise-in grid min-h-dvh place-items-center px-4">
      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md"
      >
        <h1 className="text-xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-fg-muted">Seu progresso, destaques e notas ficam só na sua conta.</p>

        <label className="mt-5 block text-sm font-medium" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          autoFocus
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          {...fieldProps("name")}
          className={`mt-1.5 ${FIELD}`}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="email">
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...fieldProps("email")}
          className={`mt-1.5 ${FIELD}`}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <PasswordInput
          id="password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldProps("password", "password-hint")}
        />
        <p id="password-hint" className="mt-1 text-xs text-fg-muted">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="confirm">
          Repita a senha
        </label>
        <PasswordInput
          id="confirm"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...fieldProps("confirm")}
        />

        <FormError id="register-error" message={error} attempt={attempt} />
        <p className="mt-4 text-xs text-fg-muted">
          Ao criar a conta, você concorda com o uso dos seus dados descrito na{" "}
          <Link href="/privacidade" target="_blank" className="text-accent hover:underline">
            política de privacidade
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={!loading && (!name.trim() || !email.trim() || !password || !confirm)}
          aria-busy={loading || undefined}
          className={`mt-5 ${PRIMARY_BUTTON} ${loading ? "cf-busy" : ""}`}
        >
          {loading ? "Criando…" : "Criar conta"}
        </button>
        <p className="mt-4 text-sm text-fg-muted">
          Já tem conta?{" "}
          <Link href="/login" className="cf-hit text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
