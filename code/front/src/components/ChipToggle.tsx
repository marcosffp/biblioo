"use client";

import React from "react";

export interface ChipToggleProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChipToggle({ label, active, onClick, className }: ChipToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-0.5 ${
        active
          ? "border-[var(--brand-600)] bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] text-white shadow-[0_10px_22px_rgba(31,61,58,0.22)]"
          : "border-[var(--border-soft)] bg-white text-[var(--text-secondary)] shadow-[0_6px_14px_rgba(31,61,58,0.06)] hover:border-[var(--brand-500)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
      } ${className ?? ""}`.trim()}
    >
      {label}
    </button>
  );
}

export default ChipToggle;
