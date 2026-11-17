import Link from "next/link";
import { notFound } from "next/navigation";
import { chapterKey, getChapter, getCourses } from "@/lib/content";
import { renderChapter } from "@/lib/mdx";
import { ChapterReader } from "@/components/reader/ChapterReader";
import { ProblemWorkspace } from "@/components/practice/ProblemWorkspace";
import { SolutionPanel } from "@/components/practice/SolutionPanel";
import { getSolution } from "@/lib/solutions";
import { LANGS, type Lang } from "@/lib/langs";
import { TableOfContents } from "@/components/reader/TableOfContents";
import { ChapterKeyNav } from "./ChapterKeyNav";

type Params = Promise<{ course: string; chapter: string }>;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.flatMap((c) => c.modules.flatMap((m) => m.chapters.map((ch) => ({ course: c.slug, chapter: ch.slug }))));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { course, chapter } = await params;
  const ch = await getChapter(course, chapter);
  return ch ? { title: ch.title, description: ch.plainText.slice(0, 155) } : {};
}

const DIFF = {
  easy: ["Fácil", "bg-success-soft text-success"],
  medium: ["Médio", "bg-warning-soft text-warning"],
  hard: ["Difícil", "bg-danger-soft text-danger"],
} as const;
const KIND_LABEL = { lesson: "Aula", problem: "Problema", quiz: "Quiz" } as const;

export default async function ChapterPage({ params }: { params: Params }) {
  const { course, chapter } = await params;
  const ch = await getChapter(course, chapter);
  if (!ch) notFound();
  const content = ch.available ? await renderChapter(ch.source) : null;
  const key = chapterKey(course, chapter);
  const solution = ch.problem ? await getSolution(course, chapter) : null;
  const solutionNodes = solution && {
    idea: await renderChapter(solution.idea),
    complexity: await renderChapter(solution.complexity),
    codes: Object.fromEntries(
      await Promise.all(
        LANGS.filter((l) => solution.code[l]).map(async (l) => [l, await renderChapter("```" + l + "\n" + solution.code[l] + "\n```")] as const),
      ),
    ) as Partial<Record<Lang, React.ReactNode>>,
  };

  return (
    <div className="cf-chapter-grid xl:grid xl:grid-cols-[1fr_var(--cf-layout-toc-w)]">
      <main className="min-w-0 px-3 pb-16 pt-6 lg:px-8 lg:pt-8">
        {/* Card sólido (igual aos da home) para o fundo animado não atrapalhar a leitura */}
        <div className="cf-reading-card mx-auto max-w-[1100px] px-4 pb-10 pt-8 lg:px-10">
        <div className="mx-auto cf-measure">
          <p className="text-sm text-fg-subtle">
            <Link href={`/learn/${course}`} className="hover:text-accent-text">
              {ch.moduleTitle}
            </Link>
            <span aria-hidden> · </span>
            {KIND_LABEL[ch.kind]}
            {ch.available && (
              <>
                <span aria-hidden> · </span>
                {ch.readingMinutes} min de leitura
              </>
            )}
            {ch.updatedAt && (
              <>
                <span aria-hidden> · </span>
                Atualizado em{" "}
                {new Date(ch.updatedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
              </>
            )}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">{ch.title}</h1>
          {ch.difficulty && (
            <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFF[ch.difficulty][1]}`}>
              {DIFF[ch.difficulty][0]}
            </span>
          )}
        </div>

        {ch.available ? (
          <ChapterReader chapterKey={key} course={course} chapter={chapter} tutorEnabled={Boolean(process.env.ANTHROPIC_API_KEY)}>
            {content}
          </ChapterReader>
        ) : (
          <div className="cf-measure mx-auto mt-8">
            <div className="rounded-xl border border-dashed border-line-strong bg-surface-1 p-6">
              <p className="font-semibold">Capítulo em breve</p>
              <p className="mt-1 text-sm text-fg-muted">
                Este capítulo faz parte do plano do curso, mas o texto ainda não foi escrito. Para escrevê-lo, crie o arquivo{" "}
                <code className="rounded-xs bg-surface-2 px-1 font-mono text-xs">content/courses/{course}/{chapter}.mdx</code>.
              </p>
            </div>
          </div>
        )}

        {ch.problem && (
          <div className="mx-auto mt-10 max-w-[1100px]">
            <ProblemWorkspace chapterKey={key} problem={ch.problem} />
            {solutionNodes && <div className="mt-4"><SolutionPanel {...solutionNodes} /></div>}
          </div>
        )}

        {/* Fitts: cada lado é um alvo grande (card inteiro clicável); a seta antecipa a direção no hover */}
        <nav aria-label="Navegação entre capítulos" className="mx-auto mt-16 flex cf-measure justify-between gap-4 border-t border-line pt-6">
          {ch.prev ? (
            <Link
              href={`/learn/${course}/${ch.prev.slug}`}
              aria-keyshortcuts="ArrowLeft"
              title="Capítulo anterior (←)"
              className="cf-press group -ml-3 flex min-h-14 max-w-[48%] items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
            >
              {/* seta como filho direto do link: a .cf-nudge reage ao hover do card inteiro; espelhada aponta para trás */}
              <span aria-hidden className="cf-nudge -scale-x-100 text-fg-subtle group-hover:text-accent-text">→</span>
              <span className="min-w-0">
                <span className="block text-xs text-fg-subtle">Anterior</span>
                <span className="font-medium group-hover:text-accent-text">{ch.prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {ch.next && (
            <Link
              href={`/learn/${course}/${ch.next.slug}`}
              aria-keyshortcuts="ArrowRight"
              title="Próximo capítulo (→)"
              className="cf-press group -mr-3 flex min-h-14 max-w-[48%] items-center gap-2.5 rounded-lg px-3 py-2 text-right text-sm hover:bg-surface-2"
            >
              <span className="min-w-0">
                <span className="block text-xs text-fg-subtle">Próximo</span>
                <span className="font-medium group-hover:text-accent-text">{ch.next.title}</span>
              </span>
              <span aria-hidden className="cf-nudge text-fg-subtle group-hover:text-accent-text">→</span>
            </Link>
          )}
        </nav>
        <ChapterKeyNav
          prev={ch.prev ? `/learn/${course}/${ch.prev.slug}` : undefined}
          next={ch.next ? `/learn/${course}/${ch.next.slug}` : undefined}
        />
        </div>
      </main>

      {ch.available && (
        <aside className="cf-toc sticky top-header hidden h-[calc(100dvh-var(--cf-layout-header-h))] overflow-y-auto py-8 pr-4 xl:block">
          <TableOfContents items={ch.toc} />
        </aside>
      )}
    </div>
  );
}
