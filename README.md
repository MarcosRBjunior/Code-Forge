# CodeForge (versão pessoal)

Plataforma de estudo para entrevistas de engenharia, para um único usuário, inspirada na estrutura do AlgoMaster.io. Todo o texto é original. Roda na Azure com o crédito do Azure for Students.

## O que tem

| Área | Recursos |
|---|---|
| Cursos | 17 cursos (980 capítulos): DSA, System Design (Fundamentos e Entrevistas), Low Level Design, Comportamental, SQL, Concorrência, Redes, Sistemas Operacionais, AI Engineering, GenAI System Design, ML System Design e cursos de linguagem para entrevistas (Java, C++, C#, Go e TypeScript). Blocos de código de DSA, System Design e LLD têm abas em 7 linguagens |
| Leitor | Destaques em 5 cores, notas, caderno com busca e exportação `.md`, áudio com destaque palavra a palavra, modo livro (tecla B), progresso de leitura, sumário com seção ativa, tema claro/escuro e ajustes de fonte e largura |
| Prática | Editor Monaco com Python, JavaScript e TypeScript rodando no navegador e Java, C++, C# e Go compilados num serviço externo (Judge0), com código inicial gerado dos testes (listas, árvores e design de classes só em Python, JS e TS), testes por caso, rascunhos salvos, suporte a listas ligadas, árvores e classes de design; catálogo agrupado por padrão, filtros e problema aleatório |
| Entrevista | Mock interview cronometrada (estilo, nível, modo sem executar, mistura de dificuldades), avaliação nas 6 áreas da rubrica com nota de 0 a 100 e histórico |
| Revisão | Repetição espaçada (variante do SM-2) sobre problemas resolvidos e destaques: fila diária em `/review`, notas Errei, Difícil, Bom e Fácil com atalhos 1 a 4, até 10 cartões novos por dia, selo com o total no menu |
| Recursos | Animações passo a passo com entrada editável, roadmaps de estudo, painel com sequência de dias e mapa de atividade, busca global (Ctrl+K) |

Para verificar as soluções de referência (`content/solutions/dsa/`, 7 linguagens): `npx tsx --conditions react-server scripts/check-solutions.ts --all`. Para executar os programas dos cursos de linguagem e comparar com a saída do texto: `npx tsx --conditions react-server scripts/check-lang-course.ts <java|cpp|csharp|go|typescript>`. Para testar o agendador da revisão: `npm run test:srs`. Para validar conteúdo: `node scripts/check-content.mjs`. Para validar um problema com soluções de referência: `node scripts/check-problem.mjs <problema.mdx> <sol.py> <sol.js>`. O guia de escrita está em `content/GUIA-DE-ESCRITA.md`.

## Rodar no seu computador

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` e defina ao menos `APP_URL=http://localhost:3000` (obrigatória: o servidor não sobe sem ela). Sem `DATABASE_URL` (ou com ela vazia), os dados ficam num Postgres embutido em `.data/pglite`; com ela, no Postgres indicado. Se o `.env.local` apontar para o banco de produção, rode `DATABASE_URL= npm run dev` para usar o PGlite.

Abra http://localhost:3000. O login é por e-mail e senha, com sessão guardada no banco (`src/server/auth/`, rotas em `src/app/api/auth/`). O cadastro vem fechado: libere com `REGISTRATION_OPEN=true` ou com `REGISTRATION_ALLOWLIST=seu@email`. Sem `ACS_CONNECTION_STRING`/`MAIL_FROM`, em desenvolvimento os links de confirmação de cadastro e de redefinição de senha aparecem no console do `npm run dev`.

## Backup e migração do progresso

```bash
npx tsx --conditions react-server scripts/backup-db.ts export            # grava em backups/ (fora do git)
npx tsx --conditions react-server scripts/backup-db.ts import <arquivo>  # só preenche tabelas vazias
npx tsx --conditions react-server scripts/backup-db.ts import <arquivo> --replace
```

Sem `DATABASE_URL` o script usa o PGlite local; com ela, esse Postgres. Para escolher o banco, passe o arquivo de variáveis: `npx tsx --env-file=.env.azure --conditions react-server scripts/backup-db.ts export`. Para migrar: `export` com as variáveis da origem, depois `import` com as do destino. Feche o app antes se usar o PGlite (ele aceita um processo por vez).

## Publicação (Azure for Students)

Produção roda no **Azure Container Apps** (região Chile Central) com **Azure Database for PostgreSQL** (Flexible Server, B1ms).

- **Deploy:** cada push na `main` dispara `.github/workflows/azure.yml`, que gera a imagem Docker (`Dockerfile`, build `standalone`), publica em `ghcr.io/marcosrbjunior/codeforge` e atualiza o Container App. O login na Azure é por OIDC (identidade `gh-codeforge-deploy`, papel Contributor só no grupo `rg-codeforge`); o repositório guarda apenas `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` e `AZURE_SUBSCRIPTION_ID`.
- **Segredos do app:** `DATABASE_URL` e `ACS_CONNECTION_STRING` ficam como segredos do Container App (`az containerapp secret set`); o app também precisa de `APP_URL` e, para enviar e-mail, `MAIL_FROM`. Localmente, ficam em `.env.azure` (fora do git).
- **Banco:** firewall libera os serviços da Azure e o IP de quem administra. Se o seu IP mudar, adicione-o: `az postgres flexible-server firewall-rule create -g rg-codeforge -s <servidor> -n meu-ip --start-ip-address <ip> --end-ip-address <ip>`.
- **Testar a imagem localmente:** `docker build -t codeforge . && docker run -p 3000:3000 -e APP_URL=http://localhost:3000 -e PGLITE_DIR=/tmp/pglite codeforge`. A imagem roda em modo produção, então sem ACS os e-mails de confirmação não são enviados (nem escritos no console).

## Variáveis de ambiente

| Variável | Para quê | Padrão |
|---|---|---|
| `APP_URL` | Origem pública do app, sem barra no final (checagem de Origin contra CSRF e links dos e-mails). **Obrigatória** | nenhum: o servidor não sobe sem ela |
| `DATABASE_URL` | Postgres (Azure em produção; use `?sslmode=verify-full`) | ausente ou vazia = PGlite local |
| `PGLITE_DIR` | Pasta do PGlite | `.data/pglite` |
| `REGISTRATION_OPEN` | `true` abre o cadastro para qualquer e-mail | fechado |
| `REGISTRATION_ALLOWLIST` | E-mails liberados para cadastro, separados por vírgula | vazia |
| `JUDGE0_URL` | Serviço que compila Java, C++, C# e Go | `https://ce.judge0.com` (instância pública gratuita) |
| `JUDGE0_TOKEN` | Token, se a instância exigir | ausente |
| `ACS_CONNECTION_STRING` | Azure Communication Services (e-mails de confirmação de cadastro e de redefinição de senha); segredo `acs-connection-string` no Container App | ausente: produção não envia, dev escreve o link no console |
| `MAIL_FROM` | Remetente, do domínio gerenciado pela Azure (`DoNotReply@<guid>.azurecomm.net`) | ausente |
| `ANTHROPIC_API_KEY` | Liga o Tutor de IA. **É pago por uso**, então fica desligado por padrão | ausente = botão do tutor escondido |

## Como funciona

| Recurso | Implementação |
|---|---|
| Executar código | No navegador: Python via Pyodide (WebAssembly), JavaScript e TypeScript em Web Worker. Java, C++, C# e Go vão para o Judge0 (o código sai da sua máquina); loops infinitos são cortados em 6 s |
| Áudio | Web Speech API do navegador, que lê bloco a bloco e destaca a palavra atual. Clique duas vezes num parágrafo, com o áudio ativo, para ouvir a partir dele |
| Banco | PGlite local, ou Azure Database for PostgreSQL em produção |
| Hospedagem | Azure Container Apps (escala a zero quando ninguém usa) |

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
