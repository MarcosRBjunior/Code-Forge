"use client";

import Link from "next/link";
import { AnimationPlayer } from "@/components/AnimationPlayer";
import { getAnimation } from "@/lib/animations";

/** Animação passo a passo embutida no texto do capítulo: `<Animation slug="busca-binaria" />`. */
export function Animation({ slug }: { slug: string }) {
  const def = getAnimation(slug);
  if (!def) return null;
  return (
    <figure className="not-prose my-8 rounded-lg border border-line bg-surface-1 p-4">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">Animação: {def.title}</span>
        <Link href={`/animations/${def.slug}`} className="text-accent-text underline">
          Abrir em página própria
        </Link>
      </figcaption>
      <AnimationPlayer slug={def.slug} />
    </figure>
  );
}
