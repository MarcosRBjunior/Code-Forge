/**
 * Tailwind mapeado para os tokens de src/styles/tokens.css (Fase 2).
 * Tudo aponta para CSS variables: trocar o tema é só trocar data-theme no <html>.
 */
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const v = (name: string) => `var(--cf-${name})`;

const config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: { 1: v("surface-1"), 2: v("surface-2"), 3: v("surface-3") },
        line: { DEFAULT: v("border"), strong: v("border-strong"), input: v("border-input") },
        fg: {
          DEFAULT: v("text"),
          prose: v("text-prose"),
          muted: v("text-muted"),
          subtle: v("text-subtle"),
          "on-accent": v("text-on-accent"),
        },
        accent: { DEFAULT: v("accent"), hover: v("accent-hover"), soft: v("accent-soft"), text: v("accent-text") },
        success: { DEFAULT: v("success"), soft: v("success-soft") },
        warning: { DEFAULT: v("warning"), soft: v("warning-soft") },
        danger: { DEFAULT: v("danger"), soft: v("danger-soft") },
        info: { DEFAULT: v("info"), soft: v("info-soft") },
        hl: { yellow: v("hl-yellow"), green: v("hl-green"), blue: v("hl-blue"), pink: v("hl-pink"), purple: v("hl-purple") },
        code: { bg: v("code-bg"), border: v("code-border") },
      },
      fontFamily: {
        ui: [v("font-ui")],
        prose: [v("font-prose")],
        mono: [v("font-mono")],
      },
      maxWidth: { reader: v("reader-measure") },
      width: { sidebar: v("layout-sidebar-w"), aside: v("layout-aside-w"), toc: v("layout-toc-w") },
      height: { header: v("layout-header-h") },
      borderRadius: { xs: v("radius-xs"), sm: v("radius-sm"), md: v("radius-md"), lg: v("radius-lg"), xl: v("radius-xl") },
      boxShadow: { sm: v("shadow-sm"), md: v("shadow-md"), lg: v("shadow-lg") },
      transitionDuration: { fast: v("duration-fast"), base: v("duration-base"), slow: v("duration-slow") },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("completed", '&[data-state~="completed"]');
      addVariant("current", '&[aria-current="page"]');
    }),
  ],
} satisfies Config;

export default config;
