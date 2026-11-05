# Abas de código em 7 linguagens: como continuar

Cada bloco ```` ```python ```` de uma aula pode virar um grupo `<CodeTabs>` com 7 abas, nesta ordem:
python, javascript, typescript, java, cpp, csharp, go.

## Estado (fim da sessão de 03/11/2026)

| Curso | Com abas | Observação |
|---|---|---|
| dsa | 50 de 50 | completo |
| system-design | 63 de 71 | os 8 restantes ficam só em Python (abaixo) |
| system-design-interviews | 13 de 14 | só `spark` fica em Python (abaixo) |
| lld | 99 de 107 | completo: os 8 restantes não têm bloco Python (são conceituais) |
| sistemas-operacionais | 42 de 47 | completo (05/11): os 5 restantes ficam só em Python (subprocess, mmap com filho, os.read/os.pipe, 1 fragmento). Sem JS/TS em regiao-critica #2, semaforos-e-monitores #1 e #2 e memoria-virtual #2 |
| redes | 41 de 51 | completo (05/11): ficam só em Python os 8 blocos com socket/servidor HTTP local (Judge0 sem rede) e os 2 sobre o módulo `ipaddress` |
| concorrencia, ai-engineering, genai-system-design, ml-system-design | 0 | decisão de 03/11 revista em 05/11: ver "Triagem dos 6 cursos restantes" abaixo |

## Triagem dos 6 cursos restantes (05/11/2026)

A premissa de 03/11 ("o código depende de APIs do Python") não se confirmou: lendo os 253 blocos, a maioria é lógica pura com a biblioteca padrão.
A = tradução fiel (saída comparável), B = tradução idiomática (conceito existe, API muda), C = fica só em Python.

| Curso | A | B | C | Observação |
|---|---|---|---|---|
| sistemas-operacionais | 36 | 6 | 5 | simuladores (escalonamento, paginação, banqueiro). C: subprocess, mmap com processo filho, os.read/os.pipe crus, 1 fragmento |
| redes | 40 | 9 | 2 | simulações e cabeçalhos byte a byte (`struct.pack` → ByteBuffer/DataView/encoding/binary). B = sockets: o Judge0 NÃO tem rede nem localhost (`network is unreachable`), então só `COMPILE_ONLY`. C: os 2 blocos sobre o módulo `ipaddress` |
| genai-system-design | 22 | 3 | 0 | 15 blocos são só contas de estimativa |
| ai-engineering | 35 | 11 | 1 | nenhum SDK/LLM real. Cuidados: JSON em Java/C++/C# (extrator mínimo), regex `\w` com acentos, `round()` do Python arredonda para o par |
| ml-system-design | 17 | 3 | 0 | 15 de 20 usam `random` com semente: a "Saída:" do texto não bate em outras linguagens. Traduzir só os determinísticos (metricas, feed-de-noticias, busca-semantica, feature-stores, pipelines-de-dados, framework-de-entrevista) |
| concorrencia | 5 | 48 | 10 | threads/locks/filas: traduzir só java, cpp, csharp, go (JS/TS não têm memória compartilhada; omitir essas abas). C: aula do GIL, multiprocessing, asyncio entre awaits, BoundedSemaphore, fragmentos. Saída depende de tempo: `COMPILE_ONLY` na maioria |

Ordem combinada: sistemas-operacionais → redes (só A) → genai-system-design → ai-engineering → concorrencia → ml-system-design (só determinísticos).

Um grupo `<CodeTabs>` pode ter menos de 7 abas: as abas saem dos blocos presentes. Para omitir JS/TS, deixe o `<N>.md` só com java, cpp, csharp, go.

Em LLD, `abstract-factory` (SHA-1 e HMAC escritos à mão em C++), `facade` (id de transação calculado por cada linguagem), `template-method` (JSON mínimo em Java/C++/C#) e `realizacao` também têm abas. Em `facade` a saída não é comparável (o `hash()` do Python muda a cada execução), então vale `COMPILE_ONLY=1`.

Capítulos de system-design deixados só em Python de propósito (o núcleo é um SDK ou DSL de terceiros, que não roda no Judge0 e não tem equivalente fiel em outra linguagem):

- `armazenamento-de-senhas` (argon2), `jwt` (PyJWT), `metricas` (prometheus_client), `object-storage` (boto3), `pool-de-conexoes` (psycopg_pool), `tracing-distribuido` (opentelemetry), `s2-h3` (biblioteca h3), `motores-de-streaming` (pseudo-DSL) e, em interviews, `spark` (PySpark).

Traduções de fragmentos (system-design): os blocos que usam nomes não definidos (`banco`, `fila`, `cache`...) ganham, em cada aba, peças de apoio mínimas com o comentário "peças de apoio do exemplo". Como o Python desses blocos dá NameError, a verificação é só de compilação/execução: `COMPILE_ONLY=1 npx tsx --conditions react-server scripts/check-tabs-run.ts <arquivos>` compila e roda todas as abas sem comparar a saída.

Hash em C++: SHA-256, MD5, CRC32 e HMAC-SHA256 foram escritos à mão (conferidos contra hashlib/zlib/hmac do Python). Em TypeScript, `crypto` entra com `declare const require: any;`; em C# o Mono não tem BigInteger (usar divisão manual de hex).

Diferenças esperadas entre a saída do Python e a das outras linguagens (não são erros):

- `flyweight`: a última linha do Python (`sys.getsizeof`) não tem equivalente portátil e foi omitida.
- `iterator` (ordem do embaralhamento) e `cobras-e-escadas` (partida aleatória): dependem do gerador de cada linguagem.
- `template-method`: Java, C++ e C# leem o JSON com um extrator mínimo (a biblioteca padrão não traz parser); o arquivo usa o escape `\u`+`FEFF` para o BOM, nunca o caractere literal.
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
- C++ precisa de `-pthread` para `std::thread` (já configurado em `src/lib/judge0.ts`). Desde 05/11 também compila com `-std=c++20`
  (GCC 14), o que libera `<semaphore>`, `<latch>` e `<barrier>`.
- C++ com `using namespace std` + `<mutex>`/`<chrono>`: nomes globais como `pico`, `nano`, `micro`, `milli`, `kilo`, `mega`
  colidem com os `std::ratio` de `<ratio>` ("reference to 'pico' is ambiguous"). Tire o `using namespace std` ou renomeie.
- Formatos do Python: `{:,}` → Java `%,` com `Locale.US`, C# `N` com `InvariantCulture`, JS `toLocaleString("en-US")`, C++/Go à mão.
  `{:g}` → C++/Go `%g` e C# `"g6"` batem; Java `%g` é diferente e JS não tem (função própria). C++20 tem `std::format`.
- C# (Mono): parâmetro de lambda com o mesmo nome de uma variável local declarada depois no método dá CS0136; use outro nome.
- Prints dentro de laços não contam para o verificador: na prática rode SEMPRE também a cópia do `force-print.mjs`.
- C#: desempate por string com `string.CompareOrdinal` (a comparação padrão depende da cultura).
- Go: `uint32(0xFFFFFFFF) << (32 - 24)` não compila (deslocar constante gera constante que estoura); desloque por uma variável.
  `binary.BigEndian.AppendUint32/16` só existe a partir do Go 1.19: use `PutUint32/16`.
- TypeScript: `Buffer` não está declarado; use `declare const require: any; const { Buffer } = require("buffer");`.
- Sem rede nenhuma, nem 127.0.0.1: código com socket só pode ser verificado com `COMPILE_ONLY=1`.
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
