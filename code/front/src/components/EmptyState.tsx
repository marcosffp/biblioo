import React from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`text-center rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 ${className ?? ""}`.trim()}>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-4 inline-flex">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
