import { NextResponse } from "next/server";
import { getCoursesWithContent, toSearchText } from "@/lib/content";

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
  const loaded = await getCoursesWithContent();
  const docs: SearchDoc[] = loaded.flatMap(({ course: c, contents }) =>
    c.modules.flatMap((m) =>
      m.chapters.map((ch) => ({
        course: c.slug,
        courseTitle: c.title,
        slug: ch.slug,
        title: ch.title,
        module: m.title,
        kind: ch.kind,
        available: ch.available,
        text: toSearchText(contents.get(ch.slug) ?? ""),
      })),
    ),
  );
  return NextResponse.json(docs);
}
