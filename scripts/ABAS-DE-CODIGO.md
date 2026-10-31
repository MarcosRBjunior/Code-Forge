# Abas de código em 7 linguagens: como continuar

Cada bloco ```` ```python ```` de uma aula pode virar um grupo `<CodeTabs>` com 7 abas, nesta ordem:
python, javascript, typescript, java, cpp, csharp, go.

## Estado (fim da sessão de 31/10/2026)

| Curso | Com abas | Observação |
|---|---|---|
| dsa | 50 de 50 | completo |
| system-design | 21 de 71 | o resto é pseudocódigo de infraestrutura (bancos, filas, SDKs) ou depende de SHA-256/MD5; fica só em Python |
| system-design-interviews | 9 de 14 | idem |
| lld | ver `grep -l '<CodeTabs>' content/courses/lld/*.mdx \| wc -l` (de 99) | em andamento |
| concorrencia, redes, sistemas-operacionais, ai-engineering, genai-system-design, ml-system-design | 0 | decisão de escopo: o código depende de APIs do Python (`threading`, `struct`, `socket`, `os`, `math`, `random`); uma versão em outra linguagem seria outro programa |

Capítulos de LLD já traduzidos: singleton, adapter, decorator, strategy, observer, state, composite, command,
builder, factory-method, proxy, como-aprender-lld, casos-de-uso, yagni, escolher-padroes, diagrama-de-atividades,
produtor-consumidor, diagrama-de-classes, kiss, maquina-de-estados, intro-padroes, mvc, lld-vs-hld, o-que-e-lld,
concorrencia-lld, codigo-limpo, tipos-de-entrevista-lld, machine-coding, injecao-de-dependencia
(e os da última rodada, se estiverem com `<CodeTabs>`).

Deixados de lado de propósito: `facade` (imprime um id baseado em `hash()`, diferente em cada linguagem) e
`template-method` (parseia JSON, que Java, C++ e C# não têm na biblioteca padrão).

## Ferramentas (em `scripts/`)

- `apply-tabs.mjs <capitulo.mdx> <pasta>`: envolve o N-ésimo bloco Python solto em `<CodeTabs>` e acrescenta os blocos
  de `<pasta>/N.md` (javascript, typescript, java, cpp, csharp, go, nessa ordem). Se faltar `N.md`, o bloco fica só em Python.
- `check-code-tabs.mjs <arquivos>`: confere a estrutura (7 abas, na ordem certa). Só se aplica ao DSA, onde todo bloco Python é traduzido.
- `check-tabs-run.ts <arquivos>`: executa cada grupo (Python local, JS local, o resto no Judge0) e compara a saída com a do Python.
  `npx tsx --conditions react-server scripts/check-tabs-run.ts content/courses/lld/<aula>.mdx`
  Variável `ONLY_LANGS=java,cpp` limita as linguagens. A comparação ignora colchetes, aspas, vírgulas, `{}`, `:`, `=`,
  maiúsculas, `x.0` vs `x` e `null/nil/None`. Blocos que dependem de blocos anteriores são encadeados sozinhos.

## Armadilhas do Judge0 (descobertas na prática)

- Java é o 13: sem `instanceof` com padrão, sem `record`, sem blocos de texto. Os trechos são "estilo aula" (métodos soltos e `main`);
  o verificador os embrulha em `class Main`.
- TypeScript é antigo: sem a palavra `override`.
- C#/Mono: não existe `PriorityQueue`; literais com separador (`1_000_000_007L`) saem errados; sem tuplas (`ValueTuple`) em arrays.
- C++ precisa de `-pthread` para `std::thread` (já configurado em `src/lib/judge0.ts`).
- Go é o 1.18: sem `min`/`max` embutidos.
- `cout << a << b` imprime `a` antes de avaliar `b`; Python avalia o f-string inteiro antes. Calcule antes de imprimir.
- Saídas com relógio, `hash()` ou aleatoriedade nunca coincidem entre linguagens (é esperado); confira só que rodam.

## Rodar o app

`npm run dev` é lento (5 a 14 s por página). Para navegar rápido: `npm run build && npm start` (o build leva cerca de 3 min,
e é preciso refazê-lo depois de editar conteúdo).
