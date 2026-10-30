/**
 * Agendador de repetição espaçada (variante do SM-2). Funções puras, sem I/O.
 * Notas: 1 = errei, 2 = difícil, 3 = bom, 4 = fácil.
 */
export type Rating = 1 | 2 | 3 | 4;

export interface CardState {
  /** Fator de facilidade: quanto o intervalo cresce a cada acerto. */
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

export const INITIAL_STATE: CardState = { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 };

const MIN_EASE = 1.3;
const MAX_INTERVAL = 365;

export const RATING_LABELS: Record<Rating, string> = { 1: "Errei", 2: "Difícil", 3: "Bom", 4: "Fácil" };

/** Próximo estado do cartão depois de uma resposta. `intervalDays` 0 = revisar de novo hoje. */
export function schedule(state: CardState, rating: Rating): CardState {
  const { ease, intervalDays, reps, lapses } = state;

  if (rating === 1) {
    return { ease: Math.max(MIN_EASE, ease - 0.2), intervalDays: 0, reps: 0, lapses: lapses + 1 };
  }

  let next: number;
  if (rating === 2) {
    next = Math.max(1, Math.round(Math.max(intervalDays, 1) * 1.2));
  } else if (reps === 0) {
    next = rating === 3 ? 1 : 4;
  } else if (reps === 1) {
    next = rating === 3 ? 6 : 10;
  } else {
    const base = Math.max(intervalDays, 1) * ease;
    next = Math.round(rating === 3 ? base : base * 1.3);
  }
  // Nunca encolher um intervalo por causa de um acerto.
  if (rating !== 2) next = Math.max(next, intervalDays + 1);

  const easeDelta = rating === 2 ? -0.15 : rating === 4 ? 0.15 : 0;
  return {
    ease: Math.max(MIN_EASE, ease + easeDelta),
    intervalDays: Math.min(next, MAX_INTERVAL),
    reps: reps + 1,
    lapses,
  };
}

/** Rótulo curto do intervalo que cada nota produziria (exibido nos botões). */
export function previewLabels(state: CardState): Record<Rating, string> {
  const label = (days: number) => (days === 0 ? "hoje" : days === 1 ? "1 dia" : days < 30 ? `${days} dias` : days < 365 ? `${Math.round(days / 30)} meses` : "1 ano");
  return {
    1: label(schedule(state, 1).intervalDays),
    2: label(schedule(state, 2).intervalDays),
    3: label(schedule(state, 3).intervalDays),
    4: label(schedule(state, 4).intervalDays),
  };
}

/** Soma dias a uma data ISO (YYYY-MM-DD), sem depender do fuso da máquina. */
export function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
