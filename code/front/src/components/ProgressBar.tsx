import React from "react";

export interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: Readonly<ProgressBarProps>) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full border border-gray-300 dark:border-slate-700 overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-300 ease-in-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default ProgressBar;
