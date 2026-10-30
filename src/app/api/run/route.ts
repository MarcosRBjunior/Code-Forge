import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, ChapterKey, parseBody } from "@/lib/api";
import { getChapter } from "@/lib/content";
import { buildProgram, parseOutput, userLineOffset } from "@/lib/harness";
import { runOnJudge0 } from "@/lib/judge0";
import { inferSignature, REMOTE_LANGS, type ProblemShape } from "@/lib/langs";
import type { CaseResult, RunOutcome } from "@/components/practice/runner";

export const dynamic = "force-dynamic";

const RunBody = z.object({
  key: ChapterKey,
  language: z.enum(REMOTE_LANGS as [string, ...string[]]),
  code: z.string().min(1).max(65536),
});

const norm = (v: unknown, deep: boolean): unknown =>
  Array.isArray(v)
    ? v
        .map((x) => (deep ? norm(x, deep) : x))
        .sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0))
    : v;

/** Os erros do compilador contam as linhas de preparação; desconta-as para bater com o editor. */
const fixLines = (msg: string, offset: number) =>
  msg.replace(/(\.(?:java|cpp|cs|go)[:(])(\d+)/g, (m, pre: string, n: string) => (Number(n) > offset ? `${pre}${Number(n) - offset}` : m));

/** POST /api/run — compila e roda o código num serviço externo (Judge0) contra os testes do problema. */
export async function POST(req: Request) {
  const body = await parseBody(req, RunBody);
  if (body instanceof NextResponse) return body;

  const [course, slug] = body.key.split("/");
  const chapter = await getChapter(course, slug);
  const problem = chapter?.problem;
  if (!chapter || !problem) return apiError(404, "NOT_FOUND", "Problema não encontrado.");

  const shape = { ...problem, starter: problem.starter } as unknown as ProblemShape;
  const sig = inferSignature(shape);
  if (!sig) return apiError(422, "UNSUPPORTED", "Este problema (listas ligadas, árvores ou design de classes) só pode ser resolvido em Python, JavaScript e TypeScript.");

  const lang = body.language as "java" | "cpp" | "csharp" | "go";
  let outcome: RunOutcome;
  try {
    const program = buildProgram(lang, body.code, shape, sig);
    const offset = userLineOffset(program);
    const res = await runOnJudge0(lang, program);
    const id = res.status.id;
    if (id === 6) {
      outcome = { kind: "compile_error", message: fixLines((res.compile_output ?? res.message ?? "Erro de compilação.").trim().slice(0, 4000), offset) };
    } else if (id === 5) {
      outcome = { kind: "timeout" };
    } else if (id === 13 || id === 14) {
      outcome = { kind: "error", message: res.message ?? "Erro interno do serviço de execução." };
    } else {
      const parsed = parseOutput(res.stdout ?? "", problem.tests.length);
      const crash = (res.stderr ?? res.message ?? "").trim().slice(0, 1500);
      const deep = problem.compare === "unordered-deep";
      const same = (a: unknown, b: unknown) =>
        (problem.compare ?? "exact") === "exact" ? JSON.stringify(a) === JSON.stringify(b) : JSON.stringify(norm(a, deep)) === JSON.stringify(norm(b, deep));
      const cases: CaseResult[] = problem.tests.map((t, i) => {
        const p = parsed[i];
        if (!p) return { ok: false, actual: null, error: crash || "O programa terminou antes deste teste.", stdout: "", ms: 0 };
        if (p.kind === "error") return { ok: false, actual: null, error: p.text, stdout: p.stdout, ms: 0 };
        let actual: unknown = null;
        try {
          actual = JSON.parse(p.text);
        } catch {
          return { ok: false, actual: p.text, error: "Saída ilegível.", stdout: p.stdout, ms: 0 };
        }
        return { ok: same(actual, t.expected), actual, error: null, stdout: p.stdout, ms: 0 };
      });
      outcome = { kind: "done", cases };
    }
  } catch (err) {
    outcome = { kind: "error", message: (err as Error).message };
  }
  return NextResponse.json(outcome);
}
