import "server-only";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeBlockIds } from "./rehype-block-ids";
import { rehypeCodeTabs } from "./rehype-code-tabs";
import { Animation } from "@/components/mdx/Animation";
import { Callout } from "@/components/mdx/Callout";
import { CodeTabs } from "@/components/mdx/CodeTabs";
import { Quiz } from "@/components/mdx/Quiz";
import { QuizSet } from "@/components/mdx/QuizSet";

const components = { Animation, Callout, CodeTabs, Quiz, QuizSet };

/** Compila o MDX do capítulo no servidor (no build, para páginas estáticas). */
export async function renderChapter(source: string) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      // O conteúdo vem do repositório (confiável); expressões JS aparecem só nas props dos componentes.
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }],
          rehypeCodeTabs,
          rehypeBlockIds,
        ],
      },
    },
  });
  return content;
}
