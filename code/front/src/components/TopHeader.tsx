import React from "react";

export interface TopHeaderProps {
  title?: string;
  className?: string;
}

export function TopHeader({ title = "Biblioo", className }: TopHeaderProps) {
  return (
    <header
      className={
        `fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-50 ${className ?? ""}`.trim()
      }
    >
      <div className="h-full w-full  mx-auto px-12 flex items-center">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</div>
      </div>
    </header>
  );
}

export default TopHeader;
