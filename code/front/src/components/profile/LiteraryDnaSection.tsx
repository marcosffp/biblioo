"use client";

import React from "react";
import type { DnaResponse, DnaProgressResponse } from "@/services/profile";

const SEGMENT_COLORS = ["#3FC3A7", "#818cf8", "#f59e0b", "#fb7185", "#34d399"];


const ARCHETYPE_LABELS: Record<string, string> = {
  DISCOVERY_READER: "Leitor em Descoberta",
  GENRE_DEVOTEE: "Devoto do Gênero",
  CLASSICS_SCHOLAR: "Erudito Clássico",
  COMPULSIVE_READER: "Leitor Compulsivo",
  ECLECTIC_READER: "Leitor Eclético",
  RE_READER: "Releitor",
  EMOTIONAL_READER: "Leitor Emocional",
  EXPLORER: "Explorador",
};

function isDnaComputed(dna: DnaResponse | DnaProgressResponse): dna is DnaResponse {
  return "dominantArchetypeLabel" in dna;
}

function useCountUp(target: number, active: boolean, duration = 750): number {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

function ThemeRow({
  theme,
  percentage,
  color,
  animated,
  delay,
}: Readonly<{ theme: string; percentage: number; color: string; animated: boolean; delay: number }>) {
  const count = useCountUp(Math.round(percentage), animated, 750);
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-all duration-500 ${
        animated ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-foreground/80">{theme}</span>
      <span className="ml-1 tabular-nums font-medium text-muted-foreground">{count}%</span>
    </div>
  );
}

function buildSegments(
  themes: { theme: string; percentage: number }[],
  circumference: number,
) {
  const gap = 2.5;
  const total = themes.reduce((s, t) => s + t.percentage, 0);
  const all =
    total < 95 && themes.length > 0
      ? [...themes, { theme: "Outros", percentage: 100 - total }]
      : [...themes];
  let cum = 0;
  return all.map((seg, i) => {
    const arcLength = Math.max(0, (seg.percentage / 100) * circumference - gap);
    const offset = (cum / 100) * circumference;
    cum += seg.percentage;
    const color =
      i < themes.length
        ? (SEGMENT_COLORS[i % SEGMENT_COLORS.length] ?? "#3FC3A7")
        : "#e2e8f0";
    return { ...seg, arcLength, offset, color };
  });
}

function DonutChart({
  themes,
  animated,
}: Readonly<{ themes: { theme: string; percentage: number }[]; animated: boolean }>) {
  const r = 38;
  const sw = 11;
  const circumference = 2 * Math.PI * r;
  const segments = buildSegments(themes, circumference);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center transition-all duration-700 ease-out ${
        animated ? "scale-100 opacity-100" : "scale-75 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-28 w-28"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        <circle
          cx={50} cy={50} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={sw}
          className="text-gray-100"
        />
        {segments.length > 0 ? (
          segments.map((seg, i) => (
            <circle
              key={seg.theme}
              cx={50} cy={50} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeLinecap="butt"
              strokeDasharray={
                animated
                  ? `${seg.arcLength} ${circumference - seg.arcLength}`
                  : `0 ${circumference}`
              }
              strokeDashoffset={-seg.offset}
              style={{
                transition: `stroke-dasharray ${0.65 + i * 0.15}s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`,
              }}
            />
          ))
        ) : (
          <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tracking-widest text-teal-600">DNA</span>
      </div>
    </div>
  );
}

function DnaCardHeader() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
      </span>
      <h2 className="text-sm font-semibold text-foreground">DNA de Leitura</h2>
    </div>
  );
}


interface LiteraryDnaSectionProps {
  dna: DnaResponse | DnaProgressResponse | null;
  isLoading?: boolean;
}

export function LiteraryDnaSection({
  dna,
  isLoading = false,
}: Readonly<LiteraryDnaSectionProps>) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    if (!dna || !isDnaComputed(dna)) return;
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [dna]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-28 w-28 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="mt-2 flex gap-1.5">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card p-5">
        <DnaCardHeader />
        <p className="text-xs text-muted-foreground">
          Ainda não há dados suficientes para montar seu DNA literário.
        </p>
      </div>
    );
  }

  if (!isDnaComputed(dna)) {
    const pct = Math.round((dna.booksRead / dna.booksRequired) * 100);
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <DnaCardHeader />
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{dna.message}</span>
            <span className="font-semibold text-foreground">
              {dna.booksRead}/{dna.booksRequired}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Complete {dna.booksRequired} livros para desbloquear seu DNA literário.
          </p>
        </div>
      </div>
    );
  }

  const themes = dna.centralThemes ?? [];
  const secondaryLabels = (dna.secondaryArchetypes ?? [])
    .map((k) => ARCHETYPE_LABELS[k] ?? k)
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <DnaCardHeader />

      <div className="mt-4 flex items-start gap-5">
        <DonutChart themes={themes} animated={animated} />

        <div className="min-w-0 flex-1">
          {/* 1 — label */}
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Perfil literário
          </p>

          {/* 2 — primary identity */}
          <p className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
            {dna.dominantArchetypeLabel ?? "—"}
          </p>
          {dna.complexityLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{dna.complexityLabel}</p>
          )}

          {/* 3 — genre distribution as clean rows */}
          {themes.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {themes.slice(0, 3).map((t, i) => (
                <ThemeRow
                  key={t.theme}
                  theme={t.theme}
                  percentage={t.percentage}
                  color={SEGMENT_COLORS[i % SEGMENT_COLORS.length] ?? "#3FC3A7"}
                  animated={animated}
                  delay={200 + i * 100}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiteraryDnaSection;
