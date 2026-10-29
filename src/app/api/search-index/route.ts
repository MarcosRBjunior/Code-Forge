import { NextResponse } from "next/server";
import { getChapter, getCourses } from "@/lib/content";

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
  const docs: SearchDoc[] = [];
  for (const c of courses) {
    for (const m of c.modules) {
      for (const ch of m.chapters) {
        const full = ch.available ? await getChapter(c.slug, ch.slug) : null;
        docs.push({
          course: c.slug,
          courseTitle: c.title,
          slug: ch.slug,
          title: ch.title,
          module: m.title,
          kind: ch.kind,
          available: ch.available,
          text: full ? full.plainText.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").slice(0, 6000) : "",
        });
      }
    }
  }
  return NextResponse.json(docs);
}
