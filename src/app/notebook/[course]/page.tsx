import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/content";
import { Notebook } from "@/components/Notebook";

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ course: c.slug }));
}

export const metadata = { title: "Caderno" };

export default async function NotebookPage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const [course, courses] = await Promise.all([getCourse(slug), getCourses()]);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap gap-2 text-sm">
        {courses.map((c) => (
          <Link
            key={c.slug}
            href={`/notebook/${c.slug}`}
            aria-current={c.slug === slug ? "page" : undefined}
            className="rounded-full border border-line px-3 py-1 text-fg-muted hover:bg-surface-2 current:border-accent current:bg-accent-soft current:text-fg"
          >
            {c.title}
          </Link>
        ))}
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Caderno</h1>
      <p className="mt-1 text-fg-muted">Destaques e notas de {course.title}.</p>
      <Notebook
        course={course.slug}
        courseTitle={course.title}
        chapters={course.modules.flatMap((m) => m.chapters.map((c) => ({ slug: c.slug, title: c.title, module: m.title })))}
      />
    </main>
  );
}
