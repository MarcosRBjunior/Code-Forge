import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { parseSolution, type ParsedSolution } from "@/lib/solutions-parse";

const SOLUTIONS_DIR = path.join(process.cwd(), "content", "solutions");

/** Solução de referência de um problema, ou null se ainda não foi escrita. */
export async function getSolution(course: string, slug: string): Promise<ParsedSolution | null> {
  if (!/^[a-z0-9-]+$/.test(course) || !/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return parseSolution(await fs.readFile(path.join(SOLUTIONS_DIR, course, `${slug}.md`), "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
