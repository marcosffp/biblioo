import React from "react";

export interface StatHighlightProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatHighlight({ label, value, className }: StatHighlightProps) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}

export default StatHighlight;
