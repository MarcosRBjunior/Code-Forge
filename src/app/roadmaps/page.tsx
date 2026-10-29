import Link from "next/link";
import { getCourses } from "@/lib/content";

export const metadata = { title: "Roadmaps" };

/** Planos de estudo: sequências opinativas de módulos, montadas sobre os cursos existentes. */
const PLANS = [
  {
    slug: "entrevista-em-4-semanas",
    title: "Entrevista em 4 semanas",
    description: "O mínimo essencial para uma entrevista de código próxima.",
    steps: [
      ["dsa", ["estrategia", "complexidade", "hashing", "two-pointers", "sliding-window"]],
      ["dsa", ["busca-binaria", "pilhas", "listas-ligadas", "arvores"]],
      ["dsa", ["heaps", "grafos", "backtracking"]],
      ["dsa", ["programacao-dinamica"]],
      ["behavioral", ["star", "carreira", "conflito"]],
    ],
  },
  {
    slug: "entrevista-em-3-meses",
    title: "Preparação completa em 3 meses",
    description: "Algoritmos, system design e comportamental, na ordem em que um constrói sobre o outro.",
    steps: [
      ["dsa", ["estrategia", "complexidade", "arrays-strings", "strings", "hashing", "two-pointers", "sliding-window", "prefix-sum"]],
      ["dsa", ["busca-binaria", "matriz", "listas-ligadas", "pilhas", "pilha-monotonica", "filas"]],
      ["dsa", ["backtracking", "arvores", "bst", "heaps", "intervalos", "tries"]],
      ["dsa", ["guloso", "grafos", "programacao-dinamica"]],
      ["system-design", ["conceitos", "redes", "balanceamento", "apis", "cache", "bancos", "escala-bancos"]],
      ["system-design-interviews", ["introducao", "topicos-essenciais", "questoes-basicas", "questoes-tempo-real", "questoes-social"]],
      ["behavioral", ["entendendo", "star", "historias", "tecnicas"]],
    ],
  },
  {
    slug: "system-design",
    title: "System Design do zero",
    description: "Dos conceitos aos problemas de entrevista.",
    steps: [
      ["system-design", ["introducao", "conceitos", "redes", "balanceamento"]],
      ["system-design", ["apis", "comunicacao", "cache"]],
      ["system-design", ["bancos", "escala-bancos", "armazenamento"]],
      ["system-design", ["arquitetura", "microsservicos-padroes", "distribuidos", "transacoes"]],
      ["system-design-interviews", ["introducao", "topicos-essenciais", "tecnologias"]],
      ["system-design-interviews", ["questoes-basicas", "questoes-infra", "questoes-tempo-real"]],
    ],
  },
  {
    slug: "lld",
    title: "Low Level Design",
    description: "OOP, princípios, padrões e problemas de modelagem.",
    steps: [
      ["lld", ["introducao", "oop", "relacoes"]],
      ["lld", ["principios", "solid", "uml"]],
      ["lld", ["criacionais", "estruturais", "comportamentais"]],
      ["lld", ["dicas", "jogos", "estados", "gestao"]],
    ],
  },
] as const;

export default async function RoadmapsPage() {
  const courses = await getCourses();
  const byCourse = new Map(courses.map((c) => [c.slug, c]));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Roadmaps</h1>
      <p className="mt-1 text-fg-muted">Sequências de estudo prontas, montadas a partir dos cursos. Cada etapa é aproximadamente uma a duas semanas.</p>
      <div className="mt-8 space-y-10">
        {PLANS.map((plan) => (
          <section key={plan.slug} id={plan.slug} className="rounded-xl border border-line bg-surface-1 p-5">
            <h2 className="text-xl font-semibold">{plan.title}</h2>
            <p className="mt-1 text-sm text-fg-muted">{plan.description}</p>
            <ol className="mt-5 space-y-4 border-l-2 border-line pl-6">
              {plan.steps.map(([courseSlug, moduleSlugs], i) => {
                const course = byCourse.get(courseSlug);
                if (!course) return null;
                const mods = moduleSlugs.map((m) => course.modules.find((x) => x.slug === m)).filter((m) => m !== undefined);
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[2.15rem] grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-fg-on-accent">
                      {i + 1}
                    </span>
                    <p className="text-xs uppercase tracking-wide text-fg-subtle">{course.title}</p>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {mods.map((m) => {
                        const first = m.chapters.find((c) => c.available) ?? m.chapters[0];
                        const written = m.chapters.filter((c) => c.available).length;
                        return (
                          <li key={m.slug}>
                            <Link
                              href={`/learn/${course.slug}/${first.slug}`}
                              className="inline-block rounded-full border border-line px-3 py-1 text-sm hover:border-accent hover:bg-accent-soft"
                            >
                              {m.title}
                              <span className="ml-1.5 text-xs tabular-nums text-fg-subtle">{written}/{m.chapters.length}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
