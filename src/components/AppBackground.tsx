"use client";

import { GlassTiles, type GlassTilesPalette } from "@/components/ui/glass-tiles";

/** Paleta índigo do CodeForge (tokens.css); fora do componente para não recriar o WebGL a cada render. */
const PALETTE: GlassTilesPalette = { glow: "#6366f1", deep: "#312e81", ground: "#09090b" };

/**
 * Fundo do tema escuro: ladrilhos de vidro (21st.dev/@ham7a311/glass-tiles) fixos atrás de todo o app,
 * com um véu por cima para o texto manter o contraste. No tema claro fica oculto (e o WebGL para de desenhar).
 */
export function AppBackground() {
  return (
    <div aria-hidden className="cf-app-bg">
      <GlassTiles palette={PALETTE} columns={10} speed={0.6} />
      <div className="cf-app-bg__veil" />
    </div>
  );
}
