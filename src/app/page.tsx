import Link from "next/link";
import { getCourses } from "@/lib/content";
import { CourseProgressBar } from "@/components/CourseProgressBar";

export default async function HomePage() {
  const courses = await getCourses();
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Seus cursos</h1>
      <p className="mt-2 text-fg-muted">Aprenda o padrão, pratique no editor e revise no caderno.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {courses.map((c) => {
          const first = c.modules.flatMap((m) => m.chapters).find((ch) => ch.available);
          return (
            <li key={c.slug} className="flex flex-col rounded-xl border border-line bg-surface-1 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{c.level}</p>
              <h2 className="mt-1 text-lg font-semibold">{c.title}</h2>
              <p className="mt-1.5 flex-1 text-sm text-fg-muted">{c.description}</p>
              <p className="mt-3 text-xs text-fg-subtle">
                {c.modules.length} módulos · {c.availableCount}/{c.chapterCount} capítulos escritos
              </p>
              <CourseProgressBar course={c.slug} total={c.availableCount} />
              <div className="mt-4 flex gap-2">
                <Link
                  href={first ? `/learn/${c.slug}/${first.slug}` : `/learn/${c.slug}`}
                  className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-fg-on-accent hover:bg-accent-hover"
                >
                  Estudar
                </Link>
                <Link href={`/learn/${c.slug}`} className="rounded-md border border-line px-3.5 py-2 text-sm hover:bg-surface-2">
                  Ver conteúdo
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
