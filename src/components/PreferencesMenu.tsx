"use client";

import { useEffect, useRef, useState } from "react";

type Prefs = {
  theme: "light" | "dark" | "system";
  size: "xs" | "s" | "m" | "l" | "xl";
  leading: "tight" | "normal" | "relaxed";
  width: "compact" | "normal" | "wide" | "full";
  font: "serif" | "sans" | "mono";
};

const DEFAULTS: Prefs = { theme: "system", size: "m", leading: "normal", width: "normal", font: "serif" };

function readPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("cf-prefs") ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

function applyPrefs(p: Prefs) {
  const d = document.documentElement;
  d.dataset.theme = p.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : p.theme;
  d.dataset.readerSize = p.size;
  d.dataset.readerWidth = p.width;
  d.dataset.readerFont = p.font;
  if (p.leading === "normal") delete d.dataset.readerLeading;
  else d.dataset.readerLeading = p.leading;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange(v: T): void;
}) {
  return (
    <fieldset className="mt-3 first:mt-0">
      <legend className="mb-1.5 text-xs font-medium text-fg-muted">{label}</legend>
      <div className="flex rounded-md border border-line bg-surface-2 p-0.5">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className="flex-1 rounded-sm px-2 py-1 text-xs text-fg-muted transition-colors duration-fast hover:text-fg aria-pressed:bg-surface-1 aria-pressed:font-medium aria-pressed:text-fg aria-pressed:shadow-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function PreferencesMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setPrefs(readPrefs()), []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem("cf-prefs", JSON.stringify(next));
    } catch {
      /* armazenamento indisponível: preferência vale só nesta aba */
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Preferências de leitura e tema"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-line px-2.5 py-1.5 font-prose text-sm hover:bg-surface-2"
      >
        Aa
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-line bg-surface-1 p-4 shadow-lg">
          <Segmented label="Tema" value={prefs.theme} onChange={(v) => update("theme", v)}
            options={[["light", "Claro"], ["dark", "Escuro"], ["system", "Sistema"]]} />
          <Segmented label="Tamanho do texto" value={prefs.size} onChange={(v) => update("size", v)}
            options={[["xs", "XS"], ["s", "S"], ["m", "M"], ["l", "L"], ["xl", "XL"]]} />
          <Segmented label="Entrelinha" value={prefs.leading} onChange={(v) => update("leading", v)}
            options={[["tight", "Justa"], ["normal", "Normal"], ["relaxed", "Ampla"]]} />
          <Segmented label="Largura" value={prefs.width} onChange={(v) => update("width", v)}
            options={[["compact", "Estreita"], ["normal", "Normal"], ["wide", "Larga"], ["full", "Total"]]} />
          <Segmented label="Fonte" value={prefs.font} onChange={(v) => update("font", v)}
            options={[["serif", "Serifa"], ["sans", "Sans"], ["mono", "Mono"]]} />
        </div>
      )}
    </div>
  );
}
