# Abas de código em 7 linguagens: como continuar

Cada bloco ```` ```python ```` de uma aula pode virar um grupo `<CodeTabs>` com 7 abas, nesta ordem:
python, javascript, typescript, java, cpp, csharp, go.

## Estado (fim da sessão de 03/11/2026)

| Curso | Com abas | Observação |
|---|---|---|
| dsa | 50 de 50 | completo |
| system-design | 29 de 71 | o resto são fragmentos que usam nomes não definidos no bloco (`banco`, `repo`, `cache`, `fila`), SDKs específicos (JWT, Prometheus, boto) ou hash (md5/sha, sem equivalente em C++); ficam só em Python |
| system-design-interviews | 10 de 14 | idem |
| lld | 95 de 107 | completo no que dá: dos 12 restantes, 8 não têm bloco Python (são conceituais) e 4 ficam só em Python de propósito (abaixo) |
| concorrencia, redes, sistemas-operacionais, ai-engineering, genai-system-design, ml-system-design | 0 | decisão de escopo: o código depende de APIs do Python (`threading`, `struct`, `socket`, `os`, `math`, `random`); uma versão em outra linguagem seria outro programa |

Capítulos de LLD deixados só em Python de propósito:

- `abstract-factory`: usa HMAC com SHA-256 e SHA-1 (C++ não tem isso na biblioteca padrão).
- `facade`: imprime um id baseado em `hash()`, diferente em cada linguagem.
- `template-method` e `realizacao`: parseiam JSON, que Java, C++ e C# não têm na biblioteca padrão.

Diferenças esperadas entre a saída do Python e a das outras linguagens (não são erros):

- `flyweight`: a última linha do Python (`sys.getsizeof`) não tem equivalente portátil e foi omitida.
- `iterator` (ordem do embaralhamento) e `cobras-e-escadas` (partida aleatória): dependem do gerador de cada linguagem.
- `notificacoes-lld`: a ordem do `set` do Python muda a cada execução (`PYTHONHASHSEED`); as outras linguagens usam a ordem de inserção.
- `quadtrees` e `algoritmos-balanceamento`: usam números aleatórios, então o resultado impresso varia (a lógica é a mesma).
- `interfaces`: a linha do `TypeError` ao instanciar o contrato só existe em Python e JavaScript; em Java, C++, C# e TypeScript isso é erro de compilação.

## Ferramentas (em `scripts/`)

- `apply-tabs.mjs <capitulo.mdx> <pasta>`: envolve o N-ésimo bloco Python solto em `<CodeTabs>` e acrescenta os blocos
  de `<pasta>/N.md` (javascript, typescript, java, cpp, csharp, go, nessa ordem). Se faltar `N.md`, o bloco fica só em Python.
- `check-code-tabs.mjs <arquivos>`: confere a estrutura (7 abas, na ordem certa). Só se aplica ao DSA, onde todo bloco Python é traduzido.
- `check-tabs-run.ts <arquivos>`: executa cada grupo (Python local, JS local, o resto no Judge0) e compara a saída com a do Python.
  `npx tsx --conditions react-server scripts/check-tabs-run.ts content/courses/lld/<aula>.mdx`
  Variável `ONLY_LANGS=java,cpp` limita as linguagens. A comparação ignora colchetes, aspas, vírgulas, `{}`, `:`, `=`,
  maiúsculas, `x.0` vs `x` e `null/nil/None`. Blocos que dependem de blocos anteriores são encadeados sozinhos.
- `force-print.mjs <capitulo.mdx> <copia.mdx>`: o verificador acima SÓ compara as saídas quando o bloco Python tem um `print(`
  na coluna 0. Sem isso (blocos com `if __name__ == "__main__":` ou só com `assert`) ele apenas confere que compila.
  Este script grava uma cópia, FORA de `content/`, em que todo bloco Python passa a ter um `print(`; rode o `check-tabs-run.ts`
  nessa cópia. Foi assim que apareceram erros que a verificação normal não via.

## Armadilhas do Judge0 (descobertas na prática)

- Java é o 13: sem `instanceof` com padrão, sem `record`, sem blocos de texto. Os trechos são "estilo aula" (métodos soltos e `main`);
  o verificador os embrulha em `class Main`.
- TypeScript é antigo: sem a palavra `override`.
- C#/Mono: não existe `PriorityQueue`; literais com separador (`1_000_000_007L`) saem errados; sem tuplas (`ValueTuple`) em arrays.
- O verificador embrulha o C# em `class Program`: métodos de extensão (`this T x`) e `global::Tipo` não funcionam; use métodos estáticos comuns.
- C# (Mono): `ArgumentOutOfRangeException(string)` trata o texto como nome do parâmetro (a mensagem sai errada); use `ArgumentException`.
- C++ precisa de `-pthread` para `std::thread` (já configurado em `src/lib/judge0.ts`).
- Go é o 1.18: sem `min`/`max` embutidos.
- TypeScript compila com a biblioteca do DOM: nomes de variável de topo como `status`, `name`, `history` e `length` colidem com
  globais. Use outro nome.
- TypeScript: `Generator<T>` sem os outros parâmetros não aceita `yield*`; use `IterableIterator<T>`.
- JavaScript/TypeScript com `Math.random` sem semente deixam o teste instável; use um gerador com semente (mulberry32).
- Java: uma constante `static final` de uma classe não é visível em outra sem qualificar (`Postagem.PONTOS_ACEITA`).
- `cout << a << b` imprime `a` antes de avaliar `b`; Python avalia o f-string inteiro antes. Calcule antes de imprimir.
- Saídas com relógio, `hash()` ou aleatoriedade nunca coincidem entre linguagens (é esperado); confira só que rodam.

## Rodar o app

`npm run dev` é lento (5 a 14 s por página). Para navegar rápido: `npm run build && npm start` (o build leva cerca de 3 min,
e é preciso refazê-lo depois de editar conteúdo).
