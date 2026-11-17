"use client";

import { useEffect, useState } from "react";
import { useDelayedFlag } from "@/lib/motion";

export function CourseProgressBar({ course, total }: { course: string; total: number }) {
  const [done, setDone] = useState<number | null>(null);
  // Doherty: o placeholder só aparece se a resposta demorar (evita piscar em respostas rápidas).
  const loading = useDelayedFlag(done === null);

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
        aria-busy={done === null}
      >
        {/* Pose to pose: nasce em 0 e desliza até o valor real com desaceleração */}
        <div className="cf-progress-fill h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs tabular-nums text-fg-subtle">
        {done !== null ? (
          `${done}/${total} concluídos`
        ) : loading ? (
          <span className="cf-skeleton inline-block w-20" aria-hidden>
            &nbsp;
          </span>
        ) : (
          " "
        )}
      </p>
    </div>
  );
}
