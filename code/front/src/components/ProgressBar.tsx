import React from "react";

export interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: Readonly<ProgressBarProps>) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <progress
      value={pct}
      max={100}
      className="w-full h-3 bg-[var(--brand-100)]/55 rounded-full border border-[var(--border-soft)] overflow-hidden [&::-webkit-progress-bar]:bg-[var(--brand-100)]/55 [&::-webkit-progress-value]:bg-[var(--brand-500)] [&::-moz-progress-bar]:bg-[var(--brand-500)]"
    />
  );
}

export default ProgressBar;
