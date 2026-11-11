"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Phase = "loading" | "invalid" | "error";

/**
 * Destino do link de confirmação: /verify-email#token=...
 * O token vem no fragmento (não vai ao servidor nem no Referer) e sai da barra de endereço assim que é lido.
 * Confirmado o e-mail, a conta é criada já com a sessão aberta: segue para a página inicial.
 */
export default function VerifyEmailPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    async function confirm(token: string) {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => null);
      if (res?.ok) {
        window.location.replace("/");
        return;
      }
      const body = (await res?.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      if (body?.error?.code === "INVALID_VERIFICATION_TOKEN") setPhase("invalid");
      else {
        setMessage(body?.error?.message ?? "Não foi possível confirmar agora. Tente abrir o link de novo.");
        setPhase("error");
      }
    }

    // Também ao mudar só o fragmento (link colado numa aba que já estava nesta página: não há recarga).
    const read = () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (!token) {
        if (!started.current) setPhase("invalid");
        return;
      }
      started.current = true;
      window.history.replaceState(null, "", window.location.pathname);
      setPhase("loading");
      void confirm(token);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-6 shadow-md">
        <h1 className="text-xl font-semibold">Confirmação de e-mail</h1>

        {phase === "loading" && (
          <p className="mt-3 text-sm" role="status">
            Confirmando…
          </p>
        )}

        {phase === "invalid" && (
          <>
            <p className="mt-3 text-sm">
              Este link é inválido, expirou (vale por 24 horas) ou já foi usado. Se você já confirmou, é só entrar.
            </p>
            <div className="mt-5 flex justify-between text-sm">
              <Link href="/login" className="text-accent hover:underline">
                Entrar
              </Link>
              <Link href="/register" className="text-fg-muted hover:underline">
                Cadastrar de novo
              </Link>
            </div>
          </>
        )}

        {phase === "error" && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
