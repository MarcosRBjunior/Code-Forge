import { NextResponse } from "next/server";
import { getCourses, getPlainText } from "@/lib/content";

// Gerado no build: o índice só muda quando o conteúdo muda (novo deploy).
export const dynamic = "force-static";

export interface SearchDoc {
  course: string;
  courseTitle: string;
  slug: string;
  title: string;
  module: string;
  kind: "lesson" | "problem" | "quiz";
  available: boolean;
  text: string;
}

export async function GET() {
  const courses = await getCourses();
  const docs = await Promise.all(
    courses.flatMap((c) =>
      c.modules.flatMap((m) =>
        m.chapters.map(async (ch): Promise<SearchDoc> => {
          const plain = ch.available ? await getPlainText(c.slug, ch.slug) : "";
          return {
            course: c.slug,
            courseTitle: c.title,
            slug: ch.slug,
            title: ch.title,
            module: m.title,
            kind: ch.kind,
            available: ch.available,
            text: plain.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").slice(0, 6000),
          };
        }),
      ),
    ),
  );
  return NextResponse.json(docs);
}
