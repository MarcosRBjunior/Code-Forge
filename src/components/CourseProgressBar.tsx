"use client";

import { useEffect, useState } from "react";

export function CourseProgressBar({ course, total }: { course: string; total: number }) {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/state?course=${course}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { progress: Record<string, { completed: boolean }> } | null) => {
        if (s) setDone(Object.values(s.progress).filter((p) => p.completed).length);
      })
      .catch(() => {});
  }, [course]);

  const pct = done === null || total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="mt-3">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do curso"
      >
        <div className="h-full rounded-full bg-success transition-[width] duration-slow" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs tabular-nums text-fg-subtle">{done === null ? "…" : `${done}/${total} concluídos`}</p>
    </div>
  );
}
