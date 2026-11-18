"use client";

import { useEffect, useState } from "react";
import { GlassTiles, type GlassTilesPalette } from "@/components/ui/glass-tiles";

/** Paletas índigo do CodeForge (tokens.css); fora do componente para não recriar o WebGL a cada render. */
const DARK: GlassTilesPalette = { glow: "#6366f1", deep: "#312e81", ground: "#09090b" };
const LIGHT: GlassTilesPalette = { glow: "#6366f1", deep: "#a5b4fc", ground: "#f7f7ff" };

/** Acompanha o data-theme do <html> (definido antes do primeiro paint e trocado pelo PreferencesMenu). */
function useTheme() {
  const [theme, setTheme] = useState<string | undefined>(undefined);
  useEffect(() => {
    const d = document.documentElement;
    const read = () => setTheme(d.dataset.theme);
    read();
    const mo = new MutationObserver(read);
    mo.observe(d, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

/**
 * Fundo de ladrilhos de vidro (21st.dev/@ham7a311/glass-tiles) fixo atrás de todo o app, com um véu por cima
 * para o texto manter o contraste. No tema escuro a luz brilha índigo no escuro; no claro vira um tom lilás
 * sobre papel claro (variant="light").
 */
export function AppBackground() {
  const light = useTheme() === "light";
  return (
    <div aria-hidden className="cf-app-bg">
      <GlassTiles
        key={light ? "light" : "dark"}
        palette={light ? LIGHT : DARK}
        variant={light ? "light" : "dark"}
        columns={10}
        speed={0.6}
      />
      <div className="cf-app-bg__veil" />
    </div>
  );
}
