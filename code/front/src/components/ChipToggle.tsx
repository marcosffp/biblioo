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
      className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${
        active ? "bg-emerald-100 text-emerald-700 border border-emerald-100" : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200"
      } ${className ?? ""}`.trim()}
    >
      {label}
    </button>
  );
}

export default ChipToggle;
