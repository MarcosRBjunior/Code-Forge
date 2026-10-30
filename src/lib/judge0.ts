import "server-only";
import type { Lang } from "@/lib/langs";

/** Ids das linguagens no Judge0 CE (https://ce.judge0.com/languages). */
const LANGUAGE_ID: Partial<Record<Lang, number>> = { java: 91, cpp: 105, csharp: 51, go: 107 };

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
}

/**
 * Executa um programa no Judge0. O endereço vem de JUDGE0_URL (padrão: instância pública gratuita);
 * se a instância exigir token, defina JUDGE0_TOKEN.
 */
export async function runOnJudge0(lang: Lang, source: string): Promise<Judge0Result> {
  const base = (process.env.JUDGE0_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
  const id = LANGUAGE_ID[lang];
  if (!id) throw new Error(`Linguagem sem suporte no executor: ${lang}`);
  const res = await fetch(`${base}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(process.env.JUDGE0_TOKEN && { "X-Auth-Token": process.env.JUDGE0_TOKEN }) },
    body: JSON.stringify({ language_id: id, source_code: source, cpu_time_limit: 5, wall_time_limit: 15 }),
    signal: AbortSignal.timeout(40_000),
  });
  if (res.status === 429) throw new Error("O serviço de execução está com muitas requisições. Tente de novo em instantes.");
  if (!res.ok) throw new Error(`O serviço de execução respondeu ${res.status}.`);
  return (await res.json()) as Judge0Result;
}
