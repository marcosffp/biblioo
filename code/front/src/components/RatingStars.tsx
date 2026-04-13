import React from "react";
import { Star } from "lucide-react";

export interface RatingStarsProps {
  value?: number | null; // 0-5 (supports decimals)
  size?: number;
  className?: string;
  onChange?: (value: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function RatingStars({ value, size = 14, className, onChange }: RatingStarsProps) {
  const normalizedValue = typeof value === "number" ? clamp(value, 0, 5) : null;
  const ariaLabel = normalizedValue == null ? "Sem avaliacao" : `Avaliacao ${normalizedValue.toFixed(1)} de 5`;
  const isInteractive = typeof onChange === "function";

  return (
    <div className={`inline-flex items-center gap-0.5 ${className ?? ""}`.trim()} aria-label={ariaLabel}>
      {Array.from({ length: 5 }, (_, idx) => {
        const fillPct = isInteractive
          ? idx < Math.round(normalizedValue ?? 0)
            ? 100
            : 0
          : normalizedValue == null
            ? 0
            : clamp(normalizedValue - idx, 0, 1) * 100;

        if (isInteractive) {
          const starValue = idx + 1;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(starValue)}
              className="relative inline-block leading-none transition"
              style={{ width: size, height: size }}
              aria-label={`${starValue} estrela${starValue > 1 ? "s" : ""}`}
              aria-pressed={starValue <= Math.round(normalizedValue ?? 0)}
            >
              <Star size={size} className="text-amber-200" />
              {fillPct > 0 ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                  <Star size={size} className="fill-amber-400 text-amber-400" />
                </span>
              ) : null}
            </button>
          );
        }

        return (
          <span key={idx} className="relative inline-block" style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className="text-amber-200" />
            {fillPct > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                <Star size={size} className="fill-amber-400 text-amber-400" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export default RatingStars;
