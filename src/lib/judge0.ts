import "server-only";
import type { Lang } from "@/lib/langs";

/** Ids das linguagens no Judge0 CE (https://ce.judge0.com/languages). */
const LANGUAGE_ID: Partial<Record<Lang, number>> = { java: 91, cpp: 105, csharp: 51, go: 107, typescript: 101 };

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
  // O serviço público às vezes estoura o tempo só de compilar (principalmente Go, sem cache); tentar de novo costuma resolver.
  let result = await submit(lang, source);
  for (let attempt = 1; attempt <= 3 && result.status.id === 6 && /time limit exceeded/i.test(result.compile_output ?? ""); attempt++) {
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    result = await submit(lang, source);
  }
  return result;
}

async function submit(lang: Lang, source: string): Promise<Judge0Result> {
  const base = (process.env.JUDGE0_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
  const id = LANGUAGE_ID[lang];
  if (!id) throw new Error(`Linguagem sem suporte no executor: ${lang}`);
  // base64 nos dois sentidos: em texto puro o serviço recusa (HTTP 400) código ou saída com acentos.
  const res = await fetch(`${base}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(process.env.JUDGE0_TOKEN && { "X-Auth-Token": process.env.JUDGE0_TOKEN }) },
    body: JSON.stringify({ language_id: id, source_code: Buffer.from(source, "utf8").toString("base64"), cpu_time_limit: 5, wall_time_limit: 15 }),
    signal: AbortSignal.timeout(40_000),
  });
  if (res.status === 429) throw new Error("O serviço de execução está com muitas requisições. Tente de novo em instantes.");
  if (!res.ok) throw new Error(`O serviço de execução respondeu ${res.status}.`);
  const raw = (await res.json()) as Judge0Result;
  const text = (v: string | null) => (v == null ? null : Buffer.from(v, "base64").toString("utf8"));
  return { ...raw, stdout: text(raw.stdout), stderr: text(raw.stderr), compile_output: text(raw.compile_output), message: text(raw.message) };
}
