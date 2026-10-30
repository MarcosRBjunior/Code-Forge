import type { Lang } from "@/lib/langs";

/**
 * Formato de content/solutions/<curso>/<problema>.md:
 *
 *   ## Ideia            (texto em Markdown)
 *   ## Complexidade     (texto curto)
 *   ## Python           (um bloco de código; idem JavaScript, TypeScript, Java, C++, C#, Go)
 */
export interface ParsedSolution {
  idea: string;
  complexity: string;
  code: Partial<Record<Lang, string>>;
}

const HEADING_LANG: Record<string, Lang> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  "c++": "cpp",
  "c#": "csharp",
  go: "go",
};

export function parseSolution(md: string): ParsedSolution {
  const out: ParsedSolution = { idea: "", complexity: "", code: {} };
  for (const section of md.replace(/\r\n/g, "\n").split(/^## /m).slice(1)) {
    const nl = section.indexOf("\n");
    const title = (nl === -1 ? section : section.slice(0, nl)).trim().toLowerCase();
    const body = nl === -1 ? "" : section.slice(nl + 1).trim();
    if (title === "ideia") out.idea = body;
    else if (title === "complexidade") out.complexity = body;
    else if (HEADING_LANG[title]) {
      const m = /```[\w+#]*\n([\s\S]*?)\n```/.exec(body);
      if (m) out.code[HEADING_LANG[title]] = m[1];
    }
  }
  return out;
}
