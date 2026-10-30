/**
 * Listas de prática por prazo de preparação. A lista curta é montada a partir do próprio curso:
 * percorre os padrões em rodízio, pegando primeiro os fáceis, depois os médios e por último os difíceis,
 * para cobrir todos os padrões antes de aprofundar em qualquer um.
 */
export interface PracticeList {
  id: string;
  title: string;
  period: string;
  description: string;
  keys: string[];
}

interface ListProblem {
  key: string;
  pattern: string;
  difficulty: "easy" | "medium" | "hard";
  available: boolean;
}

const RANK = { easy: 0, medium: 1, hard: 2 } as const;

function spread<T extends ListProblem>(problems: T[], size: number): string[] {
  const byPattern = new Map<string, T[]>();
  for (const p of problems) if (p.available) (byPattern.get(p.pattern) ?? byPattern.set(p.pattern, []).get(p.pattern)!).push(p);
  const queues = [...byPattern.values()].map((ps) => [...ps].sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]));
  const out: string[] = [];
  for (let round = 0; out.length < size && queues.some((q) => q.length > round); round++) {
    for (const q of queues) if (q[round] && out.length < size) out.push(q[round].key);
  }
  return out;
}

export function buildPracticeLists<T extends ListProblem>(problems: T[]): PracticeList[] {
  const all = problems.filter((p) => p.available).map((p) => p.key);
  return [
    {
      id: "75",
      title: "CodeForge 75",
      period: "até 1 mês",
      description: "Os problemas essenciais, cobrindo todos os padrões antes de aprofundar.",
      keys: spread(problems, 75),
    },
    {
      id: "completa",
      title: `Completa (${all.length})`,
      period: "1 a 3 meses",
      description: "Todos os problemas, na ordem do curso.",
      keys: all,
    },
  ];
}
