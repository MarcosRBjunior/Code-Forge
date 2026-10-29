"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnimation, type CellRole, type Frame } from "@/lib/animations";

const ROLE_STYLE: Record<CellRole, string> = {
  active: "border-accent bg-accent-soft text-fg",
  compare: "border-warning bg-warning-soft text-fg",
  done: "border-success bg-success-soft text-fg",
  window: "border-info bg-info-soft text-fg",
  found: "border-success bg-success text-fg-on-accent",
  muted: "border-line text-fg-subtle opacity-50",
  swap: "border-danger bg-danger-soft text-fg",
};

function Cells({ frame }: { frame: Frame }) {
  if (!frame.cells) return null;
  const pointerAt: Record<number, string[]> = {};
  for (const [name, idx] of Object.entries(frame.pointers ?? {})) (pointerAt[idx] ??= []).push(name);
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {frame.cells.map((v, i) => (
        <div key={i} className="flex w-11 flex-col items-center">
          <span className="mb-1 text-[10px] tabular-nums text-fg-subtle">{i}</span>
          <span
            className={`grid size-11 place-items-center rounded-md border-2 font-mono text-sm font-semibold transition-colors duration-base ${
              frame.roles?.[i] ? ROLE_STYLE[frame.roles[i]] : "border-line-input bg-surface-1"
            }`}
          >
            {v}
          </span>
          <span className="mt-1 h-8 text-center font-mono text-[10px] leading-tight text-accent-text">
            {(pointerAt[i] ?? []).map((p) => (
              <span key={p} className="block">↑ {p}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function Grid({ frame }: { frame: Frame }) {
  if (!frame.grid) return null;
  return (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${frame.grid[0].length}, 2.5rem)` }}>
      {frame.grid.flatMap((row, r) =>
        row.map((v, c) => {
          const role = frame.gridRoles?.[`${r},${c}`];
          return (
            <span
              key={`${r},${c}`}
              className={`grid size-10 place-items-center rounded-md border-2 font-mono text-sm transition-colors duration-base ${
                role ? ROLE_STYLE[role] : v === "1" ? "border-line-strong bg-surface-3" : "border-line bg-surface-1 text-fg-subtle"
              }`}
            >
              {v}
            </span>
          );
        }),
      )}
    </div>
  );
}

function Stack({ frame }: { frame: Frame }) {
  if (!frame.stack) return null;
  return (
    <div className="flex flex-col items-center">
      <span className="mb-1 text-xs text-fg-subtle">pilha (topo em cima)</span>
      <div className="flex min-h-12 w-16 flex-col-reverse items-stretch gap-1 rounded-b-md border-2 border-t-0 border-line-strong p-1">
        {frame.stack.map((v, i) => (
          <span key={i} className={`rounded-sm py-1 text-center font-mono text-sm ${i === frame.stack!.length - 1 ? "bg-accent text-fg-on-accent" : "bg-surface-3"}`}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function Servers({ frame }: { frame: Frame }) {
  if (!frame.servers) return null;
  const max = Math.max(10, ...frame.servers.map((s) => s.load));
  return (
    <div className="flex items-end justify-center gap-6">
      {frame.servers.map((s) => (
        <div key={s.name} className="flex flex-col items-center gap-1">
          <span className="text-xs tabular-nums text-fg-muted">{s.load}</span>
          <div className="flex h-40 w-14 items-end overflow-hidden rounded-md border border-line bg-surface-1">
            <div
              className={`w-full transition-[height] duration-slow ${s.active ? "bg-accent" : "bg-info"}`}
              style={{ height: `${(s.load / max) * 100}%` }}
            />
          </div>
          <span className={`text-sm font-semibold ${s.active ? "text-accent-text" : ""}`}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

const OWNER_COLOR: Record<string, string> = { A: "var(--cf-accent)", B: "var(--cf-success)", C: "var(--cf-warning)", D: "var(--cf-danger)" };

function Ring({ frame }: { frame: Frame }) {
  if (!frame.ring) return null;
  const R = 120;
  const pos = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: 160 + r * Math.cos(rad), y: 160 + r * Math.sin(rad) };
  };
  return (
    <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-sm" role="img" aria-label="Anel de hashing consistente">
      <circle cx="160" cy="160" r={R} fill="none" stroke="var(--cf-border-strong)" strokeWidth="2" />
      {frame.ring.nodes.map((n) => {
        const p = pos(n.angle, R);
        const l = pos(n.angle, n.kind === "server" ? R + 22 : R - 26);
        return n.kind === "server" ? (
          <g key={`s-${n.label}`}>
            <rect x={p.x - 9} y={p.y - 9} width="18" height="18" rx="4" fill={OWNER_COLOR[n.label] ?? "var(--cf-accent)"} />
            <text x={l.x} y={l.y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--cf-text)">{n.label}</text>
          </g>
        ) : (
          <g key={`k-${n.label}`}>
            <circle cx={p.x} cy={p.y} r="5" fill={n.owner ? OWNER_COLOR[n.owner] : "var(--cf-text-subtle)"} />
            <text x={l.x} y={l.y + 3} textAnchor="middle" fontSize="9" fill="var(--cf-text-muted)">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AnimationPlayer({ slug }: { slug: string }) {
  const def = getAnimation(slug)!;
  const [raw, setRaw] = useState<Record<string, string>>(() => Object.fromEntries(def.inputs.map((i) => [i.key, i.default])));
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const frames = useMemo(() => {
    try {
      const parsed = Object.fromEntries(def.inputs.map((i) => [i.key, i.parse(raw[i.key])]));
      setError(null);
      return def.build(parsed);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [def, raw]);

  const [applied, setApplied] = useState(frames);
  const current = applied ?? [];
  const frame = current[Math.min(step, current.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (step >= current.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100 / speed);
    return () => clearTimeout(t);
  }, [playing, step, current.length, speed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, current.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current.length]);

  const btn = "rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-40";

  return (
    <div className="mt-6 space-y-4">
      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface-1 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (frames) {
            setApplied(frames);
            setStep(0);
            setPlaying(false);
          }
        }}
      >
        {def.inputs.map((i) => (
          <label key={i.key} className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-fg-muted">
            {i.label}
            <input
              value={raw[i.key]}
              onChange={(e) => setRaw((r) => ({ ...r, [i.key]: e.target.value }))}
              className="rounded-md border border-line-input bg-surface-1 px-2.5 py-1.5 font-mono text-sm text-fg"
            />
          </label>
        ))}
        <button type="submit" disabled={!frames} className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-fg-on-accent disabled:opacity-45">
          Aplicar
        </button>
        {error && <p className="w-full text-sm text-danger">{error}</p>}
      </form>

      <div className="rounded-xl border border-line bg-surface-2 p-6">
        <div className="flex min-h-48 flex-wrap items-center justify-center gap-10">
          <Cells frame={frame} />
          <Grid frame={frame} />
          <Stack frame={frame} />
          <Servers frame={frame} />
          <Ring frame={frame} />
        </div>
        {frame.vars && (
          <dl className="mt-5 flex flex-wrap justify-center gap-2 font-mono text-xs">
            {Object.entries(frame.vars).map(([k, v]) => (
              <div key={k} className="rounded-md border border-line bg-surface-1 px-2 py-1">
                <dt className="inline text-fg-subtle">{k} = </dt>
                <dd className="inline font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-5 text-center text-sm" aria-live="polite">
          {frame.note}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={btn} onClick={() => { setStep(0); setPlaying(false); }}>⏮</button>
        <button type="button" className={btn} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>◀ Voltar</button>
        <button
          type="button"
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-fg-on-accent"
          onClick={() => {
            if (step >= current.length - 1) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? "⏸ Pausar" : "▶ Reproduzir"}
        </button>
        <button type="button" className={btn} disabled={step >= current.length - 1} onClick={() => setStep((s) => s + 1)}>Avançar ▶</button>
        <span className="px-2 text-sm tabular-nums text-fg-muted">
          {step + 1} / {current.length}
        </span>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Velocidade" className="rounded-md border border-line-input bg-surface-1 px-2 py-1.5 text-sm">
          {[0.5, 1, 1.5, 2].map((s) => (
            <option key={s} value={s}>{s}×</option>
          ))}
        </select>
      </div>
      <p className="text-center text-xs text-fg-subtle">Atalhos: espaço reproduz/pausa · ← → navegam pelos passos</p>
    </div>
  );
}
