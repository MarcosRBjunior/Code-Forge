"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EMAIL_HINT, FIELD, FormError, PasswordInput, PRIMARY_BUTTON, isPlausibleEmail, normalizeEmail, useFormError } from "@/lib/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badCredentials, setBadCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { error, attempt, formRef, fail, clear, fieldProps } = useFormError("login-error");

  // Vindo da exclusão de conta (/account): confirma e tira o parâmetro da URL.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("conta") === "excluida") {
      setDeleted(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    clear();
    setBadCredentials(false);
    // Postel: aceita o e-mail colado com espaços ou maiúsculas e mostra já normalizado.
    const cleanEmail = normalizeEmail(email);
    setEmail(cleanEmail);
    if (!isPlausibleEmail(cleanEmail)) return fail(EMAIL_HINT, "email");

    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    }).catch(() => null);
    if (res?.ok) {
      // Mantém o botão ocupado até a navegação: nada de "voltar" ao estado inicial antes de sair da página.
      const next = new URLSearchParams(window.location.search).get("next");
      // Só volta para o próprio site: resolve a URL como o navegador faria ("/\host", "/\t/host" viram "//host")
      // e compara a origem.
      let destino = "/";
      if (next) {
        const u = new URL(next, window.location.origin);
        if (u.origin === window.location.origin) destino = u.pathname + u.search + u.hash;
      }
      window.location.href = destino;
      return;
    }
    setLoading(false);
    const body = (await res?.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    const invalid = body?.error?.code === "INVALID_CREDENTIALS";
    setBadCredentials(invalid);
    fail(body?.error?.message ?? (res ? "Não foi possível entrar." : "Sem conexão. Confira a internet e tente de novo."), invalid ? "password" : null);
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
        <h1 className="text-xl font-semibold">CodeForge</h1>
        <p className="mt-1 text-sm text-fg-muted">Entre com seu e-mail e senha.</p>
        {deleted && (
          <p className="cf-pop mt-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm" role="status">
            Sua conta e todos os dados dela foram excluídos.
          </p>
        )}
        <label className="mt-5 block text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
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
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldProps("password")}
        />
        <FormError id="login-error" message={error} attempt={attempt}>
          {badCredentials && (
            <span className="mt-1 block text-fg-muted">
              Acabou de criar a conta? Ela só passa a valer depois que você abre o link de confirmação enviado por e-mail.
            </span>
          )}
        </FormError>
        <button
          type="submit"
          disabled={!loading && (!email.trim() || !password)}
          aria-busy={loading || undefined}
          className={`mt-5 ${PRIMARY_BUTTON} ${loading ? "cf-busy" : ""}`}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="cf-hit text-fg-muted hover:underline">
            Esqueci minha senha
          </Link>
          <Link href="/register" className="cf-hit text-accent hover:underline">
            Criar conta <span aria-hidden="true" className="cf-nudge">→</span>
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-fg-muted">
          <Link href="/privacidade" className="cf-hit hover:underline">
            Política de privacidade
          </Link>
        </p>
      </form>
    </main>
  );
}
