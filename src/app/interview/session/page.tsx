import { getAllChapters } from "@/lib/content";
import { InterviewRoom } from "@/components/interview/InterviewRoom";

export const metadata = { title: "Entrevista em andamento" };

export default async function InterviewSessionPage() {
  const pool = (await getAllChapters())
    .filter((c) => c.kind === "problem" && c.available && c.difficulty)
    .map((c) => ({ course: c.course, slug: c.slug, title: c.title, difficulty: c.difficulty! }));
  return <InterviewRoom pool={pool} />;
}
