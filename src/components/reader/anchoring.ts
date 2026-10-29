/**
 * Âncoras de texto por bloco: { blockId, startOffset, endOffset } medidos sobre o texto
 * do bloco (data-block-id). Os offsets ignoram os <mark> de destaque, porque marks não
 * alteram o texto, só o envolvem.
 */
export interface Anchor {
  blockId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
}

export function closestBlock(node: Node | null): HTMLElement | null {
  const el = node instanceof Element ? node : node?.parentElement;
  return (el?.closest("[data-block-id]") as HTMLElement | null) ?? null;
}

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const out: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
  return out;
}

/** Converte offsets de caractere do bloco em um Range do DOM. */
export function offsetsToRange(block: Element, start: number, end: number): Range | null {
  const range = document.createRange();
  let pos = 0;
  let started = false;
  for (const node of textNodes(block)) {
    const len = node.data.length;
    if (!started && start <= pos + len) {
      range.setStart(node, start - pos);
      started = true;
    }
    if (started && end <= pos + len) {
      range.setEnd(node, end - pos);
      return range;
    }
    pos += len;
  }
  return null;
}

/** Âncora da seleção atual, se ela estiver inteira dentro de um único bloco do capítulo. */
export function selectionToAnchor(root: Element): { anchor: Anchor; rect: DOMRect } | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const block = closestBlock(range.startContainer);
  if (!block || block !== closestBlock(range.endContainer) || !root.contains(block)) return null;
  const quote = range.toString();
  if (!quote.trim()) return null;

  const before = document.createRange();
  before.selectNodeContents(block);
  before.setEnd(range.startContainer, range.startOffset);
  const startOffset = before.toString().length;

  return {
    anchor: { blockId: block.dataset.blockId!, startOffset, endOffset: startOffset + quote.length, quote },
    rect: range.getBoundingClientRect(),
  };
}

/** Envolve o trecho em <mark data-hl=cor data-hl-id=id>, um mark por nó de texto atravessado. */
export function paintHighlight(root: Element, h: { id: string; color: string; blockId: string; startOffset: number; endOffset: number }) {
  const block = root.querySelector(`[data-block-id="${CSS.escape(h.blockId)}"]`);
  if (!block) return false;
  const range = offsetsToRange(block, h.startOffset, h.endOffset);
  if (!range) return false;

  const targets = textNodes(block).filter((n) => range.intersectsNode(n));
  for (const node of targets) {
    let target = node;
    const s = node === range.startContainer ? range.startOffset : 0;
    const e = node === range.endContainer ? range.endOffset : node.data.length;
    if (e <= s) continue;
    if (e < target.data.length) target.splitText(e);
    if (s > 0) target = target.splitText(s);
    const mark = document.createElement("mark");
    mark.dataset.hl = h.color;
    mark.dataset.hlId = h.id;
    target.parentNode!.insertBefore(mark, target);
    mark.appendChild(target);
  }
  return true;
}

export function unpaintHighlight(root: Element, id: string) {
  root.querySelectorAll(`mark[data-hl-id="${CSS.escape(id)}"]`).forEach((mark) => {
    const parent = mark.parentNode!;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

export function recolorHighlight(root: Element, id: string, color: string) {
  root.querySelectorAll<HTMLElement>(`mark[data-hl-id="${CSS.escape(id)}"]`).forEach((m) => (m.dataset.hl = color));
}
