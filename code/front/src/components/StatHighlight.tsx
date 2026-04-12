import React from "react";

export interface StatHighlightProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StatHighlight({ label, value, icon, className }: StatHighlightProps) {
  return (
    <div
      className={
        `rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()
      }
    >
      <div className="flex items-center gap-2">
        {icon ? <span className="text-emerald-600 dark:text-emerald-400">{icon}</span> : null}
        <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</div>
      </div>
      <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}

export default StatHighlight;
