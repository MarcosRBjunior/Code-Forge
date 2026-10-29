/** Regras compartilhadas da mock interview (rubrica, tempos, nota de corte). */
export type InterviewStyle = "strict" | "standard" | "coaching";
export type InterviewLevel = "new-grad" | "mid" | "senior";
export type Difficulty = "easy" | "medium" | "hard";

export interface InterviewConfig {
  style: InterviewStyle;
  level: InterviewLevel;
  noRun: boolean;
  mix: Record<Difficulty, number>;
}

export const MINUTES: Record<Difficulty, number> = { easy: 15, medium: 30, hard: 45 };
export const MAX_MINUTES = 120;

export const STYLES: Record<InterviewStyle, { label: string; hint: string }> = {
  strict: { label: "Rigoroso", hint: "Sem ajuda. Você se vira sozinho." },
  standard: { label: "Padrão", hint: "Como uma entrevista real." },
  coaching: { label: "Mentor", hint: "Dicas liberadas para aprender no caminho." },
};

export const LEVELS: Record<InterviewLevel, { label: string; bar: number }> = {
  "new-grad": { label: "Recém-formado (L3)", bar: 60 },
  mid: { label: "Pleno (L4)", bar: 70 },
  senior: { label: "Sênior (L5)", bar: 80 },
};

export const RUBRIC = [
  { key: "understanding", label: "Entendimento do problema", weight: 10, hint: "Fez perguntas, confirmou entradas, saídas e casos de borda antes de codar." },
  { key: "approach", label: "Abordagem", weight: 25, hint: "Partiu de uma solução simples e chegou a uma ótima, justificando a escolha." },
  { key: "implementation", label: "Implementação", weight: 25, hint: "Código correto, legível, com nomes claros e sem bugs." },
  { key: "testing", label: "Testes e verificação", weight: 15, hint: "Percorreu exemplos e bordas e achou os próprios bugs." },
  { key: "complexity", label: "Análise de complexidade", weight: 15, hint: "Tempo e espaço corretos, explicando de onde vem cada termo." },
  { key: "communication", label: "Comunicação", weight: 10, hint: "Pensou em voz alta e deixou o raciocínio fácil de acompanhar." },
] as const;

export type RubricKey = (typeof RUBRIC)[number]["key"];
export const SCORE_LABELS = ["", "Fraco", "Abaixo do esperado", "Bom", "Excelente"];

/** Nota 1–4 por área → 0–100 ponderado (1 = 0%, 4 = 100% do peso). */
export function totalScore(scores: Record<RubricKey, number>) {
  return Math.round(RUBRIC.reduce((sum, r) => sum + (r.weight * (scores[r.key] - 1)) / 3, 0));
}

export function encodeConfig(c: InterviewConfig) {
  return `${c.style}.${c.level}.${c.noRun ? 1 : 0}.${c.mix.easy}${c.mix.medium}${c.mix.hard}`;
}

export function decodeConfig(s: string | null): InterviewConfig | null {
  const m = /^(strict|standard|coaching)\.(new-grad|mid|senior)\.([01])\.([0-3])([0-3])([0-3])$/.exec(s ?? "");
  if (!m) return null;
  return {
    style: m[1] as InterviewStyle,
    level: m[2] as InterviewLevel,
    noRun: m[3] === "1",
    mix: { easy: Number(m[4]), medium: Number(m[5]), hard: Number(m[6]) },
  };
}
