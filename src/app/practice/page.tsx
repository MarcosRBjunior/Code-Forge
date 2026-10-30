import { Suspense } from "react";
import { getAllChapters, getCourses } from "@/lib/content";
import { PracticeTable, type PracticeProblem } from "@/components/PracticeTable";
import { buildPracticeLists } from "@/lib/practice-lists";

export const metadata = { title: "Prática" };

export default async function PracticePage() {
  const [chapters, courses] = await Promise.all([getAllChapters(), getCourses()]);
  const courseTitle = new Map(courses.map((c) => [c.slug, c.title]));
  const problems: PracticeProblem[] = chapters
    .filter((c) => c.kind === "problem")
    .map((c) => ({
      key: `${c.course}/${c.slug}`,
      course: c.course,
      courseTitle: courseTitle.get(c.course) ?? c.course,
      slug: c.slug,
      title: c.title,
      pattern: c.moduleTitle,
      difficulty: c.difficulty ?? "medium",
      available: c.available,
    }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Prática</h1>
      <p className="mt-1 text-fg-muted">Escolha uma lista conforme o tempo que você tem até a entrevista, ou filtre por padrão e dificuldade.</p>
      <Suspense>
        <PracticeTable problems={problems} lists={buildPracticeLists(problems)} />
      </Suspense>
    </main>
  );
}
