"use client";

import React from "react";

export interface ChipToggleProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function ChipToggle({ label, active, onClick, className }: ChipToggleProps & { className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-full font-semibold text-sm cursor-pointer transition-colors ${
        active
          ? "bg-[var(--brand-600)] text-white border border-[var(--brand-600)]"
          : "bg-[var(--bg-soft)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-soft)]"
      } ${className ?? ""}`.trim()}
    >
      {label}
    </button>
  );
}

export default ChipToggle;
