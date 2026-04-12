import React from "react";

export interface GenreDistributionItem {
  label: string;
  value: number;
}

export interface GenreDistributionCardProps {
  title?: string;
  items: GenreDistributionItem[];
  className?: string;
}

export function GenreDistributionCard({ title = "DNA literário", items, className }: GenreDistributionCardProps) {
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      <div className="mt-3 space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.label}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GenreDistributionCard;
