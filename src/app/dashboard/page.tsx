import { getAllChapters, getCourses } from "@/lib/content";
import { Dashboard } from "@/components/Dashboard";

export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const [courses, chapters] = await Promise.all([getCourses(), getAllChapters()]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Painel</h1>
      <Dashboard
        courses={courses.map((c) => ({ slug: c.slug, title: c.title, total: c.availableCount }))}
        titles={Object.fromEntries(chapters.map((c) => [`${c.course}/${c.slug}`, c.title]))}
      />
    </main>
  );
}
