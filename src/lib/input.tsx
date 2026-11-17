"use client";

import { useCallback, useState, type InputHTMLAttributes } from "react";
import { useBounceOnChange } from "@/lib/motion";

/*
 * Formulários de conta (login, cadastro, senha). Reúne o que é comum entre eles:
 *   Postel ....... normalizeEmail aceita e-mail colado com espaços / maiúsculas; o servidor normaliza de novo.
 *   Jakob ........ PasswordInput com "Mostrar" (padrão conhecido), erro ligado ao campo por aria-invalid/describedby.
 *   Secondary .... o form treme e o ícone do erro balança a cada tentativa com erro (useFormError + FormError).
 *   Fitts ........ campos e botões com pelo menos 40px de altura (FIELD), alvo do "Mostrar" ampliado (.cf-hit).
 */

/** Classe base dos campos de texto: ≥ 40px de altura, borda acende no foco (pose A → B). */
export const FIELD =
  "min-h-10 w-full rounded-md border border-line-input bg-surface-1 px-3 py-2 transition-[border-color,box-shadow] duration-fast aria-[invalid=true]:border-danger";

/** Botão principal dos formulários: largura total, logo abaixo dos campos (Fitts). */
export const PRIMARY_BUTTON =
  "min-h-11 w-full rounded-md bg-accent px-4 py-2 font-medium text-fg-on-accent shadow-sm hover:bg-accent-hover hover:shadow-md disabled:opacity-45";

/**
 * Postel: tira todo espaço (inclusive os invisíveis que vêm de cópia, como NBSP e zero-width) e passa para
 * minúsculas. Um e-mail não tem espaço, então nada válido se perde.
 */
export function normalizeEmail(raw: string) {
  return raw.replace(/[\s​-‍﻿]+/g, "").toLowerCase();
}

/** Checagem mínima no cliente só para dar a mensagem na hora; a validação de verdade é a do servidor. */
export function isPlausibleEmail(email: string) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

export const EMAIL_HINT = "Informe um e-mail válido, como nome@exemplo.com.";

type FieldError = { message: string; field: string | null };

/**
 * Estado de erro de um formulário. `fail(mensagem, idDoCampo)` mostra o erro, marca o campo como inválido,
 * move o foco para ele e faz o form tremer. Sem campo, o erro vale para o form todo.
 */
export function useFormError(errorId: string) {
  const [error, setError] = useState<FieldError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const formRef = useBounceOnChange<HTMLFormElement>(attempt, "cf-shake");

  const fail = useCallback((message: string, field: string | null = null) => {
    setError({ message, field });
    setAttempt((a) => a + 1);
    if (field) {
      const el = document.getElementById(field);
      if (el instanceof HTMLInputElement) {
        el.focus();
        el.select();
      }
    }
  }, []);

  const clear = useCallback(() => setError(null), []);

  /** aria-invalid e aria-describedby do campo (o `hint` continua descrevendo o campo com ou sem erro). */
  const fieldProps = useCallback(
    (id: string, hint?: string) => {
      const linked = !!error && (error.field === id || error.field === null);
      const describedBy = [hint, linked ? errorId : null].filter(Boolean).join(" ") || undefined;
      return { "aria-invalid": error?.field === id || undefined, "aria-describedby": describedBy };
    },
    [error, errorId],
  );

  return { error: error?.message ?? null, attempt, formRef, fail, clear, fieldProps };
}

/** Mensagem de erro ao lado do campo; o ícone balança a cada nova tentativa (key = attempt). */
export function FormError({ id, message, attempt, children }: { id: string; message: string | null; attempt: number; children?: React.ReactNode }) {
  if (!message) return null;
  return (
    <p id={id} key={attempt} role="alert" className="cf-fade-in mt-2 flex gap-1.5 text-sm text-danger">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="cf-wiggle mt-0.5 size-4 shrink-0" fill="currentColor">
        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 11.75a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
      </svg>
      <span>
        {message}
        {children}
      </span>
    </p>
  );
}

/** Campo de senha com o botão "Mostrar"/"Ocultar" dentro dele (padrão conhecido; alvo ampliado com .cf-hit). */
export function PasswordInput({ className = "", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-1.5">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${FIELD} pr-20 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-controls={props.id}
        className="cf-hit absolute inset-y-1 right-1 rounded px-2.5 text-xs font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
