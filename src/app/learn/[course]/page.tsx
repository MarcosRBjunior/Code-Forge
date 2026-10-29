import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/content";
import { CourseProgressBar } from "@/components/CourseProgressBar";

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const course = await getCourse((await params).course);
  return course ? { title: course.title, description: course.description } : {};
}

const KIND_LABEL = { lesson: "Aula", problem: "Problema", quiz: "Quiz" } as const;
const DIFF = {
  easy: ["Fácil", "text-success"],
  medium: ["Médio", "text-warning"],
  hard: ["Difícil", "text-danger"],
} as const;

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const course = await getCourse((await params).course);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{course.level}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mt-2 text-fg-muted">{course.description}</p>
      <CourseProgressBar course={course.slug} total={course.availableCount} />
      <p className="mt-1 text-xs text-fg-subtle">
        {course.availableCount} de {course.chapterCount} capítulos escritos · os demais aparecem como “em breve”
      </p>
      <div className="mt-6 flex gap-2">
        <Link href={`/notebook/${course.slug}`} className="rounded-md border border-line px-3.5 py-2 text-sm hover:bg-surface-2">
          Abrir caderno
        </Link>
      </div>

      <ol className="mt-10 space-y-8">
        {course.modules.map((m, i) => (
          <li key={m.slug}>
            <h2 className="text-lg font-semibold">
              <span className="mr-2 tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              {m.title}
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface-1">
              {m.chapters.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/learn/${course.slug}/${c.slug}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2"
                  >
                    <span className="w-16 shrink-0 text-xs text-fg-subtle">{KIND_LABEL[c.kind]}</span>
                    <span className={`flex-1 ${c.available ? "" : "text-fg-subtle"}`}>{c.title}</span>
                    {!c.available && <span className="text-[10px] uppercase tracking-wide text-fg-subtle">em breve</span>}
                    {c.difficulty && <span className={`text-xs font-medium ${DIFF[c.difficulty][1]}`}>{DIFF[c.difficulty][0]}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
