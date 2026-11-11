"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NewPassword } from "@/contracts/api";

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Também ao mudar só o fragmento (link colado numa aba que já estava nesta página: não há recarga).
    const read = () => {
      const t = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (t) {
        setToken(t);
        setError(null);
        window.history.replaceState(null, "", window.location.pathname);
        setPhase("form");
      } else {
        setPhase((p) => (p === "loading" ? "missing" : p));
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const policy = NewPassword.safeParse(password);
    if (!policy.success) return setError(policy.error.issues[0].message);
    if (password !== confirm) return setError("As senhas não conferem.");

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
    else setError(body?.error?.message ?? "Não foi possível trocar a senha.");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Nova senha</h1>

        {phase === "missing" && (
          <>
            <p className="mt-3 text-sm" role="alert">
              Este link é inválido, já foi usado ou expirou (vale por 30 minutos).
            </p>
            <Link href="/forgot-password" className="mt-5 inline-block text-sm text-accent hover:underline">
              Pedir um novo link
            </Link>
          </>
        )}

        {phase === "done" && (
          <>
            <p className="mt-3 text-sm" role="status">
              Senha alterada. Por segurança, todas as sessões abertas foram encerradas.
            </p>
            <Link
              href="/login"
              className="mt-5 block w-full rounded-md bg-accent px-4 py-2 text-center font-medium text-fg-on-accent hover:bg-accent-hover"
            >
              Entrar com a nova senha
            </Link>
          </>
        )}

        {phase === "form" && (
          <form onSubmit={submit}>
            <p className="mt-1 text-sm text-fg-muted">Mínimo de 8 caracteres, com ao menos uma letra e um número.</p>
            <label className="mt-5 block text-sm font-medium" htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={error ? "reset-error" : undefined}
              className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
            />
            <label className="mt-4 block text-sm font-medium" htmlFor="confirm">
              Repita a nova senha
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-describedby={error ? "reset-error" : undefined}
              className="mt-1.5 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2"
            />
            {error && (
              <p id="reset-error" className="mt-2 text-sm text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="mt-5 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-45"
            >
              {loading ? "Salvando…" : "Trocar senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
