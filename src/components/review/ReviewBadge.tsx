"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Link "Revisão" do menu, com a quantidade de cartões de hoje (carregada no cliente para não tornar as páginas dinâmicas). */
export function ReviewBadge() {
  const [due, setDue] = useState(0);
  useEffect(() => {
    fetch("/api/reviews?summary=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDue(d.counts.due))
      .catch(() => {});
  }, []);
  return (
    <Link href="/review" className="rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-fg">
      Revisão
      {due > 0 && (
        <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg-on-accent" aria-label={`${due} para revisar`}>
          {due}
        </span>
      )}
    </Link>
  );
}
