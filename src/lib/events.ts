/** Evento global disparado quando o progresso de um capítulo muda (capítulo/editor → sidebar). */
export const PROGRESS_EVENT = "cf:progress";
export type ProgressEventDetail = { key: string; completed: boolean };
