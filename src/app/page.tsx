import Link from "next/link";
import { getCourses } from "@/lib/content";
import { CourseProgressBar } from "@/components/CourseProgressBar";
import { ResumeStrip } from "@/components/Dashboard";
import { COURSE_GROUPS } from "@/lib/course-groups";

export default async function HomePage() {
  const courses = await getCourses();
  // Só capítulos escritos: são os únicos que podem aparecer como "continuar de onde parou".
  const titles = Object.fromEntries(
    courses.flatMap((c) => c.modules.flatMap((m) => m.chapters.filter((ch) => ch.available).map((ch) => [`${c.slug}/${ch.slug}`, ch.title]))),
  );
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Seus cursos</h1>
      <p className="mt-2 text-fg-muted">Aprenda o padrão, pratique no editor e revise no caderno.</p>
      {/* Frequência de uso: retomar, revisar e praticar ficam acima da lista de cursos */}
      <ResumeStrip titles={titles} courseTitles={courseTitles} />
      {COURSE_GROUPS.map((g) => {
        const inGroup = courses.filter((c) => c.group === g.id);
        if (!inGroup.length) return null;
        return (
          <section key={g.id} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">{g.title}</h2>
            {/* Follow through: os cards chegam em cascata; o volume (cf-lift) fica no filho para não brigar com a animação */}
            <ul className="cf-stagger mt-4 grid gap-4 sm:grid-cols-2">
              {inGroup.map((c) => {
                const first = c.modules.flatMap((m) => m.chapters).find((ch) => ch.available);
                return (
                  <li key={c.slug} className="flex">
                    <div className="cf-lift flex flex-1 flex-col rounded-xl border border-line bg-surface-1 p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{c.level}</p>
                      <h3 className="mt-1 text-lg font-semibold">{c.title}</h3>
                      <p className="mt-1.5 flex-1 text-sm text-fg-muted">{c.description}</p>
                      <p className="mt-3 text-xs text-fg-subtle">
                        {c.modules.length} módulos · {c.availableCount}/{c.chapterCount} capítulos escritos
                      </p>
                      <CourseProgressBar course={c.slug} total={c.availableCount} />
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={first ? `/learn/${c.slug}/${first.slug}` : `/learn/${c.slug}`}
                          className="cf-press inline-flex min-h-10 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-fg-on-accent hover:bg-accent-hover"
                        >
                          Estudar <span aria-hidden className="cf-nudge">→</span>
                        </Link>
                        <Link
                          href={`/learn/${c.slug}`}
                          className="cf-press inline-flex min-h-10 items-center rounded-md border border-line px-3.5 py-2 text-sm hover:bg-surface-2"
                        >
                          Ver conteúdo
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
