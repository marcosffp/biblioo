import React from "react";

const PALETTES = [
  { from: "#1a1a3e", to: "#0d0d2b", accent: "#ffd700" }, // navy / gold
  { from: "#1b4332", to: "#081c15", accent: "#74c69d" }, // forest / mint
  { from: "#4a0e8f", to: "#1a0050", accent: "#d4a5ff" }, // violet / lavender
  { from: "#7d1a1a", to: "#4a0000", accent: "#ffc300" }, // crimson / amber
  { from: "#0a2463", to: "#031430", accent: "#48cae4" }, // royal blue / cyan
  { from: "#5c3317", to: "#2d1a0a", accent: "#f6ae2d" }, // leather / gold
  { from: "#1e3a5f", to: "#0a1628", accent: "#63cfe0" }, // indigo / sky
  { from: "#00475a", to: "#001a22", accent: "#ff9ab5" }, // teal / rose
] as const;

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function wrapText(text: string, maxPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxPerLine) {
      cur = next;
    } else {
      if (cur) {
        lines.push(cur);
        if (lines.length >= maxLines) return lines;
      }
      cur = w.length > maxPerLine ? `${w.slice(0, maxPerLine - 1)}…` : w;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

export interface BookCoverPlaceholderProps {
  title?: string;
  author?: string;
  /** Explicit square size (px). When omitted, fills parent 100%×100%. */
  size?: number;
  className?: string;
}

export function BookCoverPlaceholder({
  title = "",
  author = "",
  size,
  className = "",
}: Readonly<BookCoverPlaceholderProps>) {
  const uid = React.useId();
  const seed = (title || author || "book").toLowerCase();
  const hash = djb2(seed);
  const palette = PALETTES[hash % PALETTES.length];
  const patternType = (hash >>> 5) % 4;

  const W = 120;
  const H = 168;
  const gradId = `bcg${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const fadeId = `bcf${uid.replace(/[^a-zA-Z0-9]/g, "")}`;

  const titleLines = wrapText(title, 12, 3);
  const authorShort =
    author.length > 20 ? `${author.slice(0, 19)}…` : author;
  const hasText = titleLines.length > 0;
  const hasAuthor = authorShort.length > 0;

  const lineH = 13;
  const textBlockH =
    titleLines.length * lineH + (hasAuthor ? lineH - 1 : 0) + 8;
  const titleStartY = H - textBlockH + lineH;

  const svgSize = size
    ? { width: size, height: size }
    : { width: "100%", height: "100%" };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      {...svgSize}
      className={`block select-none ${className}`.trim()}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0.2" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.68)" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill={`url(#${gradId})`} />

      {/* Decorative pattern */}
      {patternType === 0 && (
        <>
          <circle cx={W * 0.5} cy={H * 0.33} r={H * 0.24} fill={palette.accent} fillOpacity="0.12" />
          <circle cx={W * 0.5} cy={H * 0.33} r={H * 0.15} fill={palette.accent} fillOpacity="0.10" />
          <circle cx={W * 0.78} cy={H * 0.14} r={H * 0.09} fill={palette.accent} fillOpacity="0.09" />
          <circle cx={W * 0.2} cy={H * 0.5} r={H * 0.07} fill={palette.accent} fillOpacity="0.08" />
        </>
      )}
      {patternType === 1 && (
        <g stroke={palette.accent} strokeOpacity="0.18" strokeWidth="7" strokeLinecap="round">
          <line x1="-20" y1={H * 0.65} x2="140" y2={-H * 0.25} />
          <line x1="-20" y1={H * 0.9} x2="140" y2="0" />
          <line x1="-20" y1={H * 1.1} x2="140" y2={H * 0.24} />
        </g>
      )}
      {patternType === 2 && (
        <>
          <rect x="12" y="14" width={W - 24} height={H * 0.55} rx="5"
            fill="none" stroke={palette.accent} strokeOpacity="0.18" strokeWidth="2" />
          <rect x="22" y="24" width={W - 44} height={H * 0.55 - 20} rx="3"
            fill={palette.accent} fillOpacity="0.07" />
          <rect x="36" y="38" width={W - 72} height={H * 0.55 - 50} rx="2"
            fill={palette.accent} fillOpacity="0.09" />
        </>
      )}
      {patternType === 3 && (
        <g fill="none" stroke={palette.accent}>
          <circle cx={W * 0.5} cy={H * 0.32} r={H * 0.26} strokeOpacity="0.14" strokeWidth="2" />
          <circle cx={W * 0.5} cy={H * 0.32} r={H * 0.18} strokeOpacity="0.20" strokeWidth="2" />
          <circle cx={W * 0.5} cy={H * 0.32} r={H * 0.10} strokeOpacity="0.28" strokeWidth="2" />
          <circle cx={W * 0.5} cy={H * 0.32} r={H * 0.04}
            fill={palette.accent} fillOpacity="0.18" strokeWidth="0" />
        </g>
      )}

      {/* Bottom fade overlay (only when text is present) */}
      {hasText && (
        <rect x="0" y={H * 0.45} width={W} height={H * 0.55} fill={`url(#${fadeId})`} />
      )}

      {/* Title lines */}
      {titleLines.map((line, i) => (
        <text
          key={i}
          x="8"
          y={titleStartY + i * lineH}
          fontSize="11"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="system-ui,-apple-system,sans-serif"
        >
          {line}
        </text>
      ))}

      {/* Author */}
      {hasText && hasAuthor && (
        <text
          x="8"
          y={titleStartY + titleLines.length * lineH + 1}
          fontSize="8.5"
          fill={palette.accent}
          fillOpacity="0.9"
          fontFamily="system-ui,-apple-system,sans-serif"
        >
          {authorShort}
        </text>
      )}

      {/* Spine accent */}
      <rect x="0" y="0" width="4" height={H} fill={palette.accent} fillOpacity="0.5" />
    </svg>
  );
}

export default BookCoverPlaceholder;
