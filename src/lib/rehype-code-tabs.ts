import type { Element, Root, RootContent } from "hast";

/**
 * Prepara cada `<CodeTabs>` do capítulo: mantém só os blocos de código (sem os espaços entre eles)
 * e anota em `langs` a linguagem de cada um, na mesma ordem, para o componente montar as abas.
 * Roda depois do rehype-pretty-code, que envolve cada bloco num <figure> com <pre data-language>.
 */
interface JsxFlow {
  type: "mdxJsxFlowElement";
  name: string | null;
  attributes: Array<{ type: "mdxJsxAttribute"; name: string; value: string }>;
  children: RootContent[];
}

function languageOf(node: RootContent): string | null {
  if (node.type !== "element") return null;
  const pre = node.tagName === "pre" ? node : (node.children.find((c) => c.type === "element" && c.tagName === "pre") as Element | undefined);
  // Conforme o compilador, a propriedade chega como dataLanguage ou como "data-language".
  const lang = pre?.properties?.dataLanguage ?? pre?.properties?.["data-language"];
  return typeof lang === "string" ? lang : null;
}

function visit(nodes: RootContent[]) {
  for (const node of nodes) {
    const jsx = node as unknown as JsxFlow;
    if (jsx.type === "mdxJsxFlowElement" && jsx.name === "CodeTabs") {
      const blocks = jsx.children.filter((c) => languageOf(c) !== null);
      jsx.children = blocks;
      jsx.attributes = [
        ...jsx.attributes.filter((a) => a.name !== "langs"),
        { type: "mdxJsxAttribute", name: "langs", value: blocks.map(languageOf).join(",") },
      ];
    } else if ("children" in node && Array.isArray(node.children)) {
      visit(node.children as RootContent[]);
    }
  }
}

export function rehypeCodeTabs() {
  return (tree: Root) => visit(tree.children);
}
