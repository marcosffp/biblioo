import React from "react";

export interface SkeletonBlockProps {
  lines?: number;
  className?: string;
}

export function SkeletonBlock({ lines = 3, className }: SkeletonBlockProps) {
  return (
    <div className={`animate-pulse space-y-2 ${className ?? ""}`.trim()}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="h-3 rounded bg-gray-200 dark:bg-slate-700" />
      ))}
    </div>
  );
}

export default SkeletonBlock;
