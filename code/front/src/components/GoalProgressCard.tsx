import React from "react";
import { ProgressBar } from "./ProgressBar";

export interface GoalProgressCardProps {
  title?: string;
  current: number;
  target: number;
  className?: string;
}

export function GoalProgressCard({ title = "Meta de leitura", current, target, className }: GoalProgressCardProps) {
  const pct = target > 0 ? (current / target) * 100 : 0;

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      <div className="mt-2 text-xs text-gray-500">{current} de {target} livros</div>
      <div className="mt-3">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

export default GoalProgressCard;
