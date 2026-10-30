/**
 * Execução de código 100% no navegador, sem servidor (custo zero):
 * - Python: Pyodide (CPython compilado para WebAssembly) dentro de um Web Worker.
 * - JavaScript: Web Worker dedicado.
 * - TypeScript: tipos removidos no navegador (sucrase) e executado no worker de JavaScript.
 * - Java, C++, C# e Go: enviados a /api/run, que compila e roda num serviço externo (Judge0).
 * O worker isola o código da página; loops infinitos são interrompidos com worker.terminate().
 */
import type { Lang } from "@/lib/langs";
import { REMOTE_LANGS } from "@/lib/langs";

export type Language = Lang;

export interface TestCase {
  input: unknown[];
  expected: unknown;
}

export interface CaseResult {
  ok: boolean;
  actual: unknown;
  error: string | null;
  stdout: string;
  ms: number;
}

export type RunOutcome =
  | { kind: "done"; cases: CaseResult[] }
  | { kind: "compile_error"; message: string }
  | { kind: "timeout" }
  | { kind: "error"; message: string };

export type Compare = "exact" | "unordered" | "unordered-deep";

/**
 * Tipos especiais de argumento/retorno, convertidos pelo harness:
 * - linkedlist: [1,2,3] ↔ ListNode(1) → 2 → 3
 * - cyclelist:  [[3,2,0,-4], 1] → lista cujo último nó aponta para o índice 1 (-1 = sem ciclo)
 * - tree:       [3,9,20,null,null,15,7] (ordem de nível) ↔ TreeNode
 * - treenode:   valor → o nó com esse valor na primeira árvore dos argumentos (retorno: nó → valor)
 */
export type ValueType = "linkedlist" | "cyclelist" | "tree" | "treenode" | null;

export interface RunJob {
  language: Language;
  code: string;
  fn: string;
  checkArg: number; // -1 = compara o retorno
  /** unordered: ordena a lista externa; unordered-deep: ordena todas as listas aninhadas. */
  compare: Compare;
  argTypes: ValueType[];
  returnType: ValueType;
  /** Problema de design: fn é uma classe; cada teste é [operações, argumentos] e espera a lista de retornos. */
  design: boolean;
  tests: TestCase[];
  /** Chave "<curso>/<capitulo>" do problema; o executor remoto monta o programa de teste a partir dela. */
  key?: string;
}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";
const RUN_TIMEOUT_MS = 6000;
const LOAD_TIMEOUT_MS = 90000;

const PY_HARNESS = String.raw`
import json, io, sys, time, copy, traceback, re
from collections import deque
_tests = json.loads(TESTS_JSON)
_arg_types = json.loads(ARG_TYPES_JSON)

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return f"ListNode({self.val})"

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return f"TreeNode({self.val})"

def _to_linked(arr, pos=-1):
    dummy = ListNode()
    cur, nodes = dummy, []
    for v in arr:
        cur.next = ListNode(v)
        cur = cur.next
        nodes.append(cur)
    if pos is not None and pos >= 0 and nodes:
        cur.next = nodes[pos]
    return dummy.next

def _from_linked(node):
    out, steps = [], 0
    while node is not None and steps < 10000:
        out.append(node.val)
        node = node.next
        steps += 1
    return out

def _to_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q, i = deque([root]), 1
    while q and i < len(arr):
        n = q.popleft()
        if i < len(arr) and arr[i] is not None:
            n.left = TreeNode(arr[i]); q.append(n.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            n.right = TreeNode(arr[i]); q.append(n.right)
        i += 1
    return root

def _from_tree(root):
    out, q = [], deque([root])
    while q:
        n = q.popleft()
        if n is None:
            out.append(None)
        else:
            out.append(n.val); q.append(n.left); q.append(n.right)
    while out and out[-1] is None:
        out.pop()
    return out

def _find(root, val):
    stack = [root]
    while stack:
        n = stack.pop()
        if n is None:
            continue
        if n.val == val:
            return n
        stack.extend([n.left, n.right])
    return None

def _convert_args(raw):
    args = list(raw)
    tree = None
    for i, t in enumerate(_arg_types):
        if i >= len(args):
            break
        if t == "linkedlist":
            args[i] = _to_linked(args[i])
        elif t == "cyclelist":
            args[i] = _to_linked(args[i][0], args[i][1])
        elif t == "tree":
            args[i] = _to_tree(args[i])
            tree = tree or args[i]
    for i, t in enumerate(_arg_types):
        if t == "treenode" and i < len(args):
            args[i] = _find(tree, args[i])
    return args

def _convert_out(v):
    if RETURN_TYPE == "linkedlist":
        return _from_linked(v)
    if RETURN_TYPE == "tree":
        return _from_tree(v)
    if RETURN_TYPE == "treenode":
        return None if v is None else v.val
    return v

def _snake(name):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()

def _norm(v, deep):
    if isinstance(v, list):
        items = [_norm(x, deep) if deep else x for x in v]
        return sorted(items, key=lambda x: json.dumps(x, sort_keys=True))
    return v

def _eq(a, b):
    if COMPARE == "exact":
        return a == b
    return _norm(a, COMPARE == "unordered-deep") == _norm(b, COMPARE == "unordered-deep")

_ns = {"__name__": "__main__", "ListNode": ListNode, "TreeNode": TreeNode}
exec("from typing import *", _ns)
_out = None
try:
    exec(USER_CODE, _ns)
except Exception as e:
    _out = {"compile_error": "".join(traceback.format_exception_only(type(e), e)).strip()}
if _out is None:
    _fn = _ns.get(FN_NAME)
    if not callable(_fn):
        _out = {"compile_error": f"'{FN_NAME}' não encontrado no código."}
    else:
        _out = []
        for _t in _tests:
            _buf, _old = io.StringIO(), sys.stdout
            sys.stdout = _buf
            _err, _actual = None, None
            _t0 = time.perf_counter()
            try:
                if DESIGN:
                    _ops, _params = _t["input"]
                    _obj, _actual = None, []
                    for _op, _p in zip(_ops, _params):
                        if _obj is None:
                            _obj = _fn(*_p)
                            _actual.append(None)
                        else:
                            _m = getattr(_obj, _op, None) or getattr(_obj, _snake(_op))
                            _actual.append(_m(*copy.deepcopy(_p)))
                else:
                    _args = _convert_args(copy.deepcopy(_t["input"]))
                    _r = _fn(*_args)
                    _actual = _convert_out(_args[CHECK_ARG] if CHECK_ARG >= 0 else _r)
            except Exception as e:
                _err = "".join(traceback.format_exception_only(type(e), e)).strip()
            finally:
                sys.stdout = _old
            _ms = (time.perf_counter() - _t0) * 1000
            try:
                _aj = json.loads(json.dumps(_actual))
            except Exception:
                _aj = repr(_actual)
            _out.append({"ok": _err is None and _eq(_aj, _t["expected"]), "actual": _aj, "error": _err,
                         "stdout": _buf.getvalue()[:2000], "ms": round(_ms, 2)})
json.dumps(_out)
`;

const PY_WORKER = `
importScripts(${JSON.stringify(PYODIDE_URL)} + "pyodide.js");
const ready = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)} });
ready.then(() => self.postMessage({ type: "ready" }), (e) => self.postMessage({ type: "load_error", message: String(e) }));
self.onmessage = async (e) => {
  const { code, fn, tests, checkArg, compare, argTypes, returnType, design } = e.data;
  try {
    const py = await ready;
    py.globals.set("USER_CODE", code);
    py.globals.set("FN_NAME", fn);
    py.globals.set("TESTS_JSON", JSON.stringify(tests));
    py.globals.set("ARG_TYPES_JSON", JSON.stringify(argTypes));
    py.globals.set("RETURN_TYPE", returnType);
    py.globals.set("DESIGN", design);
    py.globals.set("CHECK_ARG", checkArg);
    py.globals.set("COMPARE", compare);
    const out = JSON.parse(await py.runPythonAsync(${JSON.stringify(PY_HARNESS)}));
    self.postMessage({ type: "result", out });
  } catch (err) {
    self.postMessage({ type: "result", out: { compile_error: String(err && err.message || err) } });
  }
};
`;

const JS_WORKER = String.raw`
self.postMessage({ type: "ready" });
class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } }
class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
self.ListNode = ListNode;
self.TreeNode = TreeNode;
const toLinked = (arr, pos = -1) => {
  const dummy = new ListNode(); let cur = dummy; const nodes = [];
  for (const v of arr) { cur.next = new ListNode(v); cur = cur.next; nodes.push(cur); }
  if (pos >= 0 && nodes.length) cur.next = nodes[pos];
  return dummy.next;
};
const fromLinked = (n) => { const out = []; let steps = 0; while (n && steps++ < 10000) { out.push(n.val); n = n.next; } return out; };
const toTree = (arr) => {
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]); const q = [root]; let i = 1;
  while (q.length && i < arr.length) {
    const n = q.shift();
    if (i < arr.length && arr[i] !== null) { n.left = new TreeNode(arr[i]); q.push(n.left); } i++;
    if (i < arr.length && arr[i] !== null) { n.right = new TreeNode(arr[i]); q.push(n.right); } i++;
  }
  return root;
};
const fromTree = (root) => {
  const out = []; const q = [root];
  while (q.length) { const n = q.shift(); if (!n) out.push(null); else { out.push(n.val); q.push(n.left, n.right); } }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
};
const find = (root, val) => { const st = [root]; while (st.length) { const n = st.pop(); if (!n) continue; if (n.val === val) return n; st.push(n.left, n.right); } return null; };
const norm = (v, deep) =>
  Array.isArray(v)
    ? v.map((x) => (deep ? norm(x, deep) : x)).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0))
    : v;
self.onmessage = (e) => {
  const { code, fn, tests, checkArg, compare, argTypes, returnType, design } = e.data;
  const deep = compare === "unordered-deep";
  const same = (a, b) => compare === "exact"
    ? JSON.stringify(a) === JSON.stringify(b)
    : JSON.stringify(norm(a, deep)) === JSON.stringify(norm(b, deep));
  const convertArgs = (raw) => {
    const args = [...raw]; let tree = null;
    argTypes.forEach((t, i) => {
      if (i >= args.length) return;
      if (t === "linkedlist") args[i] = toLinked(args[i]);
      else if (t === "cyclelist") args[i] = toLinked(args[i][0], args[i][1]);
      else if (t === "tree") { args[i] = toTree(args[i]); tree = tree || args[i]; }
    });
    argTypes.forEach((t, i) => { if (t === "treenode" && i < args.length) args[i] = find(tree, args[i]); });
    return args;
  };
  const convertOut = (v) =>
    returnType === "linkedlist" ? fromLinked(v) : returnType === "tree" ? fromTree(v) : returnType === "treenode" ? (v ? v.val : null) : v;
  let f;
  try {
    f = new Function(code + "\n;return typeof " + fn + " === 'function' ? " + fn + " : undefined;")();
  } catch (err) {
    self.postMessage({ type: "result", out: { compile_error: String(err) } });
    return;
  }
  if (typeof f !== "function") {
    self.postMessage({ type: "result", out: { compile_error: "'" + fn + "' não encontrado no código." } });
    return;
  }
  const out = tests.map((t) => {
    const logs = [];
    console.log = (...a) => logs.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" "));
    const t0 = performance.now();
    let actual = null, error = null;
    try {
      if (design) {
        const [ops, params] = t.input; let obj = null; actual = [];
        ops.forEach((op, i) => {
          if (!obj) { obj = new f(...params[i]); actual.push(null); }
          else { const r = obj[op](...structuredClone(params[i])); actual.push(r === undefined ? null : r); }
        });
      } else {
        const args = convertArgs(structuredClone(t.input));
        const r = f(...args);
        actual = convertOut(checkArg >= 0 ? args[checkArg] : r);
      }
      actual = actual === undefined ? null : JSON.parse(JSON.stringify(actual));
    } catch (err) {
      error = String(err);
    }
    const ms = Math.round((performance.now() - t0) * 100) / 100;
    const ok = error === null && same(actual, t.expected);
    return { ok, actual, error, stdout: logs.join("\n").slice(0, 2000), ms };
  });
  self.postMessage({ type: "result", out });
};
`;

class SandboxWorker {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;

  constructor(private source: string) {}

  private spawn() {
    const url = URL.createObjectURL(new Blob([this.source], { type: "text/javascript" }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Tempo esgotado ao carregar o interpretador.")), LOAD_TIMEOUT_MS);
      const onMsg = (e: MessageEvent) => {
        if (e.data?.type === "ready" || e.data?.type === "load_error") {
          clearTimeout(timer);
          worker.removeEventListener("message", onMsg);
          if (e.data.type === "ready") resolve();
          else reject(new Error(e.data.message));
        }
      };
      worker.addEventListener("message", onMsg);
    });
    this.ready.catch(() => this.reset());
  }

  reset() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }

  /** Aquece o interpretador antes do primeiro clique em "Executar". */
  warmUp() {
    if (!this.worker) this.spawn();
    return this.ready!;
  }

  async run(job: Omit<RunJob, "language">): Promise<RunOutcome> {
    try {
      await this.warmUp();
    } catch (err) {
      return { kind: "error", message: (err as Error).message };
    }
    const worker = this.worker!;
    return new Promise<RunOutcome>((resolve) => {
      const timer = setTimeout(() => {
        this.reset(); // mata loops infinitos; o próximo run recria o worker
        resolve({ kind: "timeout" });
      }, RUN_TIMEOUT_MS);
      worker.onmessage = (e) => {
        if (e.data?.type !== "result") return;
        clearTimeout(timer);
        const out = e.data.out;
        resolve(Array.isArray(out) ? { kind: "done", cases: out } : { kind: "compile_error", message: out.compile_error });
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        this.reset();
        resolve({ kind: "error", message: e.message || "Erro no worker." });
      };
      worker.postMessage(job);
    });
  }
}

/** O que o editor precisa de qualquer executor, local ou remoto. */
export interface Sandbox {
  warmUp(): Promise<void>;
  run(job: Omit<RunJob, "language">): Promise<RunOutcome>;
}

/** TypeScript: remove os tipos (sucrase, carregado só quando usado) e roda como JavaScript. */
class TypeScriptSandbox implements Sandbox {
  constructor(private js: Sandbox) {}
  warmUp() {
    return this.js.warmUp();
  }
  async run(job: Omit<RunJob, "language">): Promise<RunOutcome> {
    let code: string;
    try {
      const { transform } = await import("sucrase");
      code = transform(job.code, { transforms: ["typescript"] }).code;
    } catch (err) {
      return { kind: "compile_error", message: (err as Error).message };
    }
    return this.js.run({ ...job, code });
  }
}

/** Java, C++, C# e Go: compilados e executados fora do navegador. */
class RemoteSandbox implements Sandbox {
  constructor(private language: Language) {}
  warmUp() {
    return Promise.resolve();
  }
  async run(job: Omit<RunJob, "language">): Promise<RunOutcome> {
    if (!job.key) return { kind: "error", message: "Este problema não pode ser executado nesta linguagem." };
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: job.key, language: this.language, code: job.code }),
        signal: AbortSignal.timeout(50_000),
      });
      const data = await res.json();
      if (!res.ok) return { kind: "error", message: data?.error?.message ?? "Falha ao executar." };
      return data as RunOutcome;
    } catch (err) {
      return (err as Error).name === "TimeoutError" ? { kind: "timeout" } : { kind: "error", message: "Não foi possível falar com o serviço de execução." };
    }
  }
}

const sandboxes: Partial<Record<Language, Sandbox>> = {};

export function getSandbox(language: Language): Sandbox {
  if (!sandboxes[language]) {
    if (language === "python") sandboxes[language] = new SandboxWorker(PY_WORKER);
    else if (language === "javascript") sandboxes[language] = new SandboxWorker(JS_WORKER);
    else if (language === "typescript") sandboxes[language] = new TypeScriptSandbox(getSandbox("javascript"));
    else sandboxes[language] = new RemoteSandbox(language);
  }
  return sandboxes[language]!;
}

export const isRemote = (language: Language) => (REMOTE_LANGS as string[]).includes(language);
