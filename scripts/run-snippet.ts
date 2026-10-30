/**
 * Executa um arquivo de código em qualquer linguagem do app e mostra a saída (para testar traduções de exemplos).
 *
 *   npx tsx --conditions react-server scripts/run-snippet.ts <python|javascript|typescript|java|cpp|csharp|go> <arquivo>
 *
 * Python e JavaScript rodam localmente; TypeScript, Java, C++, C# e Go rodam no Judge0.
 * Java precisa de `public class Main`; C# de `static void Main()`; Go de `package main` e `func main()`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { runOnJudge0 } from "../src/lib/judge0";
import { isLang } from "../src/lib/langs";

async function main() {
  const [lang, file] = process.argv.slice(2);
  if (!isLang(lang) || !file || !fs.existsSync(file)) {
    console.error("uso: run-snippet.ts <python|javascript|typescript|java|cpp|csharp|go> <arquivo>");
    process.exit(2);
  }
  const code = fs.readFileSync(file, "utf8");
  if (lang === "python" || lang === "javascript") {
    const r = spawnSync(lang === "python" ? "python" : "node", lang === "python" ? ["-X", "utf8", "-P", "-s", file] : [file], {
      encoding: "utf8",
      timeout: 30000,
      env: { ...process.env, PYTHONHASHSEED: "0" },
    });
    process.stdout.write(r.stdout ?? "");
    if (r.stderr) process.stderr.write(r.stderr);
    process.exit(r.status ?? 1);
  }
  const res = await runOnJudge0(lang, code);
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.status.id !== 3) {
    console.error(`[${res.status.description}]`);
    if (res.compile_output) console.error(res.compile_output);
    if (res.stderr) console.error(res.stderr);
    process.exit(1);
  }
}
main();
