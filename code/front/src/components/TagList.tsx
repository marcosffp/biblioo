import React from "react";

export interface TagListProps {
  tags: string[];
  className?: string;
}

export function TagList({ tags, className }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`.trim()}>
      {tags.map((tag) => (
        <span key={tag} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
          {tag}
        </span>
      ))}
    </div>
  );
}

export default TagList;
