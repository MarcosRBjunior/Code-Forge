import { notFound } from "next/navigation";
import { getCourse } from "@/lib/content";
import { CourseSidebar } from "@/components/CourseSidebar";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  return (
    <div className="cf-course-grid lg:grid lg:grid-cols-[var(--cf-layout-sidebar-w)_1fr]">
      <CourseSidebar
        course={{ slug: course.slug, title: course.title }}
        modules={course.modules.map((m) => ({
          slug: m.slug,
          title: m.title,
          chapters: m.chapters.map((c) => ({ slug: c.slug, title: c.title, kind: c.kind, available: c.available })),
        }))}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
