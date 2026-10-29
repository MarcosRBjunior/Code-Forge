import Link from "next/link";
import { ANIMATIONS, CATEGORIES } from "@/lib/animations";

export const metadata = { title: "Animações" };

export default function AnimationsPage() {
  const cats = Object.entries(CATEGORIES) as Array<[keyof typeof CATEGORIES, (typeof CATEGORIES)[keyof typeof CATEGORIES]]>;
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Animações</h1>
      <p className="mt-1 text-fg-muted">Veja os algoritmos acontecendo passo a passo, com a sua própria entrada.</p>
      {cats.map(([key, cat]) => {
        const list = ANIMATIONS.filter((a) => a.category === key);
        return (
          <section key={key} className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">{cat.title}</h2>
              <span className="text-sm text-fg-subtle">{list.length} animações</span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{cat.description}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/animations/${a.slug}`}
                    className="block h-full rounded-lg border border-line bg-surface-1 p-4 shadow-sm transition-colors duration-fast hover:border-accent"
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="mt-1 text-sm text-fg-muted">{a.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
