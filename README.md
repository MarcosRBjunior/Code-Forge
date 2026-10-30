# CodeForge (versão pessoal)

Plataforma de estudo para entrevistas de engenharia, para um único usuário, inspirada na estrutura do AlgoMaster.io. Todo o texto é original. Tudo roda em serviços gratuitos.

## O que tem

| Área | Recursos |
|---|---|
| Cursos | DSA, System Design, Entrevistas de System Design, Low Level Design e Comportamental. Capítulos ainda não escritos aparecem como "em breve" |
| Leitor | Destaques em 5 cores, notas, caderno com busca e exportação `.md`, áudio com destaque palavra a palavra, modo livro (tecla B), progresso de leitura, sumário com seção ativa, tema claro/escuro e ajustes de fonte e largura |
| Prática | Editor Monaco com Python, JavaScript e TypeScript rodando no navegador e Java, C++, C# e Go compilados num serviço externo (Judge0), com código inicial gerado dos testes (listas, árvores e design de classes só em Python, JS e TS), testes por caso, rascunhos salvos, suporte a listas ligadas, árvores e classes de design; catálogo agrupado por padrão, filtros e problema aleatório |
| Entrevista | Mock interview cronometrada (estilo, nível, modo sem executar, mistura de dificuldades), avaliação nas 6 áreas da rubrica com nota de 0 a 100 e histórico |
| Revisão | Repetição espaçada (variante do SM-2) sobre problemas resolvidos e destaques: fila diária em `/review`, notas Errei, Difícil, Bom e Fácil com atalhos 1 a 4, até 10 cartões novos por dia, selo com o total no menu |
| Recursos | Animações passo a passo com entrada editável, roadmaps de estudo, painel com sequência de dias e mapa de atividade, busca global (Ctrl+K) |

Para testar o agendador da revisão: `npm run test:srs`. Para validar conteúdo: `node scripts/check-content.mjs`. Para validar um problema com soluções de referência: `node scripts/check-problem.mjs <problema.mdx> <sol.py> <sol.js>`. O guia de escrita está em `content/GUIA-DE-ESCRITA.md`.

## Rodar no seu computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Os dados (progresso, destaques, notas e rascunhos de código) ficam num Postgres embutido em `.data/pglite`. Não é preciso instalar nada além do Node.

## Publicar de graça (Vercel + Neon)

1. Crie um banco no [Neon](https://neon.tech) (plano Free) e copie a *connection string*.
2. Suba esta pasta para um repositório no GitHub e importe-o na [Vercel](https://vercel.com) (plano Hobby).
3. Em *Settings → Environment Variables*, defina:
   - `DATABASE_URL`: a connection string do Neon (obrigatória na Vercel, porque lá o disco é somente leitura).
   - `APP_PASSWORD`: uma senha. Sem ela, qualquer pessoa com o link vê e altera seus dados.
4. Faça o deploy. As tabelas são criadas sozinhas no primeiro acesso.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
|---|---|---|
| `DATABASE_URL` | Postgres (Neon) | ausente = PGlite local em `.data/pglite` |
| `APP_PASSWORD` | Protege o app com senha | ausente = acesso livre (ok só no seu computador) |
| `JUDGE0_URL` | Serviço que compila Java, C++, C# e Go | `https://ce.judge0.com` (instância pública gratuita) |
| `JUDGE0_TOKEN` | Token, se a instância exigir | ausente |
| `ANTHROPIC_API_KEY` | Liga o Tutor de IA. **É pago por uso**, então fica desligado por padrão | ausente = botão do tutor escondido |

## Como funciona (e por que é grátis)

| Recurso | Implementação |
|---|---|
| Executar código | No navegador: Python via Pyodide (WebAssembly), JavaScript e TypeScript em Web Worker. Java, C++, C# e Go vão para o Judge0 (o código sai da sua máquina); loops infinitos são cortados em 6 s |
| Áudio | Web Speech API do navegador, que lê bloco a bloco e destaca a palavra atual. Clique duas vezes num parágrafo, com o áudio ativo, para ouvir a partir dele |
| Banco | PGlite local, ou Neon Free em produção |
| Hospedagem | Vercel Hobby |

## Adicionar conteúdo

Cada curso fica em `content/courses/<curso>/`:

- `course.json`: título, descrição e a lista de módulos com a ordem dos capítulos.
- `<capitulo>.mdx`: o texto em Markdown, com frontmatter (`title`, `kind: lesson | problem | quiz`).
  - Componentes disponíveis: `<Callout type="note|tip|warning" title="…">` e `<Quiz question="…" options={[…]} answer={0} explanation="…" />`.
  - Problemas (`kind: problem`) levam no frontmatter `fn` (nome da função em Python), `fnJs`, `starter` e `tests`. Veja `two-sum.mdx`. Use `checkArg: 0` quando a função altera o argumento in-place em vez de retornar.

Depois de editar, o `npm run dev` recarrega na hora. Em produção, um novo deploy publica as mudanças.

## Atalhos

- Selecionar texto: abre a barra de destaque (5 cores, + Nota e Perguntar à IA).
- Clicar num destaque: abre o painel de notas nele.
- `Ctrl+Enter` no editor: executa os testes.
- Botão `Aa`: tema, tamanho, entrelinha, largura e fonte do texto.
