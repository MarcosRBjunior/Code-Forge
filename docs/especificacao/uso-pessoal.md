# Adaptação para uso pessoal

Esta versão foi implementada em `codeforge/` e é usada por um único estudante. Ela substitui partes da especificação das Fases 1 a 5 conforme a tabela abaixo.

| Especificação original | Versão pessoal | Motivo |
|---|---|---|
| Passes Mensal/Anual/Vitalício, Stripe, Pix, paywall e entitlements (Fase 3 §6, Fase 4) | **Removidos.** Todo conteúdo é liberado | Uso individual |
| Better Auth, sessões por dispositivo e limite de dispositivos | Senha única (`APP_PASSWORD`) com cookie HttpOnly | Um usuário só |
| Judge0 em VPC isolada (Fase 3 §3) | Execução **no navegador**: Pyodide (Python) e Web Worker (JS), com timeout por `terminate()` | Custo zero; o código é seu, então o risco de código hostil é seu também |
| Azure TTS pré-gerado com timestamps (Fase 3 §5) | **Web Speech API** do navegador; destaque por palavra via eventos `boundary` + CSS Custom Highlight API | Gratuito. A qualidade da voz depende do sistema (no Edge e no Chrome há vozes pt-BR naturais) |
| Tutor de IA com cotas (Fase 3 §4) | Opcional, liga só com `ANTHROPIC_API_KEY` | A API da Anthropic é paga por uso |
| Schema de 43 tabelas (`db/schema.sql`) | 5 tabelas: `chapter_progress`, `stars`, `highlights`, `notes`, `code_drafts` (`codeforge/src/db/index.ts`) | Sem usuários, pagamentos nem IA com histórico |
| Neon / Upstash / R2 / Inngest | PGlite local ou Neon Free; sem Redis, filas nem storage | Nada disso é necessário para um usuário |
| Nav manifest + bitset (Fase 1 §6) | Sidebar completa no HTML | O catálogo pessoal é pequeno; volta a valer se passar de centenas de capítulos |

O design system (Fase 2) foi aplicado integralmente: os mesmos `tokens.css`, temas e preferências de leitura.

## Testes executados (2026-10-29)

- `npm run build`: 28 páginas geradas estaticamente, sem erros de tipo.
- Testes de API com `curl` contra o servidor de produção: progresso (não regride), destaques (criar, recolorir, remover), notas (criar, editar, remover, desvincular ao apagar o destaque), rascunhos, favoritos, validação 400/422 e tutor desligado (503).
- Testes de ponta a ponta no Chromium (Playwright):
  - Selecionar texto cria um destaque, que persiste após recarregar a página. Uma nota pode ser anexada ao destaque.
  - Python resolve Two Sum com 4/4 testes. Uma solução errada dá 0/4, e um laço infinito é cortado pelo tempo limite.
  - JavaScript resolve Move Zeroes (in-place) com 4/4, e a sidebar marca o capítulo como concluído.
  - Quiz, tema escuro persistente entre páginas e caderno funcionam.
  - Nenhum erro no console. No celular (390px) não há rolagem horizontal.
- **Não verificado:** a voz do áudio (o navegador de teste não tem saída de som) e a conexão com o Neon (exige uma conta). O caminho Neon usa o driver oficial `drizzle-orm/neon-http`, mas não foi executado.
