import { ReviewSession } from "@/components/review/ReviewSession";

export const metadata = { title: "Revisão" };

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Revisão</h1>
      <p className="mt-2 text-fg-muted">Problemas que você resolveu e trechos que destacou voltam aqui no momento em que você está prestes a esquecê-los.</p>
      <ReviewSession />
    </main>
  );
}
