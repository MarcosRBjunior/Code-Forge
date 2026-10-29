export const COLORS = ["yellow", "green", "blue", "pink", "purple"] as const;
export type Color = (typeof COLORS)[number];
export const COLOR_LABEL: Record<Color, string> = {
  yellow: "Amarelo",
  green: "Verde",
  blue: "Azul",
  pink: "Rosa",
  purple: "Roxo",
};
