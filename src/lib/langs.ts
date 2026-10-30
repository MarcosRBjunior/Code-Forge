/**
 * Linguagens do editor de prática e geração de código inicial para as que não vêm escritas
 * no problema (TypeScript, Java, C++, C# e Go). Os tipos saem dos próprios casos de teste.
 * Módulo puro: usado no navegador (código inicial) e no servidor (programa de teste).
 */
export type Lang = "python" | "javascript" | "typescript" | "java" | "cpp" | "csharp" | "go";

export const LANGS: Lang[] = ["python", "javascript", "typescript", "java", "cpp", "csharp", "go"];

export const LANG_LABEL: Record<Lang, string> = {
  python: "Python 3",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
};

/** Linguagens executadas no servidor externo (as demais rodam no navegador). */
export const REMOTE_LANGS: Lang[] = ["java", "cpp", "csharp", "go"];

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as string[]).includes(v);
}

export type Ty =
  | { k: "int" | "long" | "double" | "bool" | "string" | "unknown" }
  | { k: "arr"; of: Ty };

export interface Signature {
  params: Ty[];
  /** null = a função não devolve nada e altera um argumento no lugar (checkArg). */
  ret: Ty | null;
}

/** Subconjunto do problema de que este módulo precisa. */
export interface ProblemShape {
  fn: string;
  fnJs: string;
  checkArg?: number;
  argTypes?: Array<string | null>;
  returnType?: string | null;
  design?: boolean;
  starter: { python: string; javascript: string };
  tests: Array<{ input: unknown[]; expected: unknown }>;
}

const INT_MAX = 2147483647;

function infer(v: unknown): Ty {
  if (typeof v === "boolean") return { k: "bool" };
  if (typeof v === "string") return { k: "string" };
  if (typeof v === "number") {
    if (!Number.isInteger(v)) return { k: "double" };
    return { k: Math.abs(v) > INT_MAX ? "long" : "int" };
  }
  if (Array.isArray(v)) return { k: "arr", of: v.reduce<Ty>((acc, x) => unify(acc, infer(x)), { k: "unknown" }) };
  throw new Error("tipo não suportado");
}

function unify(a: Ty, b: Ty): Ty {
  if (a.k === "unknown") return b;
  if (b.k === "unknown") return a;
  if (a.k === "arr" && b.k === "arr") return { k: "arr", of: unify(a.of, b.of) };
  if (a.k === "arr" || b.k === "arr") throw new Error("tipos incompatíveis");
  if (a.k === b.k) return a;
  const num = ["int", "long", "double"];
  if (num.includes(a.k) && num.includes(b.k)) return { k: a.k === "double" || b.k === "double" ? "double" : "long" };
  throw new Error("tipos incompatíveis");
}

function settle(t: Ty): Ty {
  if (t.k === "unknown") return { k: "int" };
  return t.k === "arr" ? { k: "arr", of: settle(t.of) } : t;
}

/**
 * Assinatura da função deduzida dos testes, ou null se o problema não cabe no modelo
 * (listas ligadas, árvores, design de classes, valores nulos).
 */
export function inferSignature(p: ProblemShape): Signature | null {
  if (p.design || p.returnType || (p.argTypes ?? []).some(Boolean) || !p.tests.length) return null;
  try {
    const arity = p.tests[0].input.length;
    if (p.tests.some((t) => t.input.length !== arity)) return null;
    const params: Ty[] = Array.from({ length: arity }, (_, i) =>
      settle(p.tests.reduce<Ty>((acc, t) => unify(acc, infer(t.input[i])), { k: "unknown" })),
    );
    const inPlace = (p.checkArg ?? -1) >= 0;
    const ret = inPlace ? null : settle(p.tests.reduce<Ty>((acc, t) => unify(acc, infer(t.expected)), { k: "unknown" }));
    return { params, ret };
  } catch {
    return null;
  }
}

export function supportedLangs(p: ProblemShape): Lang[] {
  return inferSignature(p) ? LANGS : ["python", "javascript", "typescript"];
}

// ---------- nomes ----------

export const pascal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function paramNames(p: ProblemShape, n: number): string[] {
  const m = /\(([^)]*)\)/.exec(p.starter.python);
  const names = m ? m[1].split(",").map((s) => s.trim().replace(/[^A-Za-z0-9_].*$/, "")).filter(Boolean) : [];
  const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return Array.from({ length: n }, (_, i) => camel(names[i] ?? `arg${i}`));
}

function typeName(lang: Lang, t: Ty): string {
  if (t.k === "arr") {
    const inner = typeName(lang, t.of);
    return lang === "cpp" ? `vector<${inner}>` : lang === "go" ? `[]${inner}` : `${inner}[]`;
  }
  const table: Record<string, Record<string, string>> = {
    typescript: { int: "number", long: "number", double: "number", bool: "boolean", string: "string" },
    java: { int: "int", long: "long", double: "double", bool: "boolean", string: "String" },
    cpp: { int: "int", long: "long long", double: "double", bool: "bool", string: "string" },
    csharp: { int: "int", long: "long", double: "double", bool: "bool", string: "string" },
    go: { int: "int", long: "int64", double: "float64", bool: "bool", string: "string" },
  };
  return table[lang][t.k];
}

export { typeName };

// ---------- literais ----------

function escapeJsonish(s: string, lang: Lang): string {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (c >= 0x20 && c < 0x7f) out += ch;
    else if (lang === "cpp") {
      for (const byte of new TextEncoder().encode(ch)) out += "\\" + byte.toString(8).padStart(3, "0");
    } else if (c > 0xffff) {
      out += lang === "go" ? `\\U${c.toString(16).padStart(8, "0")}` : [...ch].map((_, i) => `\\u${ch.charCodeAt(i).toString(16).padStart(4, "0")}`).join("");
    } else out += `\\u${c.toString(16).padStart(4, "0")}`;
  }
  return `"${out}"`;
}

export function literal(lang: Lang, t: Ty, v: unknown): string {
  switch (t.k) {
    case "int":
      return String(v);
    case "long":
      return `${v}${lang === "java" || lang === "csharp" ? "L" : lang === "cpp" ? "LL" : ""}`;
    case "double": {
      const n = v as number;
      return Number.isInteger(n) ? `${n}.0` : String(n);
    }
    case "bool":
      return v ? "true" : "false";
    case "string":
      return escapeJsonish(v as string, lang);
    case "arr": {
      const items = (v as unknown[]).map((x) => literal(lang, t.of, x)).join(", ");
      const name = typeName(lang, t);
      return lang === "java" || lang === "csharp" ? `new ${name}{${items}}` : `${name}{${items}}`;
    }
    default:
      throw new Error("tipo desconhecido");
  }
}

// ---------- código inicial ----------

function hint(p: ProblemShape): string {
  const m = /\/\/\s*(.+)/.exec(p.starter.javascript);
  return m ? m[1].trim() : "Escreva sua solução aqui.";
}

function defaultReturn(lang: Lang, t: Ty): string {
  if (t.k === "arr") return lang === "java" ? "null" : lang === "csharp" ? "null" : lang === "go" ? "nil" : "{}";
  if (t.k === "bool") return "false";
  if (t.k === "string") return lang === "java" || lang === "csharp" ? "null" : '""';
  if (t.k === "double") return lang === "go" ? "0" : "0.0";
  return "0";
}

export function buildStarter(lang: Exclude<Lang, "python" | "javascript">, p: ProblemShape): string | null {
  const sig = inferSignature(p);
  if (!sig) return null;
  const names = paramNames(p, sig.params.length);
  const note = hint(p);
  const name = p.fnJs;

  if (lang === "typescript") {
    const args = sig.params.map((t, i) => `${names[i]}: ${typeName("typescript", t)}`).join(", ");
    const ret = sig.ret ? typeName("typescript", sig.ret) : "void";
    return `function ${name}(${args}): ${ret} {\n  // ${note}\n}\n`;
  }
  if (lang === "java") {
    const args = sig.params.map((t, i) => `${typeName("java", t)} ${names[i]}`).join(", ");
    const ret = sig.ret ? typeName("java", sig.ret) : "void";
    const body = sig.ret ? `\n        return ${defaultReturn("java", sig.ret)};` : "";
    return `class Solution {\n    public ${ret} ${name}(${args}) {\n        // ${note}${body}\n    }\n}\n`;
  }
  if (lang === "cpp") {
    const args = sig.params.map((t, i) => `${typeName("cpp", t)}${t.k === "arr" ? "&" : ""} ${names[i]}`).join(", ");
    const ret = sig.ret ? typeName("cpp", sig.ret) : "void";
    const body = sig.ret ? `\n        return ${defaultReturn("cpp", sig.ret)};` : "";
    return `class Solution {\npublic:\n    ${ret} ${name}(${args}) {\n        // ${note}${body}\n    }\n};\n`;
  }
  if (lang === "csharp") {
    const args = sig.params.map((t, i) => `${typeName("csharp", t)} ${names[i]}`).join(", ");
    const ret = sig.ret ? typeName("csharp", sig.ret) : "void";
    const body = sig.ret ? `\n        return ${defaultReturn("csharp", sig.ret)};` : "";
    return `public class Solution {\n    public ${ret} ${pascal(name)}(${args}) {\n        // ${note}${body}\n    }\n}\n`;
  }
  const args = sig.params.map((t, i) => `${names[i]} ${typeName("go", t)}`).join(", ");
  const ret = sig.ret ? ` ${typeName("go", sig.ret)}` : "";
  const body = sig.ret ? `\n\treturn ${defaultReturn("go", sig.ret)}` : "";
  return `func ${name}(${args})${ret} {\n\t// ${note}${body}\n}\n`;
}

/** Códigos iniciais de todas as linguagens que o problema suporta. */
export function allStarters(p: ProblemShape): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = { python: p.starter.python, javascript: p.starter.javascript };
  for (const l of ["typescript", "java", "cpp", "csharp", "go"] as const) {
    const s = buildStarter(l, p);
    if (s) out[l] = s;
  }
  // TypeScript também roda nos problemas com listas, árvores e design (é JavaScript sem os tipos).
  out.typescript ??= p.starter.javascript;
  return out;
}
