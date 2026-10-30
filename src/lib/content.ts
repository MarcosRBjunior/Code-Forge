import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const CONTENT_DIR = path.join(process.cwd(), "content", "courses");

export type ChapterKind = "lesson" | "problem" | "quiz";
export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemTest {
  input: unknown[];
  expected: unknown;
}

export interface ProblemSpec {
  difficulty: Difficulty;
  fn: string;
  fnJs: string;
  /** Índice do argumento verificado em problemas in-place (a função não retorna nada). */
  checkArg?: number;
  /** "unordered": a ordem dos itens da resposta não importa (ex.: subconjuntos). */
  compare?: "exact" | "unordered" | "unordered-deep";
  /** Conversões de argumentos/retorno: linkedlist, cyclelist, tree, treenode (ver runner.ts). */
  argTypes?: Array<"linkedlist" | "cyclelist" | "tree" | "treenode" | null>;
  returnType?: "linkedlist" | "cyclelist" | "tree" | "treenode" | null;
  /** Problema de design de classe: testes no formato [operações, argumentos]. */
  design?: boolean;
  starter: { python: string; javascript: string };
  tests: ProblemTest[];
}

export interface ChapterMeta {
  course: string;
  slug: string;
  title: string;
  kind: ChapterKind;
  difficulty?: Difficulty;
  moduleSlug: string;
  moduleTitle: string;
  /** false = capítulo planejado, ainda sem texto (aparece como "em breve"). */
  available: boolean;
}

export interface CourseModule {
  slug: string;
  title: string;
  chapters: ChapterMeta[];
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  level: string;
  order: number;
  modules: CourseModule[];
  chapterCount: number;
  availableCount: number;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Chapter extends ChapterMeta {
  source: string;
  /** Data da última modificação do arquivo (ISO). */
  updatedAt: string | null;
  plainText: string;
  readingMinutes: number;
  toc: TocItem[];
  problem?: ProblemSpec;
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
}

interface CourseFile {
  slug: string;
  order?: number;
  title: string;
  description: string;
  level: string;
  /** Cada capítulo é o slug de um .mdx existente ou a declaração de um capítulo planejado. */
  modules: Array<{
    slug: string;
    title: string;
    chapters: Array<string | { slug: string; title: string; kind?: ChapterKind; difficulty?: Difficulty }>;
  }>;
}

async function readChapterFile(course: string, slug: string) {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, course, `${slug}.mdx`), "utf8");
    return matter(raw);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export const getCourse = cache(async (slug: string): Promise<Course | null> => {
  let file: CourseFile;
  try {
    file = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, slug, "course.json"), "utf8"));
  } catch {
    return null;
  }
  const modules: CourseModule[] = [];
  for (const mod of file.modules) {
    const chapters: ChapterMeta[] = [];
    for (const entry of mod.chapters) {
      const declared = typeof entry === "string" ? { slug: entry } : entry;
      const file = await readChapterFile(slug, declared.slug);
      if (!file && !("title" in declared)) {
        throw new Error(`content/courses/${slug}: capítulo "${declared.slug}" não tem .mdx nem título declarado`);
      }
      const data = file?.data ?? {};
      chapters.push({
        course: slug,
        slug: declared.slug,
        title: data.title ?? (declared as { title: string }).title,
        kind: data.kind ?? (declared as { kind?: ChapterKind }).kind ?? "lesson",
        difficulty: data.difficulty ?? (declared as { difficulty?: Difficulty }).difficulty,
        moduleSlug: mod.slug,
        moduleTitle: mod.title,
        available: file !== null,
      });
    }
    modules.push({ slug: mod.slug, title: mod.title, chapters });
  }
  return {
    slug: file.slug,
    title: file.title,
    description: file.description,
    level: file.level,
    order: file.order ?? 99,
    modules,
    chapterCount: modules.reduce((n, m) => n + m.chapters.length, 0),
    availableCount: modules.reduce((n, m) => n + m.chapters.filter((c) => c.available).length, 0),
  };
});

export const getCourses = cache(async (): Promise<Course[]> => {
  const dirs = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const courses = await Promise.all(dirs.filter((d) => d.isDirectory()).map((d) => getCourse(d.name)));
  return courses.filter((c): c is Course => c !== null).sort((a, b) => a.order - b.order);
});

/** Texto corrido do MDX, usado pelo tutor de IA e para estimar o tempo de leitura. */
function toPlainText(source: string): string {
  return source
    .replace(/<[A-Z][\s\S]*?\/>/g, "")
    .replace(/<\/?[A-Z][^>]*>/g, "")
    .replace(/[#*`|>]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Só o texto corrido de um capítulo, sem montar o curso inteiro (usado pelo índice de busca). */
export async function getPlainText(course: string, slug: string): Promise<string> {
  const file = await readChapterFile(course, slug);
  return file ? toPlainText(file.content) : "";
}

function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(##|###)\s+(.+)$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*`]/g, "").trim();
      toc.push({ id: slugger.slug(text), text, depth: m[1].length as 2 | 3 });
    }
  }
  return toc;
}

export const getChapter = cache(async (course: string, slug: string): Promise<Chapter | null> => {
  const c = await getCourse(course);
  if (!c) return null;
  const flat = c.modules.flatMap((m) => m.chapters);
  const index = flat.findIndex((ch) => ch.slug === slug);
  if (index === -1) return null;

  const file = await readChapterFile(course, slug);
  const stat = file ? await fs.stat(path.join(CONTENT_DIR, course, `${slug}.mdx`)) : null;
  const data = file?.data ?? {};
  const content = file?.content ?? "";
  const plainText = toPlainText(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;

  return {
    ...flat[index],
    source: content,
    updatedAt: stat ? stat.mtime.toISOString() : null,
    plainText,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    toc: extractToc(content),
    problem:
      data.kind === "problem"
        ? {
            difficulty: data.difficulty,
            fn: data.fn,
            fnJs: data.fnJs,
            checkArg: data.checkArg,
            compare: data.compare,
            argTypes: data.argTypes,
            returnType: data.returnType,
            design: data.design,
            starter: data.starter,
            tests: data.tests,
          }
        : undefined,
    prev: flat[index - 1] ?? null,
    next: flat[index + 1] ?? null,
  };
});

export function chapterKey(course: string, slug: string) {
  return `${course}/${slug}`;
}

/** Todos os capítulos de todos os cursos (prática, busca, painel). */
export const getAllChapters = cache(async (): Promise<ChapterMeta[]> => {
  const courses = await getCourses();
  return courses.flatMap((c) => c.modules.flatMap((m) => m.chapters));
});
