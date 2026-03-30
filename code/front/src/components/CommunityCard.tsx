import React from "react";

export interface CommunityCardProps {
  name: string;
  description?: string;
  members?: number;
  coverUrl?: string;
  className?: string;
}

export function CommunityCard({ name, description, members, coverUrl, className }: CommunityCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      {coverUrl ? (
        <img src={coverUrl} alt={name} className="w-full h-32 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-slate-800" />
      )}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        {typeof members === "number" ? (
          <p className="mt-2 text-xs text-gray-400">{members} membros</p>
        ) : null}
      </div>
    </div>
  );
}

export default CommunityCard;
