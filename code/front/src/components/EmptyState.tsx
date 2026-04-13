import React from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: Readonly<EmptyStateProps>) {
  return (
    <div className={`text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-soft)] p-8 bg-[var(--bg-surface)] ${className ?? ""}`.trim()}>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      {action ? <div className="mt-4 inline-flex">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
