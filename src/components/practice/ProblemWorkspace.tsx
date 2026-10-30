"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSandbox, isRemote, type Compare, type Language, type RunOutcome, type TestCase, type ValueType } from "./runner";
import { allStarters, isLang, LANG_LABEL, type ProblemShape } from "@/lib/langs";
import { PROGRESS_EVENT, type ProgressEventDetail } from "@/lib/events";

const Editor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-fg-subtle">Carregando editor…</div>,
});

export interface ProblemSpec {
  fn: string;
  fnJs: string;
  checkArg?: number;
  compare?: Compare;
  argTypes?: ValueType[];
  returnType?: ValueType;
  design?: boolean;
  starter: { python: string; javascript: string };
  tests: TestCase[];
}

function useDataTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

function show(v: unknown) {
  return typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v);
}

export function ProblemWorkspace({
  chapterKey,
  problem,
  allowRun = true,
}: {
  chapterKey: string;
  problem: ProblemSpec;
  /** false = modo "sem executar" da mock interview: o candidato valida exemplos de cabeça. */
  allowRun?: boolean;
}) {
  const starters = useMemo(() => allStarters(problem as unknown as ProblemShape), [problem]);
  const available = useMemo(() => (Object.keys(LANG_LABEL) as Language[]).filter((l) => starters[l] !== undefined), [starters]);
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState<Partial<Record<Language, string>>>(starters);
  const [running, setRunning] = useState(false);
  const [interpreter, setInterpreter] = useState<"loading" | "ready" | "error">("loading");
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [activeCase, setActiveCase] = useState(0);
  const theme = useDataTheme();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Rascunhos salvos + linguagem preferida
  useEffect(() => {
    const savedLang = localStorage.getItem("cf-lang");
    if (isLang(savedLang) && starters[savedLang] !== undefined) setLanguage(savedLang);
    fetch(`/api/state?chapter=${chapterKey}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { drafts: Partial<Record<Language, string>> } | null) => {
        if (s?.drafts) setCode((c) => ({ ...c, ...s.drafts }));
      })
      .catch(() => {});
  }, [chapterKey, starters]);

  // Pré-carrega o interpretador da linguagem atual
  useEffect(() => {
    setInterpreter("loading");
    getSandbox(language)
      .warmUp()
      .then(() => setInterpreter("ready"), () => setInterpreter("error"));
  }, [language]);

  const onChange = (value: string | undefined) => {
    const v = value ?? "";
    setCode((c) => ({ ...c, [language]: v }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: chapterKey, language, code: v }),
      }).catch(() => {});
    }, 1500);
  };

  const run = useCallback(async () => {
    setRunning(true);
    setOutcome(null);
    const result = await getSandbox(language).run({
      code: code[language] ?? "",
      key: chapterKey,
      fn: language === "python" ? problem.fn : problem.fnJs,
      checkArg: problem.checkArg ?? -1,
      compare: problem.compare ?? "exact",
      argTypes: problem.argTypes ?? [],
      returnType: problem.returnType ?? null,
      design: problem.design ?? false,
      tests: problem.tests,
    });
    setRunning(false);
    setOutcome(result);
    setInterpreter("ready");
    if (result.kind === "done") {
      const firstFail = result.cases.findIndex((c) => !c.ok);
      setActiveCase(firstFail === -1 ? 0 : firstFail);
      if (firstFail === -1) {
        window.dispatchEvent(new CustomEvent<ProgressEventDetail>(PROGRESS_EVENT, { detail: { key: chapterKey, completed: true } }));
        fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: chapterKey, completed: true }),
        }).catch(() => {});
      }
    }
  }, [code, language, problem, chapterKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!running && allowRun) run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, running]);

  const passed = outcome?.kind === "done" ? outcome.cases.filter((c) => c.ok).length : 0;
  const allPassed = outcome?.kind === "done" && passed === outcome.cases.length;

  return (
    <section aria-label="Editor de código" className="overflow-hidden rounded-xl border border-line bg-surface-1 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <label className="sr-only" htmlFor="lang">Linguagem</label>
        <select
          id="lang"
          value={language}
          onChange={(e) => {
            const l = e.target.value as Language;
            setLanguage(l);
            setOutcome(null);
            localStorage.setItem("cf-lang", l);
          }}
          className="rounded-md border border-line-input bg-surface-1 px-2 py-1 text-sm"
        >
          {available.map((l) => (
            <option key={l} value={l}>{LANG_LABEL[l]}</option>
          ))}
        </select>
        <span className="text-xs text-fg-subtle">
          {isRemote(language) ? "Compila e executa em serviço externo" : interpreter === "loading" ? "Carregando interpretador…" : interpreter === "error" ? "Falha ao carregar o interpretador" : "Pronto"}
        </span>
        <button
          type="button"
          onClick={() => {
            if (confirm("Restaurar o código inicial? O rascunho atual será substituído.")) onChange(starters[language] ?? "");
          }}
          className="ml-auto rounded-md px-2.5 py-1 text-sm text-fg-muted hover:bg-surface-2"
        >
          Restaurar
        </button>
        <button
          type="button"
          onClick={run}
          disabled={running || !allowRun}
          aria-busy={running}
          title="Ctrl+Enter"
          className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-fg-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {running ? "Executando…" : "▶ Executar testes"}
        </button>
      </div>

      <div className="h-[380px]">
        <Editor
          language={language}
          value={code[language] ?? ""}
          onChange={onChange}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            fontSize: 14,
            fontFamily: "var(--font-jetbrains), monospace",
            fontLigatures: false,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12 },
          }}
        />
      </div>

      <div className="border-t border-line px-4 py-3 text-sm" aria-live="polite">
        {!outcome && !running && (
          <p className="text-fg-muted">
            {allowRun
              ? `Execute para rodar os ${problem.tests.length} casos de teste.`
              : "Modo sem executar: percorra os exemplos manualmente. Os testes rodam ao final da entrevista."}
          </p>
        )}
        {running && <p className="text-fg-muted">Rodando os testes…</p>}
        {outcome?.kind === "timeout" && <p className="font-medium text-danger">Tempo limite excedido. Verifique se há um laço infinito.</p>}
        {outcome?.kind === "error" && <p className="font-medium text-danger">{outcome.message}</p>}
        {outcome?.kind === "compile_error" && (
          <>
            <p className="font-medium text-danger">Erro no código</p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-danger-soft p-3 font-mono text-xs">{outcome.message}</pre>
          </>
        )}
        {outcome?.kind === "done" && (
          <>
            <p className={`font-semibold ${allPassed ? "text-success" : "text-danger"}`}>
              {allPassed ? `✓ Aceito — ${passed}/${outcome.cases.length} testes passaram` : `✗ ${passed}/${outcome.cases.length} testes passaram`}
            </p>
            <div role="tablist" aria-label="Casos de teste" className="mt-3 flex flex-wrap gap-1.5">
              {outcome.cases.map((c, i) => (
                <button
                  key={i}
                  role="tab"
                  type="button"
                  aria-selected={activeCase === i}
                  onClick={() => setActiveCase(i)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium aria-selected:ring-2 aria-selected:ring-[var(--cf-focus-ring)] ${
                    c.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}
                >
                  {c.ok ? "✓" : "✗"} Caso {i + 1}
                </button>
              ))}
            </div>
            {outcome.cases[activeCase] && (
              <dl className="mt-3 grid gap-2 font-mono text-xs sm:grid-cols-[auto_1fr]">
                <dt className="text-fg-subtle">Entrada</dt>
                <dd className="break-all">{problem.tests[activeCase].input.map(show).join(", ")}</dd>
                <dt className="text-fg-subtle">Esperado</dt>
                <dd className="break-all">{show(problem.tests[activeCase].expected)}</dd>
                <dt className="text-fg-subtle">Obtido</dt>
                <dd className="break-all">{outcome.cases[activeCase].error ?? show(outcome.cases[activeCase].actual)}</dd>
                {outcome.cases[activeCase].stdout && (
                  <>
                    <dt className="text-fg-subtle">Saída</dt>
                    <dd className="whitespace-pre-wrap break-all">{outcome.cases[activeCase].stdout}</dd>
                  </>
                )}
                <dt className="text-fg-subtle">Tempo</dt>
                <dd>{outcome.cases[activeCase].ms} ms</dd>
              </dl>
            )}
          </>
        )}
      </div>
    </section>
  );
}
