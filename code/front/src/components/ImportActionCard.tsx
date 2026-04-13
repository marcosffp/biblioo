"use client";

import React from "react";

export interface ImportActionCardProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ImportActionCard({
  title,
  description,
  actionLabel = "Importar",
  onAction,
  className,
}: ImportActionCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default ImportActionCard;
