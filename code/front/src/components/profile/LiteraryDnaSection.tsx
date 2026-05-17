"use client";

import React from "react";
import { Flame } from "lucide-react";
import type { DnaResponse, DnaProgressResponse } from "@/services/profile";

const SEGMENT_COLORS = ["#3FC3A7", "#818cf8", "#f59e0b", "#fb7185", "#34d399"];

const BADGE_CLASSES = [
  "bg-teal-500/20 text-teal-300 border border-teal-500/30",
  "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
];

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

function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function buildSegments(
  themes: { theme: string; percentage: number }[],
  circumference: number,
) {
  const gap = 2.5;
  const total = themes.reduce((s, t) => s + t.percentage, 0);
  const all = [...themes];
  if (total < 95 && themes.length > 0) {
    all.push({ theme: "Outros", percentage: 100 - total });
  }
  let cum = 0;
  return all.map((seg, i) => {
    const arcLength = Math.max(0, (seg.percentage / 100) * circumference - gap);
    const offset = (cum / 100) * circumference;
    cum += seg.percentage;
    const color = i < themes.length ? (SEGMENT_COLORS[i % SEGMENT_COLORS.length] ?? "#3FC3A7") : "#1a3a30";
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
    <div className="relative flex shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#163028" strokeWidth={sw} />
        {segments.length > 0 ? (
          segments.map((seg, i) => (
            <circle
              key={seg.theme}
              cx={50} cy={50} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeLinecap="butt"
              strokeDasharray={animated ? `${seg.arcLength} ${circumference - seg.arcLength}` : `0 ${circumference}`}
              strokeDashoffset={-seg.offset}
              style={{ transition: `stroke-dasharray ${0.65 + i * 0.15}s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s` }}
            />
          ))
        ) : (
          <circle cx={50} cy={50} r={r} fill="none" stroke="#1a3a30" strokeWidth={sw} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tracking-widest text-teal-300">DNA</span>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DnaCardHeader() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
      </span>
      <h2 className="text-sm font-semibold text-white">DNA de Leitura</h2>
    </div>
  );
}

function StatRow({
  dot,
  label,
  value,
  valueClass = "text-white",
}: Readonly<{ dot: string; label: string; value: string; valueClass?: string }>) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-[#7fb8a8]">
        <span className="inline-block h-2 w-2 rounded-sm" style={{ background: dot }} />
        {label}
      </span>
      <span className={`text-xs font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LiteraryDnaSectionProps {
  dna: DnaResponse | DnaProgressResponse | null;
  isLoading?: boolean;
}

export function LiteraryDnaSection({ dna, isLoading = false }: Readonly<LiteraryDnaSectionProps>) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    if (!dna || !isDnaComputed(dna)) return;
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [dna]);

  const cardStyle = "rounded-xl p-5 space-y-4" as const;
  const bg = "bg-gradient-to-br from-[#0a2e25] to-[#0d1f1a]" as const;

  if (isLoading) {
    return (
      <div className={`${cardStyle} ${bg} animate-pulse`}>
        <div className="h-3 w-28 rounded bg-[#1a3a30]" />
        <div className="flex gap-4">
          <div className="h-28 w-28 shrink-0 rounded-full bg-[#1a3a30]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-2.5 w-16 rounded bg-[#1a3a30]" />
            <div className="h-6 w-32 rounded-full bg-[#1a3a30]" />
          </div>
        </div>
        <div className="space-y-2 border-t border-[#1a3a30] pt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-2.5 w-24 rounded bg-[#1a3a30]" />
              <div className="h-2.5 w-14 rounded bg-[#1a3a30]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className={`${cardStyle} ${bg}`}>
        <DnaCardHeader />
        <p className="text-xs text-[#7fb8a8]">
          Ainda não há dados suficientes para montar seu DNA literário.
        </p>
      </div>
    );
  }

  if (!isDnaComputed(dna)) {
    const pct = Math.round((dna.booksRead / dna.booksRequired) * 100);
    return (
      <div className={`${cardStyle} ${bg}`}>
        <DnaCardHeader />
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#7fb8a8]">{dna.message}</span>
            <span className="font-semibold text-teal-400">{dna.booksRead}/{dna.booksRequired}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1a3a30]">
            <div className="h-full rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-xs text-[#7fb8a8]">
            Complete {dna.booksRequired} livros para desbloquear seu DNA literário.
          </p>
        </div>
      </div>
    );
  }

  const themes = dna.centralThemes ?? [];
  const topGenre = themes[0]?.theme ?? dna.complexityLabel ?? "—";
  const secondaryLabels = (dna.secondaryArchetypes ?? []).map((k) => ARCHETYPE_LABELS[k] ?? k).filter(Boolean);
  const pagesByYearEntries = Object.entries(dna.pagesByYear ?? {})
    .map(([year, pages]) => ({ year, pages }))
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 3);

  return (
    <div className={`${cardStyle} ${bg}`}>
      <DnaCardHeader />

      {/* Donut + Perfil literário */}
      <div className="flex items-start gap-4">
        <DonutChart themes={themes} animated={animated} />

        <div className="flex-1 min-w-0 pt-1">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#4a9080]">
            Perfil literário
          </p>

          {/* Archetype + complexity */}
          {dna.dominantArchetypeLabel && (
            <p className="text-sm font-semibold text-white leading-tight">
              {dna.dominantArchetypeLabel}
            </p>
          )}
          {dna.complexityLabel && (
            <p className="mt-0.5 text-xs text-[#7fb8a8]">{dna.complexityLabel}</p>
          )}

          {/* Theme badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {themes.slice(0, 3).map((theme, i) => (
              <span
                key={theme.theme}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_CLASSES[i % BADGE_CLASSES.length]}`}
              >
                {theme.theme}&nbsp;{Math.round(theme.percentage)}%
              </span>
            ))}
          </div>

          {/* Secondary archetypes */}
          {secondaryLabels.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {secondaryLabels.map((label) => (
                <span key={label} className="rounded-full bg-[#1a3a30] px-2 py-0.5 text-[10px] text-[#7fb8a8]">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 border-t border-[#1a3a30] pt-3">
        <StatRow dot="#3FC3A7" label="Livros lidos" value={String(dna.booksReadCount)} valueClass="text-teal-300 font-semibold" />
        <StatRow dot="#ffffff30" label="Páginas lidas" value={formatNumber(dna.totalPagesRead)} />
        {dna.avgDaysPerBook != null && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-[#7fb8a8]">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "#f97316" }} />
              Dias por livro
            </span>
            <div className="flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1">
              <Flame size={11} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{Math.round(dna.avgDaysPerBook)}d</span>
            </div>
          </div>
        )}
        <StatRow dot="#f59e0b" label="Gênero favorito" value={topGenre} valueClass="text-amber-400 font-semibold" />
        {dna.rereadCount > 0 && (
          <StatRow dot="#818cf8" label="Releituras" value={String(dna.rereadCount)} valueClass="text-indigo-300 font-semibold" />
        )}
        {dna.abandonedCount > 0 && (
          <StatRow dot="#fb7185" label="Abandonados" value={String(dna.abandonedCount)} valueClass="text-rose-300 font-semibold" />
        )}
        {dna.mostAbandonedGenre && (
          <StatRow dot="#fb7185" label="Mais abandonado" value={dna.mostAbandonedGenre} />
        )}
      </div>

      {/* Pages by year */}
      {pagesByYearEntries.length > 0 && (
        <div className="border-t border-[#1a3a30] pt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#4a9080]">
            Páginas por ano
          </p>
          <div className="space-y-1">
            {pagesByYearEntries.map(({ year, pages }) => (
              <div key={year} className="flex items-center justify-between text-xs">
                <span className="text-[#7fb8a8]">{year}</span>
                <span className="font-semibold text-white">{formatNumber(pages)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculated at */}
      {dna.calculatedAt && (
        <p className="text-[10px] text-[#4a9080]">
          Calculado em {formatDate(dna.calculatedAt)}
        </p>
      )}
    </div>
  );
}

export default LiteraryDnaSection;
