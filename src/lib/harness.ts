import "server-only";
import { literal, pascal, typeName, type Lang, type ProblemShape, type Signature } from "@/lib/langs";

/**
 * Monta o programa completo (código do usuário + testes) para as linguagens executadas no servidor.
 * Cada teste imprime uma linha `@@R<i>@@<json>` (resultado) ou `@@E<i>@@<mensagem>` (exceção);
 * o servidor lê essas linhas e compara com o esperado.
 */

const MARK_R = "@@R";
const MARK_E = "@@E";

function argDecls(lang: Lang, p: ProblemShape, sig: Signature, testIdx: number): { decls: string; names: string[] } {
  const test = p.tests[testIdx];
  const names = sig.params.map((_, i) => `a${i}`);
  const decls = sig.params
    .map((t, i) => {
      const lit = literal(lang, t, test.input[i]);
      if (lang === "go") return `a${i} := ${lit}`;
      const ty = lang === "java" || lang === "csharp" || lang === "cpp" ? typeName(lang, t) : "";
      return `${ty} a${i} = ${lit};`;
    })
    .join("\n      ");
  return { decls, names };
}

function javaProgram(code: string, p: ProblemShape, sig: Signature): string {
  const user = code.replace(/\bpublic\s+(class|interface|enum|record)\s/g, "$1 ");
  const check = p.checkArg ?? -1;
  const blocks = p.tests.map((_, i) => {
    const { decls, names } = argDecls("java", p, sig, i);
    const call = `new Solution().${p.fnJs}(${names.join(", ")})`;
    const body = sig.ret ? `var r = ${call};\n      System.out.println();\n      System.out.println("${MARK_R}${i}@@" + js(r));` : `${call};\n      System.out.println();\n      System.out.println("${MARK_R}${i}@@" + js(a${check}));`;
    return `    try {\n      ${decls}\n      ${body}\n    } catch (Throwable t) {\n      System.out.println();\n      System.out.println("${MARK_E}${i}@@" + t);\n    }`;
  });
  return `import java.util.*;
import java.util.function.*;
import java.util.stream.*;
//__USER_CODE__
${user}

public class Main {
  static String q(String s) {
    StringBuilder b = new StringBuilder("\\"");
    for (char c : s.toCharArray()) {
      if (c == '"') b.append("\\\\\\"");
      else if (c == '\\\\') b.append("\\\\\\\\");
      else if (c == '\\n') b.append("\\\\n");
      else if (c == '\\r') b.append("\\\\r");
      else if (c == '\\t') b.append("\\\\t");
      else if (c < 0x20) b.append(String.format("\\\\u%04x", (int) c));
      else b.append(c);
    }
    return b.append('"').toString();
  }
  static String js(Object o) {
    if (o == null) return "null";
    if (o instanceof String) return q((String) o);
    if (o instanceof Boolean || o instanceof Integer || o instanceof Long) return o.toString();
    if (o instanceof Double) return Double.toString((Double) o);
    if (o.getClass().isArray()) {
      StringBuilder b = new StringBuilder("[");
      int n = java.lang.reflect.Array.getLength(o);
      for (int i = 0; i < n; i++) {
        if (i > 0) b.append(',');
        b.append(js(java.lang.reflect.Array.get(o, i)));
      }
      return b.append(']').toString();
    }
    return q(o.toString());
  }
  public static void main(String[] args) {
${blocks.join("\n")}
  }
}
`;
}

function cppProgram(code: string, p: ProblemShape, sig: Signature): string {
  const check = p.checkArg ?? -1;
  const blocks = p.tests.map((_, i) => {
    const { decls, names } = argDecls("cpp", p, sig, i);
    const call = `Solution().${p.fnJs}(${names.join(", ")})`;
    const body = sig.ret
      ? `auto r = ${call};\n      cout << "\\n${MARK_R}${i}@@" << js(r) << "\\n";`
      : `${call};\n      cout << "\\n${MARK_R}${i}@@" << js(a${check}) << "\\n";`;
    return `  {\n    ${decls}\n    try {\n      ${body}\n    } catch (const exception& e) {\n      cout << "\\n${MARK_E}${i}@@" << e.what() << "\\n";\n    } catch (...) {\n      cout << "\\n${MARK_E}${i}@@exceção desconhecida\\n";\n    }\n  }`;
  });
  return `#include <bits/stdc++.h>
using namespace std;
//__USER_CODE__
${code}

static string q(const string& s) {
  string b = "\\"";
  for (unsigned char c : s) {
    if (c == '"') b += "\\\\\\"";
    else if (c == '\\\\') b += "\\\\\\\\";
    else if (c == '\\n') b += "\\\\n";
    else if (c == '\\r') b += "\\\\r";
    else if (c == '\\t') b += "\\\\t";
    else if (c < 0x20) { char buf[8]; snprintf(buf, sizeof buf, "\\\\u%04x", c); b += buf; }
    else b += (char) c;
  }
  return b + "\\"";
}
static string js(const string& s) { return q(s); }
static string js(bool b) { return b ? "true" : "false"; }
static string js(int x) { return to_string(x); }
static string js(long long x) { return to_string(x); }
static string js(double d) { ostringstream o; o << setprecision(17) << d; return o.str(); }
template <class T> static string js(const vector<T>& v) {
  string r = "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) r += ","; auto x = v[i]; r += js(x); }
  return r + "]";
}

int main() {
${blocks.join("\n")}
  cout.flush();
  return 0;
}
`;
}

function csharpProgram(code: string, p: ProblemShape, sig: Signature): string {
  const check = p.checkArg ?? -1;
  const method = pascal(p.fnJs);
  const blocks = p.tests.map((_, i) => {
    const { decls, names } = argDecls("csharp", p, sig, i);
    const call = `new Solution().${method}(${names.join(", ")})`;
    const body = sig.ret
      ? `var r = ${call};\n        Console.WriteLine();\n        Console.WriteLine("${MARK_R}${i}@@" + Js(r));`
      : `${call};\n        Console.WriteLine();\n        Console.WriteLine("${MARK_R}${i}@@" + Js(a${check}));`;
    return `    {\n      ${decls}\n      try {\n        ${body}\n      } catch (Exception e) {\n        Console.WriteLine();\n        Console.WriteLine("${MARK_E}${i}@@" + e.GetType().Name + ": " + e.Message);\n      }\n    }`;
  });
  return `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
//__USER_CODE__
${code}

class __Harness {
  static string Q(string s) {
    var b = new StringBuilder("\\"");
    foreach (char c in s) {
      if (c == '"') b.Append("\\\\\\"");
      else if (c == '\\\\') b.Append("\\\\\\\\");
      else if (c == '\\n') b.Append("\\\\n");
      else if (c == '\\r') b.Append("\\\\r");
      else if (c == '\\t') b.Append("\\\\t");
      else if (c < 0x20) b.Append("\\\\u" + ((int) c).ToString("x4"));
      else b.Append(c);
    }
    return b.Append('"').ToString();
  }
  static string Js(object o) {
    if (o == null) return "null";
    if (o is string) return Q((string) o);
    if (o is bool) return ((bool) o) ? "true" : "false";
    if (o is double) return ((double) o).ToString("R", CultureInfo.InvariantCulture);
    if (o is int || o is long) return Convert.ToString(o, CultureInfo.InvariantCulture);
    if (o is System.Collections.IEnumerable) {
      var b = new StringBuilder("[");
      bool first = true;
      foreach (var x in (System.Collections.IEnumerable) o) {
        if (!first) b.Append(',');
        first = false;
        b.Append(Js(x));
      }
      return b.Append(']').ToString();
    }
    return Q(o.ToString());
  }
  static void Main() {
${blocks.join("\n")}
  }
}
`;
}

function goProgram(code: string, p: ProblemShape, sig: Signature): string {
  const user = code.replace(/^\s*package\s+\w+\s*$/m, "");
  const check = p.checkArg ?? -1;
  const blocks = p.tests.map((_, i) => {
    const { decls, names } = argDecls("go", p, sig, i);
    const body = sig.ret
      ? `r := ${p.fnJs}(${names.join(", ")})\n    __fmt.Printf("\\n${MARK_R}${i}@@%s\\n", __js(__reflect.ValueOf(r)))`
      : `${p.fnJs}(${names.join(", ")})\n    __fmt.Printf("\\n${MARK_R}${i}@@%s\\n", __js(__reflect.ValueOf(a${check})))`;
    return `  func() {\n    defer func() {\n      if e := recover(); e != nil {\n        __fmt.Printf("\\n${MARK_E}${i}@@%v\\n", e)\n      }\n    }()\n    ${decls}\n    ${body}\n  }()`;
  });
  return `package main

import (
	__json "encoding/json"
	__fmt "fmt"
	__reflect "reflect"
	__strconv "strconv"
	__strings "strings"
)
//__USER_CODE__
${user}

func __js(v __reflect.Value) string {
	switch v.Kind() {
	case __reflect.Slice, __reflect.Array:
		parts := make([]string, 0, v.Len())
		for i := 0; i < v.Len(); i++ {
			parts = append(parts, __js(v.Index(i)))
		}
		return "[" + __strings.Join(parts, ",") + "]"
	case __reflect.String:
		b, _ := __json.Marshal(v.String())
		return string(b)
	case __reflect.Bool:
		return __strconv.FormatBool(v.Bool())
	case __reflect.Int, __reflect.Int8, __reflect.Int16, __reflect.Int32, __reflect.Int64:
		return __strconv.FormatInt(v.Int(), 10)
	case __reflect.Float32, __reflect.Float64:
		return __strconv.FormatFloat(v.Float(), 'g', -1, 64)
	}
	return "null"
}

func main() {
${blocks.join("\n")}
}
`;
}

export function buildProgram(lang: Lang, code: string, p: ProblemShape, sig: Signature): string {
  switch (lang) {
    case "java":
      return javaProgram(code, p, sig);
    case "cpp":
      return cppProgram(code, p, sig);
    case "csharp":
      return csharpProgram(code, p, sig);
    case "go":
      return goProgram(code, p, sig);
    default:
      throw new Error(`linguagem não executada no servidor: ${lang}`);
  }
}

/** Linhas que o programa tem antes do código do usuário (para corrigir números de linha dos erros). */
export function userLineOffset(source: string): number {
  const i = source.split("\n").indexOf("//__USER_CODE__");
  return i < 0 ? 0 : i + 1;
}

export interface ParsedCase {
  kind: "ok" | "error";
  text: string;
  stdout: string;
}

/** Lê a saída do programa e devolve, por teste, o resultado ou a exceção, mais o que o usuário imprimiu. */
export function parseOutput(stdout: string, count: number): Array<ParsedCase | null> {
  const results: Array<ParsedCase | null> = Array.from({ length: count }, () => null);
  let pending: string[] = [];
  for (const line of stdout.split("\n")) {
    const m = /^@@([RE])(\d+)@@(.*)$/.exec(line);
    if (!m) {
      if (line.trim()) pending.push(line);
      continue;
    }
    const idx = Number(m[2]);
    if (idx < count) results[idx] = { kind: m[1] === "R" ? "ok" : "error", text: m[3], stdout: pending.join("\n").slice(0, 2000) };
    pending = [];
  }
  return results;
}
