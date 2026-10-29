import Link from "next/link";
import { notFound } from "next/navigation";
import { ANIMATIONS, CATEGORIES, getAnimation } from "@/lib/animations";
import { AnimationPlayer } from "@/components/AnimationPlayer";

export function generateStaticParams() {
  return ANIMATIONS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = getAnimation((await params).slug);
  return a ? { title: `${a.title} · Animação`, description: a.description } : {};
}

export default async function AnimationPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = getAnimation((await params).slug);
  if (!a) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm text-fg-subtle">
        <Link href="/animations" className="hover:text-accent-text">Animações</Link>
        <span aria-hidden> · </span>
        {CATEGORIES[a.category].title}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{a.title}</h1>
      <p className="mt-1 text-fg-muted">{a.description}</p>
      {a.chapter && (
        <Link href={`/learn/${a.chapter}`} className="mt-3 inline-block text-sm text-accent-text underline">
          Ler o capítulo relacionado →
        </Link>
      )}
      <AnimationPlayer slug={a.slug} />
    </main>
  );
}
