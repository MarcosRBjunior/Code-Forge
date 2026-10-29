/**
 * Animações passo a passo. Cada animação é uma função pura que recebe a entrada
 * (editável pelo usuário) e devolve a lista de quadros a renderizar.
 */
export type CellRole = "active" | "compare" | "done" | "window" | "found" | "muted" | "swap";

export interface Frame {
  /** Linha de células (array, string, pilha horizontal…). */
  cells?: Array<string | number>;
  roles?: Record<number, CellRole>;
  /** Rótulos de ponteiros sob as células: nome → índice. */
  pointers?: Record<string, number>;
  /** Grade 2D (BFS, DP). */
  grid?: Array<Array<string | number>>;
  gridRoles?: Record<string, CellRole>; // chave "r,c"
  /** Pilha vertical (topo por último). */
  stack?: Array<string | number>;
  /** Anel de hashing consistente / nós de servidor. */
  ring?: { nodes: Array<{ label: string; angle: number; kind: "server" | "key"; owner?: string }> };
  /** Requisições distribuídas para servidores. */
  servers?: Array<{ name: string; load: number; active?: boolean }>;
  vars?: Record<string, string | number>;
  note: string;
}

export interface InputField {
  key: string;
  label: string;
  default: string;
  /** Converte o texto digitado; lança erro com mensagem amigável se inválido. */
  parse: (s: string) => unknown;
}

export interface AnimationDef {
  slug: string;
  title: string;
  category: "dsa-conceitos" | "dsa-problemas" | "system-design";
  description: string;
  /** Capítulo relacionado: "curso/slug". */
  chapter?: string;
  inputs: InputField[];
  build: (input: Record<string, unknown>) => Frame[];
}

const nums = (s: string) => {
  const arr = s.split(/[\s,]+/).filter(Boolean).map(Number);
  if (!arr.length || arr.some((n) => !Number.isFinite(n))) throw new Error("Digite números separados por vírgula.");
  if (arr.length > 16) throw new Error("Use no máximo 16 números.");
  return arr;
};
const int = (s: string) => {
  const n = Number(s);
  if (!Number.isInteger(n)) throw new Error("Digite um número inteiro.");
  return n;
};
const text = (max: number) => (s: string) => {
  if (!s.length || s.length > max) throw new Error(`Digite de 1 a ${max} caracteres.`);
  return s;
};

export const ANIMATIONS: AnimationDef[] = [
  {
    slug: "busca-binaria",
    title: "Busca binária",
    category: "dsa-conceitos",
    description: "Como lo, mid e hi descartam metade do array a cada passo.",
    chapter: "dsa/intro-busca-binaria",
    inputs: [
      { key: "arr", label: "Array ordenado", default: "1, 3, 5, 7, 9, 11, 13, 15, 17", parse: (s) => nums(s).sort((a, b) => a - b) },
      { key: "target", label: "Alvo", default: "13", parse: int },
    ],
    build: ({ arr, target }) => {
      const a = arr as number[];
      const t = target as number;
      const frames: Frame[] = [];
      let lo = 0;
      let hi = a.length - 1;
      frames.push({ cells: a, pointers: { lo, hi }, note: `Procurando ${t}. O intervalo de busca começa no array inteiro.` });
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const roles: Record<number, CellRole> = {};
        a.forEach((_, i) => {
          if (i < lo || i > hi) roles[i] = "muted";
        });
        roles[mid] = "compare";
        frames.push({ cells: a, roles, pointers: { lo, mid, hi }, vars: { lo, mid, hi }, note: `mid = (${lo} + ${hi}) / 2 = ${mid}. Comparando a[${mid}] = ${a[mid]} com ${t}.` });
        if (a[mid] === t) {
          frames.push({ cells: a, roles: { ...roles, [mid]: "found" }, pointers: { mid }, note: `Encontrado no índice ${mid}.` });
          return frames;
        }
        if (a[mid] < t) {
          lo = mid + 1;
          frames.push({ cells: a, roles, pointers: { lo, hi }, note: `${a[mid]} < ${t}: o alvo só pode estar à direita. lo = ${lo}.` });
        } else {
          hi = mid - 1;
          frames.push({ cells: a, roles, pointers: { lo, hi }, note: `${a[mid]} > ${t}: o alvo só pode estar à esquerda. hi = ${hi}.` });
        }
      }
      frames.push({ cells: a, roles: Object.fromEntries(a.map((_, i) => [i, "muted" as CellRole])), note: `lo passou de hi: ${t} não está no array.` });
      return frames;
    },
  },
  {
    slug: "two-pointers-par",
    title: "Two pointers: par com soma",
    category: "dsa-problemas",
    description: "Ponteiros opostos convergindo num array ordenado.",
    chapter: "dsa/intro-two-pointers",
    inputs: [
      { key: "arr", label: "Array ordenado", default: "1, 2, 4, 6, 8, 9, 14, 15", parse: (s) => nums(s).sort((a, b) => a - b) },
      { key: "target", label: "Soma alvo", default: "13", parse: int },
    ],
    build: ({ arr, target }) => {
      const a = arr as number[];
      const t = target as number;
      const frames: Frame[] = [];
      let l = 0;
      let r = a.length - 1;
      while (l < r) {
        const s = a[l] + a[r];
        frames.push({ cells: a, roles: { [l]: "compare", [r]: "compare" }, pointers: { esq: l, dir: r }, vars: { soma: s, alvo: t }, note: `${a[l]} + ${a[r]} = ${s}.` });
        if (s === t) {
          frames.push({ cells: a, roles: { [l]: "found", [r]: "found" }, pointers: { esq: l, dir: r }, note: `Achamos o par: índices ${l} e ${r}.` });
          return frames;
        }
        if (s < t) {
          frames.push({ cells: a, roles: { [l]: "muted" }, pointers: { esq: l + 1, dir: r }, note: `${s} < ${t}: precisamos de uma soma maior, então esq avança.` });
          l++;
        } else {
          frames.push({ cells: a, roles: { [r]: "muted" }, pointers: { esq: l, dir: r - 1 }, note: `${s} > ${t}: precisamos de uma soma menor, então dir recua.` });
          r--;
        }
      }
      frames.push({ cells: a, note: "Os ponteiros se encontraram: não existe par com essa soma." });
      return frames;
    },
  },
  {
    slug: "sliding-window-substring",
    title: "Sliding window: maior substring sem repetição",
    category: "dsa-problemas",
    description: "A janela cresce pela direita e encolhe pela esquerda ao achar repetição.",
    chapter: "dsa/maior-substring-sem-repeticao",
    inputs: [{ key: "s", label: "Texto", default: "abcabcbb", parse: text(16) }],
    build: ({ s }) => {
      const str = (s as string).split("");
      const frames: Frame[] = [];
      const seen = new Set<string>();
      let l = 0;
      let best = 0;
      let bestRange: [number, number] = [0, -1];
      const winRoles = (a: number, b: number) => Object.fromEntries(str.map((_, i) => [i, (i >= a && i <= b ? "window" : "muted") as CellRole]));
      for (let r = 0; r < str.length; r++) {
        while (seen.has(str[r])) {
          frames.push({ cells: str, roles: { ...winRoles(l, r - 1), [r]: "swap", [l]: "compare" }, pointers: { esq: l, dir: r }, vars: { janela: `{${[...seen].join(",")}}`, melhor: best }, note: `"${str[r]}" já está na janela. Removemos "${str[l]}" pela esquerda.` });
          seen.delete(str[l]);
          l++;
        }
        seen.add(str[r]);
        if (r - l + 1 > best) {
          best = r - l + 1;
          bestRange = [l, r];
        }
        frames.push({ cells: str, roles: winRoles(l, r), pointers: { esq: l, dir: r }, vars: { janela: `{${[...seen].join(",")}}`, tamanho: r - l + 1, melhor: best }, note: `Adicionamos "${str[r]}". Janela válida de tamanho ${r - l + 1}.` });
      }
      frames.push({ cells: str, roles: Object.fromEntries(str.map((_, i) => [i, (i >= bestRange[0] && i <= bestRange[1] ? "found" : "muted") as CellRole])), vars: { resposta: best }, note: `Resposta: ${best}.` });
      return frames;
    },
  },
  {
    slug: "bubble-sort",
    title: "Bubble sort",
    category: "dsa-conceitos",
    description: "Trocas de vizinhos fazem o maior elemento 'borbulhar' para o fim.",
    chapter: "dsa/intro-ordenacao",
    inputs: [{ key: "arr", label: "Array", default: "5, 1, 4, 2, 8, 3", parse: nums }],
    build: ({ arr }) => {
      const a = [...(arr as number[])];
      const frames: Frame[] = [];
      const done = new Set<number>();
      const base = () => Object.fromEntries([...done].map((i) => [i, "done" as CellRole]));
      for (let end = a.length - 1; end > 0; end--) {
        let swapped = false;
        for (let i = 0; i < end; i++) {
          frames.push({ cells: [...a], roles: { ...base(), [i]: "compare", [i + 1]: "compare" }, note: `Comparando ${a[i]} e ${a[i + 1]}.` });
          if (a[i] > a[i + 1]) {
            [a[i], a[i + 1]] = [a[i + 1], a[i]];
            swapped = true;
            frames.push({ cells: [...a], roles: { ...base(), [i]: "swap", [i + 1]: "swap" }, note: `Fora de ordem: trocamos.` });
          }
        }
        done.add(end);
        frames.push({ cells: [...a], roles: base(), note: `${a[end]} está na posição final.` });
        if (!swapped) {
          a.forEach((_, i) => done.add(i));
          frames.push({ cells: [...a], roles: base(), note: "Nenhuma troca nesta passada: o array já está ordenado." });
          return frames;
        }
      }
      done.add(0);
      frames.push({ cells: [...a], roles: base(), note: "Array ordenado." });
      return frames;
    },
  },
  {
    slug: "insertion-sort",
    title: "Insertion sort",
    category: "dsa-conceitos",
    description: "Cada elemento é inserido na posição certa da parte já ordenada.",
    chapter: "dsa/intro-ordenacao",
    inputs: [{ key: "arr", label: "Array", default: "7, 3, 5, 1, 9, 2", parse: nums }],
    build: ({ arr }) => {
      const a = [...(arr as number[])];
      const frames: Frame[] = [{ cells: [...a], roles: { 0: "done" }, note: "O primeiro elemento sozinho já é uma parte ordenada." }];
      for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        frames.push({ cells: [...a], roles: { ...Object.fromEntries(Array.from({ length: i }, (_, k) => [k, "done" as CellRole])), [i]: "active" }, vars: { chave: key }, note: `Inserindo ${key} na parte ordenada.` });
        while (j >= 0 && a[j] > key) {
          a[j + 1] = a[j];
          frames.push({ cells: [...a], roles: { [j]: "compare", [j + 1]: "swap" }, vars: { chave: key }, note: `${a[j]} > ${key}: desloca ${a[j]} uma casa para a direita.` });
          j--;
        }
        a[j + 1] = key;
        frames.push({ cells: [...a], roles: { ...Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [k, "done" as CellRole])), [j + 1]: "found" }, note: `${key} entra no índice ${j + 1}.` });
      }
      frames.push({ cells: [...a], roles: Object.fromEntries(a.map((_, i) => [i, "done" as CellRole])), note: "Array ordenado." });
      return frames;
    },
  },
  {
    slug: "kadane",
    title: "Algoritmo de Kadane",
    category: "dsa-problemas",
    description: "Manter ou recomeçar o subarray: a decisão que dá O(n).",
    chapter: "dsa/intro-kadane",
    inputs: [{ key: "arr", label: "Array", default: "-2, 1, -3, 4, -1, 2, 1, -5, 4", parse: nums }],
    build: ({ arr }) => {
      const a = arr as number[];
      const frames: Frame[] = [];
      let cur = a[0];
      let best = a[0];
      let start = 0;
      let bs = 0;
      let be = 0;
      const range = (x: number, y: number, role: CellRole) => Object.fromEntries(a.map((_, i) => [i, (i >= x && i <= y ? role : "muted") as CellRole]));
      frames.push({ cells: a, roles: range(0, 0, "window"), vars: { atual: cur, melhor: best }, note: `Começamos com o primeiro elemento: atual = melhor = ${a[0]}.` });
      for (let i = 1; i < a.length; i++) {
        if (cur + a[i] < a[i]) {
          frames.push({ cells: a, roles: { ...range(start, i - 1, "muted"), [i]: "active" }, vars: { atual: cur, "a[i]": a[i] }, note: `${cur} + ${a[i]} < ${a[i]}: carregar o passado só atrapalha. Recomeçamos em ${a[i]}.` });
          cur = a[i];
          start = i;
        } else {
          cur += a[i];
          frames.push({ cells: a, roles: range(start, i, "window"), vars: { atual: cur }, note: `Estendemos o subarray: atual = ${cur}.` });
        }
        if (cur > best) {
          best = cur;
          bs = start;
          be = i;
          frames.push({ cells: a, roles: range(start, i, "found"), vars: { atual: cur, melhor: best }, note: `Novo melhor: ${best}.` });
        }
      }
      frames.push({ cells: a, roles: range(bs, be, "found"), vars: { resposta: best }, note: `Maior soma: ${best} (índices ${bs} a ${be}).` });
      return frames;
    },
  },
  {
    slug: "pilha-parenteses",
    title: "Pilha: parênteses válidos",
    category: "dsa-problemas",
    description: "Cada fechamento precisa casar com o último aberto.",
    chapter: "dsa/parenteses-validos",
    inputs: [{ key: "s", label: "Expressão", default: "{[()()]}", parse: text(16) }],
    build: ({ s }) => {
      const str = (s as string).split("");
      const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
      const stack: string[] = [];
      const frames: Frame[] = [];
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (!(ch in pairs)) {
          stack.push(ch);
          frames.push({ cells: str, roles: { [i]: "active" }, pointers: { i }, stack: [...stack], note: `"${ch}" abre: empilhamos.` });
        } else if (stack.length && stack[stack.length - 1] === pairs[ch]) {
          stack.pop();
          frames.push({ cells: str, roles: { [i]: "found" }, pointers: { i }, stack: [...stack], note: `"${ch}" fecha o "${pairs[ch]}" do topo: desempilhamos.` });
        } else {
          frames.push({ cells: str, roles: { [i]: "swap" }, pointers: { i }, stack: [...stack], note: `"${ch}" não casa com o topo ${stack.length ? `"${stack[stack.length - 1]}"` : "(pilha vazia)"}: inválida.` });
          return frames;
        }
      }
      frames.push({ cells: str, stack: [...stack], note: stack.length ? "Sobraram aberturas na pilha: inválida." : "Pilha vazia no fim: expressão válida." });
      return frames;
    },
  },
  {
    slug: "bfs-ilhas",
    title: "BFS em grade: número de ilhas",
    category: "dsa-problemas",
    description: "Cada '1' não visitado inicia uma busca que afunda a ilha inteira.",
    chapter: "dsa/numero-de-ilhas",
    inputs: [
      {
        key: "grid",
        label: "Grade (linhas separadas por /)",
        default: "11000/11010/00100/00011",
        parse: (s) => {
          const rows = s.split("/").map((r) => r.trim());
          if (!rows.length || rows.some((r) => !/^[01]+$/.test(r) || r.length !== rows[0].length) || rows.length > 8 || rows[0].length > 10)
            throw new Error("Use até 8 linhas de até 10 dígitos 0/1, todas do mesmo tamanho.");
          return rows.map((r) => r.split(""));
        },
      },
    ],
    build: ({ grid }) => {
      const g = (grid as string[][]).map((r) => [...r]);
      const R = g.length;
      const C = g[0].length;
      const roles: Record<string, CellRole> = {};
      const frames: Frame[] = [];
      let islands = 0;
      const snap = (note: string, extra: Record<string, CellRole> = {}) =>
        frames.push({ grid: g.map((r) => [...r]), gridRoles: { ...roles, ...extra }, vars: { ilhas: islands }, note });
      snap("Percorremos a grade procurando terra ('1') ainda não visitada.");
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          if (g[r][c] !== "1" || roles[`${r},${c}`]) continue;
          islands++;
          const q: Array<[number, number]> = [[r, c]];
          roles[`${r},${c}`] = "active";
          snap(`Nova ilha em (${r}, ${c}). Iniciamos uma BFS a partir dela.`);
          while (q.length) {
            const [x, y] = q.shift()!;
            roles[`${x},${y}`] = "done";
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] === "1" && !roles[`${nx},${ny}`]) {
                roles[`${nx},${ny}`] = "active";
                q.push([nx, ny]);
              }
            }
            snap(`Visitamos (${x}, ${y}) e enfileiramos os vizinhos de terra.`, { [`${x},${y}`]: "compare" });
          }
        }
      }
      snap(`Fim: ${islands} ilha(s).`);
      return frames;
    },
  },
  {
    slug: "round-robin",
    title: "Load balancer: round robin vs menos conexões",
    category: "system-design",
    description: "Como cada algoritmo distribui requisições de durações diferentes.",
    chapter: "system-design/algoritmos-balanceamento",
    inputs: [
      { key: "reqs", label: "Duração de cada requisição (unidades)", default: "5, 1, 1, 5, 1, 1, 5, 1, 1", parse: nums },
      { key: "mode", label: "Algoritmo (rr ou lc)", default: "rr", parse: (s) => { if (s !== "rr" && s !== "lc") throw new Error("Use rr (round robin) ou lc (menos conexões)."); return s; } },
    ],
    build: ({ reqs, mode }) => {
      const r = reqs as number[];
      const servers = [{ name: "S1", load: 0 }, { name: "S2", load: 0 }, { name: "S3", load: 0 }];
      const frames: Frame[] = [{ servers: servers.map((s) => ({ ...s })), note: mode === "rr" ? "Round robin: cada requisição vai para o próximo servidor da fila, sem olhar a carga." : "Menos conexões: cada requisição vai para o servidor com menor carga atual." }];
      r.forEach((d, i) => {
        const idx = mode === "rr" ? i % 3 : servers.reduce((m, s, k) => (s.load < servers[m].load ? k : m), 0);
        servers[idx].load += d;
        frames.push({ servers: servers.map((s, k) => ({ ...s, active: k === idx })), vars: { requisição: i + 1, duração: d }, note: `Requisição ${i + 1} (custo ${d}) → ${servers[idx].name}.` });
      });
      const max = Math.max(...servers.map((s) => s.load));
      const min = Math.min(...servers.map((s) => s.load));
      frames.push({ servers: servers.map((s) => ({ ...s })), vars: { desequilíbrio: max - min }, note: `Carga final: ${servers.map((s) => `${s.name}=${s.load}`).join(", ")}. Diferença entre o mais e o menos carregado: ${max - min}.` });
      return frames;
    },
  },
  {
    slug: "hashing-consistente",
    title: "Hashing consistente",
    category: "system-design",
    description: "Ao adicionar um servidor, só as chaves de um trecho do anel mudam de dono.",
    chapter: "system-design/hashing-consistente",
    inputs: [{ key: "keys", label: "Chaves", default: "user:1, user:2, user:3, cart:9, img:7, sess:4, ord:5", parse: (s) => { const k = s.split(",").map((x) => x.trim()).filter(Boolean); if (!k.length || k.length > 12) throw new Error("Use de 1 a 12 chaves."); return k; } }],
    build: ({ keys }) => {
      const hash = (s: string) => {
        let h = 2166136261;
        for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
        return ((h >>> 0) % 360);
      };
      const owner = (angle: number, servers: Array<{ label: string; angle: number }>) => {
        const sorted = [...servers].sort((a, b) => a.angle - b.angle);
        return (sorted.find((s) => s.angle >= angle) ?? sorted[0]).label;
      };
      const k = keys as string[];
      const base = [{ label: "A", angle: hash("server-A") }, { label: "B", angle: hash("server-B") }, { label: "C", angle: hash("server-C") }];
      const ring = (servers: typeof base) => ({
        nodes: [
          ...servers.map((s) => ({ ...s, kind: "server" as const })),
          ...k.map((key) => ({ label: key, angle: hash(key), kind: "key" as const, owner: owner(hash(key), servers) })),
        ],
      });
      const before = ring(base);
      const withD = [...base, { label: "D", angle: hash("server-D") }];
      const after = ring(withD);
      // Os servidores vêm antes das chaves; compara cada chave com ela mesma antes de adicionar D.
      const keyOwner = (nodes: NonNullable<Frame["ring"]>["nodes"]) =>
        new Map(nodes.filter((n) => n.kind === "key").map((n) => [n.label, n.owner]));
      const ownersBefore = keyOwner(before.nodes);
      const moved = [...keyOwner(after.nodes)].filter(([label, o]) => ownersBefore.get(label) !== o).map(([label]) => label);
      return [
        { ring: { nodes: base.map((s) => ({ ...s, kind: "server" as const })) }, note: "Servidores são posicionados no anel pelo hash do nome." },
        { ring: before, note: "Cada chave pertence ao primeiro servidor no sentido horário a partir do seu hash." },
        { ring: after, vars: { "chaves movidas": moved.length, total: k.length }, note: `Adicionamos o servidor D. Só ${moved.length} de ${k.length} chave(s) mudaram de dono${moved.length ? ` (${moved.join(", ")})` : ""}; com hash % N, quase todas mudariam.` },
      ];
    },
  },
];

export const CATEGORIES: Record<AnimationDef["category"], { title: string; description: string }> = {
  "dsa-conceitos": { title: "Conceitos de DSA", description: "Estruturas e algoritmos fundamentais, passo a passo." },
  "dsa-problemas": { title: "Problemas de DSA", description: "Padrões clássicos aplicados a problemas de entrevista." },
  "system-design": { title: "System Design", description: "Como componentes distribuídos se comportam." },
};

export function getAnimation(slug: string) {
  return ANIMATIONS.find((a) => a.slug === slug) ?? null;
}
