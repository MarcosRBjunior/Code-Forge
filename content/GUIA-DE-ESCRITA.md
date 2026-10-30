# Guia de escrita de capítulos

Todo capítulo é um arquivo `content/courses/<curso>/<slug>.mdx`. O slug e o título vêm do `course.json` do curso.

## Regras gerais

- Texto **original** em português do Brasil. Não copie nem parafraseie de perto material de terceiros (AlgoMaster, LeetCode, livros, blogs).
- Tom: direto, didático, em segunda pessoa ("você"), sem enrolação. Termos técnicos consagrados podem ficar em inglês (cache, sharding, load balancer).
- Frontmatter mínimo:
  ```yaml
  ---
  title: <exatamente o título do course.json>
  kind: lesson        # lesson | problem | quiz
  ---
  ```
- Use `## ` para seções e `### ` para subseções. Comece direto no conteúdo, sem repetir o título.
- Componentes permitidos (e só estes):
  - `<Callout type="note|tip|warning" title="...">texto</Callout>`, no máximo 2 por capítulo.
  - `<Quiz question="..." options={["A", "B", "C", "D"]} answer={1} explanation="..." />`, em que `answer` é o índice da opção certa, começando em 0.
  - `<Animation slug="busca-binaria" />`: embute uma animação passo a passo de `src/lib/animations.ts` no ponto do texto. Use uma por conceito, logo depois de explicar a ideia.
  - `<CodeTabs>` envolvendo blocos de código seguidos, um por linguagem: vira um bloco com abas, e a linguagem escolhida é a mesma do editor. Nas aulas de DSA, todo exemplo de código usa as 7 linguagens nesta ordem: python, javascript, typescript, java, cpp, csharp, go. Deixe uma linha em branco depois de `<CodeTabs>` e antes de `</CodeTabs>`. Confira com `node scripts/check-code-tabs.mjs <arquivo>`.
  - `<QuizSet>` envolvendo vários `<Quiz />`: mostra uma pergunta por vez com "1 / N" e botões Anterior/Próxima.
- MDX: **não** use `{` `}` nem `<` soltos no texto corrido. Dentro de blocos de código e de `inline code` pode. Para comparações no texto, escreva "menor que" ou use `a < b` em código. Aspas duplas dentro de props devem virar aspas simples ou “tipográficas”.
- Blocos de código com linguagem (```python, ```java, ```text, ```sql, ```json, ```yaml, ```bash). Use ```text para diagramas ASCII.
- Tabelas Markdown são bem-vindas para comparações e trade-offs.

## Aulas (`kind: lesson`)

- 400 a 800 palavras de texto (System Design e LLD podem chegar a 1.000).
- Estrutura sugerida: o problema que o conceito resolve → como funciona → exemplo concreto (código ou diagrama) → trade-offs ou armadilhas → "Na entrevista" (como citar o tópico, perguntas de follow-up comuns).
- Termine com 1 a 3 perguntas de fixação num `<QuizSet>`. É opcional, mas recomendado.
- LLD: exemplos em Python, com classes pequenas e completas que rodam.

## Exercícios/quiz (`kind: quiz`)

- Uma frase de introdução e depois um `<QuizSet>` com 5 a 8 `<Quiz />` sobre os capítulos do módulo. Misture perguntas conceituais e de cenário ("seu serviço tem X; o que fazer?"). Cada uma com `explanation`.

## Comportamental

- 300 a 600 palavras: o que o entrevistador quer avaliar, a estrutura de uma boa resposta, uma **resposta-exemplo** curta em formato STAR (com personagem e situação fictícios), erros comuns e variações da pergunta.

## Validação obrigatória

Antes de terminar, rode na pasta `codeforge`:

```bash
node scripts/check-content.mjs content/courses/<curso>/<slug>.mdx [...]
```

Corrija tudo até aparecer "N/N capítulos OK".

## Problemas (`kind: problem`)

Veja `content/courses/dsa/two-sum.mdx` (função simples), `move-zeroes.mdx` (in-place com `checkArg`) e `subconjuntos.mdx` (`compare`).

Frontmatter:

```yaml
title: ...
kind: problem
difficulty: easy | medium | hard
fn: nome_em_python          # função (ou classe, se design: true)
fnJs: nomeEmJavaScript
starter:
  python: |
    def nome_em_python(nums, k):
        # comentário curto do que retornar
        pass
  javascript: |
    function nomeEmJavaScript(nums, k) {
      // comentário curto do que retornar
    }
tests:                      # 5 a 8 casos, incluindo bordas
  - input: [[1, 2, 3], 2]   # lista de ARGUMENTOS (fn(*input))
    expected: 3
```

Campos opcionais:
- `checkArg: 0`: a função modifica o argumento 0 in-place e os testes comparam esse argumento.
- `compare: unordered`: a ordem da lista externa da resposta não importa. Com `unordered-deep`, nenhuma ordem importa, nem a das listas internas.
- `argTypes: [linkedlist, null]` e `returnType: linkedlist`: o harness converte `[1,2,3]` em `ListNode` e vice-versa. `ListNode(val, next)` já existe nas duas linguagens.
- `argTypes: [cyclelist]`: o argumento é `[[3,2,0,-4], 1]`, ou seja, a lista e a posição para onde o último nó aponta (`-1` = sem ciclo).
- `argTypes: [tree]` e `returnType: tree`: a árvore vem em ordem de nível com `null`, como `[3,9,20,null,null,15,7]`. `TreeNode(val, left, right)` já existe.
- `argTypes: [tree, treenode, treenode]`: os argumentos `treenode` são valores que o harness troca pelo nó correspondente da primeira árvore. `returnType: treenode` devolve o valor do nó.
- `design: true`: `fn`/`fnJs` é o nome de uma **classe**. Cada teste é `input: [["Classe","metodo1","metodo2"], [[args do construtor],[args1],[args2]]]` e `expected: [null, ret1, ret2]`. Métodos sem retorno dão `null`. Use nomes de método em camelCase; em Python o harness também aceita a versão snake_case (`getMin` → `get_min`).

Corpo: enunciado em 1 a 3 parágrafos, `## Exemplo` (bloco ```text), `## Restrições` (lista curta), `## Dica` (não entrega a solução).

**Validação obrigatória**: escreva soluções de referência `sol.py` e `sol.js` numa pasta temporária, **fora** do projeto, e rode
`node scripts/check-problem.mjs content/courses/<curso>/<slug>.mdx sol.py sol.js`.
Ele usa o mesmo executor do navegador. Só considere pronto com ✓ nas duas linguagens. Também rode `check-content.mjs`.
