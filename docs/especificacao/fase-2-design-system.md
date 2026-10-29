# FASE 2 — Design System Original & Ergonômico

> Arquivos de código desta fase:
> - `design-system/tokens.css` — todos os tokens (primitivos → semânticos), light/dark, preferências de leitura, base de prose e syntax.
> - `design-system/tailwind.config.ts` — Tailwind mapeado 100% para as variáveis.
> - `design-system/scripts/contrast.mjs` — verificador WCAG executável (`node scripts/contrast.mjs`); saída em `design-system/contrast-report.md`.

---

## 1. Direção visual

**Personalidade (3 adjetivos):** **Focado · Preciso · Acolhedor.**
- *Focado* — a interface recua; o conteúdo é a única coisa com contraste máximo. Cromo (sidebar, header) usa `--cf-text-muted`, nunca `--cf-text`.
- *Preciso* — grid de 4px, números tabulares em contadores, código sem ligaduras, estados explícitos (nada de "talvez concluído").
- *Acolhedor* — light em papel quente (`#fbfaf7`), serifa de leitura humanista, cantos 8–12px, microcopy encorajadora no progresso.

**Referências estéticas e o que tiramos de cada uma**

| Referência | O que adotamos | O que evitamos |
|---|---|---|
| **Linear** | Densidade controlada, cinzas frios em dark, `Cmd+K`, transições curtas (140–200ms) | Contraste baixo de textos secundários (Linear fica < 4.5:1 em vários pontos) |
| **Raycast** | Superfícies em camadas por luminância (não por sombra) em dark, foco de teclado impecável | Gradientes/brilhos chamativos — cansam em sessões longas |
| **Obsidian** | Ergonomia de leitura longa, prose com medida controlada, marca-texto, painel lateral de notas | Customização ilimitada (temas quebrados); limitamos a presets testados |

### 1.1 Ergonomia para estudo de 2–4 h
| Problema | Mitigação no sistema |
|---|---|
| *Halation* (texto branco "sangra" em fundo preto, pior em astigmatismo ~30–40% da população) | Fundo dark **não é preto** (`#0f141a`) e texto **não é branco** (`#e3e7ed` / prose `#d5dbe3`): contraste 13–15:1, alto o bastante para AAA, sem os 19–21:1 que geram brilho excessivo |
| Fadiga em light (branco puro em tela grande) | Fundo papel `#fbfaf7`; branco puro só em cards elevados |
| Linhas longas demais | Medida padrão `68ch` (faixa ótima 60–75 caracteres); 4 presets |
| Perda de lugar ao rolar | TOC com seção ativa, barra de progresso de leitura, `scroll-margin-top` em headings, restauração de posição |
| Movimento | Durações ≤ 320ms; tudo zera com `prefers-reduced-motion` |
| Tamanho fixo | 5 tamanhos × 3 entrelinhas × 3 famílias × 4 larguras, persistidos por usuário |

---

## 2. Tipografia (todas OFL — SIL Open Font License)

| Papel | Fonte | Por quê | Pesos carregados |
|---|---|---|---|
| UI | **Inter** (variável) | Excelente em tamanhos 13–16px, `tnum` para contadores, `cv11` (a de um andar) | 400–700 (1 arquivo variável) |
| Prose (padrão) | **Literata** (variável, eixo `opsz`) | Projetada para leitura longa em tela (e-readers); `opsz` ajusta automaticamente ao tamanho | 400, 400i, 600 |
| Prose (alternativa sans) | **Atkinson Hyperlegible Next** | Desenhada para baixa visão; letras desambiguadas (Il1, O0) | 400, 700 |
| Código | **JetBrains Mono** | Altura-x alta, `0` cortado, distingue `l1I` / `O0` | 400, 700 |

**[DECISÃO T1] — Serifa como prose padrão (Literata), com opção sans.**
Em textos longos com muitos termos técnicos misturados a código, uma serifa cria separação visual clara entre explicação (serifa) e código (mono) e entre conteúdo e cromo (sans). *Alternativa descartada:* sans única para tudo (padrão de mercado, inclusive na referência) — mais simples, porém o código inline e o texto ficam visualmente próximos demais, e não diferencia o "modo leitura" do "modo interface".

**[DECISÃO T2] — `next/font` self-hosted com subset `latin` + `latin-ext`, `display: swap` e `adjustFontFallback`.**
Zero requisição a terceiros (LGPD/privacidade, sem Google Fonts em runtime) e CLS ~0 pelo fallback métrico. *Alternativa descartada:* `<link>` para Google Fonts — dependência externa, conexão extra e transferência de IP do usuário a terceiro.

### 2.1 Escala modular (UI) — razão 1.200 (terça menor), base 16px

| Token | rem | px | line-height | tracking | Uso |
|---|---|---|---|---|---|
| `2xs` | 0.694 | 11.1 | 16px | +0.04em (caixa alta) | Overlines, badges |
| `xs` | 0.833 | 13.3 | 18px | 0 | Metadados, contadores da sidebar |
| `sm` | 0.9375 | 15 | 22px | 0 | Itens da sidebar, botões, tabelas |
| `base` | 1 | 16 | 24px | 0 | Texto de UI |
| `lg` | 1.2 | 19.2 | 28px | −0.011em | Títulos de card |
| `xl` | 1.44 | 23 | 32px | −0.011em | Título de seção |
| `2xl` | 1.728 | 27.6 | 36px | −0.022em | Título de página (app) |
| `3xl` | 2.074 | 33.2 | 40px | −0.022em | Título do capítulo |
| `4xl` | 2.488 | 39.8 | 46px | −0.022em | Landing de curso |
| `5xl` | 2.986 | 47.8 | 52px | −0.022em | Hero |

### 2.2 Escala do leitor (prose) — relativa a `--cf-reader-font-size`

| Preset | font-size | line-height | Observação |
|---|---|---|---|
| XS | 15px | 1.65 | Telas pequenas / quem prefere densidade |
| S | 16px | 1.70 | |
| **M (padrão)** | **18px** | **1.70** | 18px serifado ≈ 16px sans em legibilidade percebida |
| L | 20px | 1.65 | |
| XL | 22px | 1.60 | Entrelinha cai em fontes maiores para manter o "bloco" coeso |

Entrelinha sobrescrevível: `tight` 1.5 · padrão · `relaxed` 1.85. H2 = 1.5em, H3 = 1.22em (em UI sans), código em bloco = 0.85em com line-height 1.6, código inline = 0.875em.

---

## 3. Paleta de cores

### 3.1 Neutros e superfícies

| Token semântico | Light | Dark | Uso |
|---|---|---|---|
| `--cf-bg` | `#fbfaf7` papel | `#0f141a` slate profundo | Fundo da página |
| `--cf-surface-1` | `#ffffff` | `#141a21` | Sidebar, cards, painéis |
| `--cf-surface-2` | `#f4f2ed` | `#1a212a` | Hover, inputs |
| `--cf-surface-3` | `#ebe8e1` | `#212934` | Pressed, item ativo |
| `--cf-border` | `#dedad1` | `#2a333f` | Divisores (decorativos) |
| `--cf-border-input` | `#868a90` | `#6a7584` | Bordas de inputs/checkbox (≥ 3:1) |
| `--cf-text` | `#1b1f24` | `#e3e7ed` | Títulos, texto de UI |
| `--cf-text-prose` | `#2b3036` | `#d5dbe3` | Corpo do capítulo |
| `--cf-text-muted` | `#545a62` | `#a9b2be` | Sidebar, metadados |
| `--cf-text-subtle` | `#6a6f76` | `#8b95a3` | Placeholders, timestamps |

Em dark, a **elevação é expressa por luminância** (cada superfície ~+3% L) e por um anel de 1px `rgb(255 255 255 / .04–.05)` na sombra — sombras escuras sobre fundo escuro são invisíveis.

### 3.2 Marca e semânticas

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--cf-accent` | `#4450d6` Forge Indigo | `#8794ff` | Botão primário, foco, item ativo |
| `--cf-accent-text` | `#3740b3` | `#a5b0ff` | Links na prose |
| `--cf-success` | `#18794e` | `#4fd18b` | Concluído, teste passou, Easy |
| `--cf-warning` | `#915b00` | `#f5b83d` | Avisos, Medium, passe expirando |
| `--cf-danger` | `#c4262e` | `#ff7a7a` | Erro, teste falhou, Hard |
| `--cf-info` | `#0b6aa2` | `#5cc0f5` | Callouts "Nota" |
| `--cf-premium` | `#8a6100` | `#e9c46a` | Cadeado, badge Premium |

**[DECISÃO C1] — Variáveis CSS como fonte única e `data-theme` no `<html>`, sem classes `dark:` no markup.**
Um único conjunto de classes (`bg-surface-1 text-fg-muted`) funciona nos dois temas; trocar tema não re-renderiza React. O tema é aplicado antes do paint por um script inline de 300 bytes no `<head>` (lê cookie `cf-theme` → evita flash). *Alternativa descartada:* variantes `dark:` do Tailwind em cada componente — dobra o número de classes, é fácil esquecer um par e impossibilita temas adicionais (sépia, alto contraste) sem reescrever componentes.

### 3.3 Matriz de contraste WCAG 2.x (medida, não estimada)

Gerada por `design-system/scripts/contrast.mjs`. Alvos: texto normal AA ≥ 4.5, AAA ≥ 7; componentes de UI e texto grande ≥ 3 (SC 1.4.11 / 1.4.3).

| Tema | Par | Razão | Nível |
|---|---|---|---|
| Light | text / bg | 15.87 | AAA |
| Light | prose / bg | 12.74 | AAA |
| Light | muted / bg | 6.67 | AA |
| Light | subtle / bg | 4.85 | AA |
| Light | link (accent-text) / bg | 7.90 | AAA |
| Light | branco / accent (botão) | 6.24 | AA |
| Light | border-input / surface-2 (pior caso) | 3.10 | UI ✓ |
| Light | success · warning · danger · info · premium / bg | 5.18 · 5.44 · 5.49 · 5.59 · 5.31 | AA |
| Light | prose / highlights (5 cores) | 9.65 – 11.01 | AAA |
| Light | syntax (todos os tokens) / code-bg | 4.63 – 13.43 | AA–AAA |
| Dark | text / bg | 14.90 | AAA |
| Dark | prose / bg | 13.28 | AAA |
| Dark | muted / bg | 8.63 | AAA |
| Dark | subtle / bg | 6.10 | AA |
| Dark | link / bg | 9.03 | AAA |
| Dark | escuro / accent (botão) | 7.06 | AAA |
| Dark | border-input / surface-2 (pior caso) | 3.47 | UI ✓ |
| Dark | success · warning · danger · info · premium / bg | 9.54 · 10.40 · 7.33 · 9.08 · 11.07 | AAA |
| Dark | prose / highlights (5 cores) | 7.49 – 8.75 | AAA |
| Dark | syntax / code-bg | 5.62 – 13.03 | AA–AAA |

Nenhum par de texto fica abaixo de 4.5:1. Relatório completo (68 pares): `design-system/contrast-report.md`. O script roda no CI e falha o build se algum par regredir.

---

## 4. Tokens de leitura customizáveis

Controlados por atributos no `<html>`, persistidos em `user_preferences` (servidor) e espelhados em cookie `cf-reader` (para o SSR já renderizar certo, sem flash):

| Atributo | Valores | Variável afetada |
|---|---|---|
| `data-reader-size` | `xs` `s` `m` `l` `xl` | `--cf-reader-font-size`, `--cf-reader-line-height` |
| `data-reader-leading` | `tight` · (padrão) · `relaxed` | `--cf-reader-line-height` |
| `data-reader-width` | `compact` 58ch · `normal` 68ch · `wide` 84ch · `full` 100% | `--cf-reader-measure` |
| `data-reader-font` | `serif` · `sans` · `mono` | `--cf-reader-font` |
| `data-theme` | `light` · `dark` · (ausente = sistema) | todos os semânticos |

**Larguras:** `compact` para leitura pura; `normal` padrão; `wide` para capítulos com diagramas e tabelas; `full` para System Design com diagramas grandes (o texto ainda limita em 84ch; só figuras e blocos de código expandem — evita linhas de 200 caracteres).

**5 cores de marca-texto** (`mark[data-hl]`), cada uma com significado sugerido no onboarding (o usuário pode ignorar):

| Cor | Light | Dark | Uso sugerido | Contraste prose (L / D) |
|---|---|---|---|---|
| Amarelo | `#fbeaa0` | `#4a3f12` | Conceito-chave | 11.01 / 7.49 |
| Verde | `#c8eccf` | `#1d4430` | Entendi / dominado | 10.36 / 7.84 |
| Azul | `#cde3fb` | `#1c3a5c` | Definição | 10.12 / 8.33 |
| Rosa | `#f9d3e4` | `#522a3d` | Revisar / dúvida | 9.80 / 8.58 |
| Roxo | `#e2d6fa` | `#3b2d5e` | Padrão de entrevista | 9.65 / 8.75 |

**[DECISÃO H1] — Fundos opacos por tema em vez de cores translúcidas únicas.** Amarelo translúcido sobre `#0f141a` vira um marrom ilegível e muda de tom em cima de `surface-1` vs `bg`. Valores opacos por tema garantem o mesmo contraste medido em qualquer superfície. *Alternativa descartada:* `rgba` único para os dois temas.

O destaque de TTS usa uma cor separada (`--cf-tts-word`, índigo translúcido) para nunca ser confundido com um destaque do usuário.

---

## 5. Syntax highlighting

| Token | Light ("Forge Paper") | Dark ("Forge Night") |
|---|---|---|
| fundo | `#f6f5f1` | `#11161d` |
| texto | `#24292f` | `#d5dbe3` |
| comentário (itálico) | `#6b6f75` | `#8590a0` |
| keyword | `#a3268c` | `#e08ad8` |
| string | `#1d6b2f` | `#9ad49a` |
| número | `#a04600` | `#f2a971` |
| função | `#3a46c2` | `#8fb2ff` |
| tipo/classe | `#8a5a00` | `#e9c46a` |
| constante/builtin | `#0b6aa2` | `#6fcbf2` |
| operador | `#4f5761` | `#a9b2be` |
| pontuação | `#57606a` | `#97a1ae` |
| número de linha | `#868a90` | `#6a7584` |

**[DECISÃO X1] — Shiki no build, com tema `css-variables`, e o mesmo tema exportado para o Monaco.** O realce é feito na compilação do MDX (zero JS no cliente) e as cores vêm dos tokens, então troca de tema não exige re-highlight. Para o editor, `defineTheme('cf-light'|'cf-dark')` é gerado a partir dos mesmos hex. *Alternativa descartada:* Prism no cliente — custo de JS e hidratação em capítulos com 20+ blocos de código, e paletas divergentes entre leitor e editor.

---

## 6. Matriz de estados de componentes

Convenção de marcação: estados nativos via ARIA (`aria-current`, `aria-selected`, `aria-busy`, `aria-disabled`) e estados de domínio via `data-state="completed|locked|in-progress"` → variantes Tailwind `completed:`, `locked:`, `current:`, `loading:`.

| Estado | Botão primário | Botão secundário/ghost | Item da sidebar (capítulo) | Card de problema | Input / Editor |
|---|---|---|---|---|---|
| **default** | `bg-accent text-fg-on-accent` | `bg-transparent text-fg border border-border` | `text-fg-muted`, ícone do tipo | `bg-surface-1 border-border` | `bg-surface-1 border-border-input` |
| **hover** | `bg-accent-hover` | `bg-surface-2` | `bg-surface-2 text-fg` | `border-border-strong shadow-sm` | `border-fg-subtle` |
| **focus-visible** | anel 2px `--cf-focus-ring`, offset 2px | igual | anel interno (inset) para não cortar na lista | anel 2px | anel 2px + borda `accent` |
| **active/pressed** | `translate-y-px`, `bg-accent-hover` | `bg-surface-3` | `bg-surface-3` | `bg-surface-2` | — |
| **disabled** | opacidade 45%, `cursor-not-allowed`, `aria-disabled` | idem | — | — | `bg-surface-2 text-fg-subtle` |
| **loading** | spinner 16px substitui ícone; largura travada; `aria-busy` | idem | skeleton (barra `animate-skeleton`) | skeleton | barra de progresso 2px no topo |
| **selected / current** | — | `bg-accent-soft text-accent-text` | `aria-current`: `bg-accent-soft text-fg font-medium` + barra 2px `accent` à esquerda | borda `accent` | — |
| **concluído** | — | — | ícone ✓ `text-success`, texto `text-fg-muted` (não riscado — legível para revisão) | badge "Resolvido" `bg-success-soft text-success` | testes: ✓ verde por caso |
| **em progresso** | — | — | anel parcial (% lida) no ícone | badge "Tentado" `bg-warning-soft text-warning` | — |
| **bloqueado / premium** | troca rótulo para "Desbloquear" + ícone cadeado `text-premium` | — | cadeado `text-premium`; continua clicável (abre preview + paywall, nunca link morto) | faixa `bg-premium-soft`, CTA | editor read-only com overlay "Premium" |
| **erro** | — | — | — | — | borda `danger`, mensagem `text-danger` ligada por `aria-describedby` |

Regras transversais:
- Estado nunca é comunicado só por cor (✓, cadeado, texto do badge) — SC 1.4.1.
- Alvos de toque ≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8); itens da sidebar têm 32px de altura.
- `focus-visible` sempre visível, inclusive dentro do Monaco (tema define `focusBorder`).
- Transições: cor/fundo 140ms `ease-standard`; painéis 320ms `ease-emphasized`; nenhuma animação de layout em rolagem.

---

## 7. Integração

```css
/* src/app/globals.css (Tailwind v4) */
@import "tailwindcss";
@import "../../design-system/tokens.css";
@config "../../design-system/tailwind.config.ts";
```

```tsx
// src/app/layout.tsx — evita flash de tema e de preferências de leitura
<html lang="pt-BR" data-theme={theme ?? undefined} data-reader-size={reader.size}
      data-reader-width={reader.width} data-reader-font={reader.font}
      className={`${inter.variable} ${literata.variable} ${jetbrains.variable}`}>
```
Valores lidos no servidor do cookie `cf-prefs` (assinado, ≤ 200 bytes). Como o HTML do capítulo é ISR compartilhado (Fase 1, [DECISÃO R1]), os atributos são aplicados por um script inline bloqueante de 300 bytes no `<head>` que lê o cookie — a página continua cacheável e sem flash.

---

**Fim da Fase 2.**
