import "server-only";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeBlockIds } from "./rehype-block-ids";
import { Callout } from "@/components/mdx/Callout";
import { Quiz } from "@/components/mdx/Quiz";
import { QuizSet } from "@/components/mdx/QuizSet";

const components = { Callout, Quiz, QuizSet };

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
          rehypeBlockIds,
        ],
      },
    },
  });
  return content;
}
