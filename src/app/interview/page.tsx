import { getAllChapters } from "@/lib/content";
import { InterviewSetup } from "@/components/interview/InterviewSetup";

export const metadata = { title: "Mock interview" };

export default async function InterviewPage() {
  const problems = (await getAllChapters()).filter((c) => c.kind === "problem" && c.available);
  const counts = {
    easy: problems.filter((p) => p.difficulty === "easy").length,
    medium: problems.filter((p) => p.difficulty === "medium").length,
    hard: problems.filter((p) => p.difficulty === "hard").length,
  };
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Mock interview de código</h1>
      <p className="mt-1 text-fg-muted">
        Uma entrevista cronometrada com problemas sorteados. No fim, você se avalia na mesma rubrica usada pelos entrevistadores e
        recebe uma nota de 0 a 100.
      </p>
      <InterviewSetup counts={counts} />
    </main>
  );
}
