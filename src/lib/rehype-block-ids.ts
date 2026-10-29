import { createHash } from "node:crypto";
import type { Element, ElementContent, Root, RootContent } from "hast";

/**
 * Dá um data-block-id estável a cada bloco de nível superior do capítulo.
 * O id é derivado do texto do bloco (não da posição), então editar um parágrafo
 * não muda o id dos outros: destaques, áudio e "continuar de onde parei" sobrevivem a edições.
 */
const BLOCK_TAGS = new Set(["p", "h2", "h3", "h4", "ul", "ol", "blockquote", "table", "figure", "pre"]);

function textOf(node: Element | ElementContent | RootContent): string {
  if (node.type === "text") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return (node.children as ElementContent[]).map(textOf).join("");
  }
  return "";
}

export function rehypeBlockIds() {
  return (tree: Root) => {
    const seen = new Map<string, number>();
    for (const node of tree.children) {
      if (node.type !== "element" || !BLOCK_TAGS.has(node.tagName)) continue;
      const hash = createHash("sha1").update(textOf(node)).digest("hex").slice(0, 8);
      const n = seen.get(hash) ?? 0;
      seen.set(hash, n + 1);
      node.properties = {
        ...node.properties,
        dataBlockId: n === 0 ? `b${hash}` : `b${hash}-${n}`,
        dataBlockKind: node.tagName === "figure" || node.tagName === "pre" ? "code" : "text",
      };
    }
  };
}
