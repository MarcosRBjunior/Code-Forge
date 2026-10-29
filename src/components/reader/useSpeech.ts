"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { offsetsToRange } from "./anchoring";

/**
 * Leitura em voz alta gratuita via Web Speech API do navegador.
 * Lê bloco a bloco (pula blocos de código) e destaca a palavra atual com a
 * CSS Custom Highlight API a partir dos eventos `boundary` — sem modificar o DOM.
 */
export type SpeechStatus = "unsupported" | "idle" | "playing" | "paused";

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "pt-BR" && /natural|neural|online/i.test(v.name)) ??
    voices.find((v) => v.lang === "pt-BR") ??
    voices.find((v) => v.lang.startsWith("pt")) ??
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

  useEffect(() => {
    if (!("speechSynthesis" in window)) setStatus("unsupported");
    else speechSynthesis.getVoices(); // dispara o carregamento das vozes
    return () => {
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
    (blocks: HTMLElement[], index: number, token: number) => {
      if (token !== session.current) return;
      if (index >= blocks.length) {
        clearMarks();
        setStatus("idle");
        return;
      }
      const block = blocks[index];
      const text = block.textContent ?? "";
      document.querySelectorAll("[data-tts-block]").forEach((el) => el.removeAttribute("data-tts-block"));
      block.setAttribute("data-tts-block", "active");
      comfortScroll(block);

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.voice = pickVoice();
      u.rate = rateRef.current;
      u.onboundary = (e) => {
        if (token !== session.current || e.name !== "word" || !("highlights" in CSS)) return;
        const len = e.charLength || (/^\S+/.exec(text.slice(e.charIndex))?.[0].length ?? 1);
        const range = offsetsToRange(block, e.charIndex, e.charIndex + len);
        if (range) CSS.highlights.set("tts-word", new Highlight(range));
      };
      u.onend = () => speakFrom(blocks, index + 1, token);
      u.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") speakFrom(blocks, index + 1, token);
      };
      speechSynthesis.speak(u);
    },
    [],
  );

  /** Começa no bloco informado ou no primeiro bloco de texto visível na tela. */
  const play = useCallback(
    (fromBlock?: HTMLElement) => {
      const root = rootRef.current;
      if (!root || status === "unsupported") return;
      if (status === "paused" && !fromBlock) {
        speechSynthesis.resume();
        setStatus("playing");
        return;
      }
      speechSynthesis.cancel();
      const token = ++session.current;
      const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-block-id][data-block-kind="text"]'));
      let start = fromBlock ? blocks.indexOf(fromBlock) : blocks.findIndex((b) => b.getBoundingClientRect().bottom > 80);
      if (start < 0) start = 0;
      setStatus("playing");
      speakFrom(blocks, start, token);
    },
    [rootRef, speakFrom, status],
  );

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    session.current++;
    speechSynthesis.cancel();
    clearMarks();
    setStatus("idle");
  }, []);

  return { status, rate, setRate, play, pause, stop };
}
