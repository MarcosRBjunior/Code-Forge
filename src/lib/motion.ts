"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reexecuta uma animação CSS de src/styles/motion.css (ex.: "cf-shake", "cf-bounce") no elemento,
 * mesmo que a classe já esteja aplicada. Usado para ações secundárias e feedback exagerado.
 */
export function replayAnimation(el: Element | null | undefined, className: string) {
  if (!el) return;
  el.classList.remove(className);
  // força reflow para o navegador reiniciar a animação
  void (el as HTMLElement).offsetWidth;
  el.classList.add(className);
  el.addEventListener("animationend", () => el.classList.remove(className), { once: true });
}

/** Ref + disparador: `const [ref, play] = useReplay<HTMLFormElement>(); play("cf-shake")`. */
export function useReplay<T extends Element>() {
  const ref = useRef<T>(null);
  const play = useCallback((className: string) => replayAnimation(ref.current, className), []);
  return [ref, play] as const;
}

/**
 * Doherty: só mostra o indicador de carregamento se a espera passar de `delay` ms.
 * Evita "piscar" skeleton/spinner em respostas rápidas e mantém o feedback para as lentas.
 */
export function useDelayedFlag(flag: boolean, delay = 150) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!flag) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [flag, delay]);
  return shown;
}

/** Anima o elemento quando `value` muda (ex.: contador de revisões dá um "pulo" ao mudar). */
export function useBounceOnChange<T extends Element>(value: unknown, className = "cf-bounce") {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    replayAnimation(ref.current, className);
  }, [value, className]);
  return ref;
}
