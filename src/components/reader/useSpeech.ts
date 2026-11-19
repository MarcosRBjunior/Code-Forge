"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { offsetsToRange } from "./anchoring";

/**
 * Leitura em voz alta gratuita via Web Speech API do navegador.
 * Lê bloco a bloco (pula blocos de código) e destaca a palavra atual com a
 * CSS Custom Highlight API a partir dos eventos `boundary` — sem modificar o DOM.
 *
 * Cuidados para celular:
 * - Chrome Android ignora `speak()` chamado logo após `cancel()`: só cancelamos se algo estiver tocando.
 * - `pause()`/`resume()` não funcionam no Android: pausar = cancelar e lembrar o bloco; continuar = reler o bloco.
 * - Vozes podem vir com `pt_BR` e vozes online podem falhar: se o bloco falhar com a voz escolhida,
 *   tenta de novo só com `lang` (voz padrão do sistema).
 * - iOS não toca nada com a chave de silencioso ligada (limitação do sistema).
 */
export type SpeechStatus = "unsupported" | "idle" | "playing" | "paused";

const isPt = (lang: string) => lang.replace("_", "-").toLowerCase().startsWith("pt");
const isPtBR = (lang: string) => lang.replace("_", "-").toLowerCase() === "pt-br";

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => isPtBR(v.lang) && /natural|neural|online/i.test(v.name)) ??
    voices.find((v) => isPtBR(v.lang) && v.localService) ??
    voices.find((v) => isPtBR(v.lang)) ??
    voices.find((v) => isPt(v.lang)) ??
    null
  );
}

function comfortScroll(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top < vh * 0.15 || r.bottom > vh * 0.75) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }
}

export function useSpeech(rootRef: React.RefObject<HTMLElement | null>) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [rate, setRate] = useState(1);
  const session = useRef(0); // invalida callbacks de falas canceladas
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const current = useRef<{ blocks: HTMLElement[]; index: number } | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) setStatus("unsupported");
    else speechSynthesis.getVoices(); // dispara o carregamento das vozes
    return () => {
      // Intencional: queremos o valor mais recente de session.current na limpeza (não é um nó DOM).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      session.current++;
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      clearMarks();
    };
  }, []);

  const clearMarks = () => {
    document.querySelectorAll("[data-tts-block]").forEach((el) => el.removeAttribute("data-tts-block"));
    if ("highlights" in CSS) CSS.highlights.delete("tts-word");
  };

  const speakFrom = useCallback(
    (blocks: HTMLElement[], index: number, token: number, withVoice = true) => {
      if (token !== session.current) return;
      if (index >= blocks.length) {
        current.current = null;
        clearMarks();
        setStatus("idle");
        return;
      }
      current.current = { blocks, index };
      const block = blocks[index];
      const text = block.textContent ?? "";
      document.querySelectorAll("[data-tts-block]").forEach((el) => el.removeAttribute("data-tts-block"));
      block.setAttribute("data-tts-block", "active");
      comfortScroll(block);

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      const voice = withVoice ? pickVoice() : null;
      if (voice) u.voice = voice;
      u.rate = rateRef.current;
      u.onboundary = (e) => {
        if (token !== session.current || e.name !== "word" || !("highlights" in CSS)) return;
        const len = e.charLength || (/^\S+/.exec(text.slice(e.charIndex))?.[0].length ?? 1);
        const range = offsetsToRange(block, e.charIndex, e.charIndex + len);
        if (range) CSS.highlights.set("tts-word", new Highlight(range));
      };
      u.onend = () => speakFrom(blocks, index + 1, token);
      u.onerror = (e) => {
        if (token !== session.current || e.error === "interrupted" || e.error === "canceled") return;
        if (e.error === "not-allowed") {
          // navegador bloqueou a fala (sem gesto do usuário): volta ao estado inicial
          current.current = null;
          clearMarks();
          setStatus("idle");
          return;
        }
        // voz escolhida falhou: tenta o mesmo bloco com a voz padrão; se já era a padrão, segue
        if (voice) speakFrom(blocks, index, token, false);
        else speakFrom(blocks, index + 1, token);
      };
      speechSynthesis.speak(u);
    },
    [],
  );

  const start = useCallback(
    (blocks: HTMLElement[], index: number) => {
      const token = ++session.current;
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      speechSynthesis.resume(); // destrava motores que ficaram presos em "pausado"
      setStatus("playing");
      speakFrom(blocks, index, token);
    },
    [speakFrom],
  );

  /** Começa no bloco informado ou no primeiro bloco de texto visível na tela. */
  const play = useCallback(
    (fromBlock?: HTMLElement) => {
      const root = rootRef.current;
      if (!root || status === "unsupported") return;
      if (status === "paused" && !fromBlock && current.current) {
        // continuar = reler o bloco onde parou (funciona também no Android)
        start(current.current.blocks, current.current.index);
        return;
      }
      const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-block-id][data-block-kind="text"]'));
      let index = fromBlock ? blocks.indexOf(fromBlock) : blocks.findIndex((b) => b.getBoundingClientRect().bottom > 80);
      if (index < 0) index = 0;
      start(blocks, index);
    },
    [rootRef, start, status],
  );

  const pause = useCallback(() => {
    session.current++; // ignora o onend/onerror da fala cancelada
    speechSynthesis.cancel();
    if ("highlights" in CSS) CSS.highlights.delete("tts-word");
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    session.current++;
    current.current = null;
    speechSynthesis.cancel();
    clearMarks();
    setStatus("idle");
  }, []);

  return { status, rate, setRate, play, pause, stop };
}
