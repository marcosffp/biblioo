import React from "react";
import { Star } from "lucide-react";

type ProfileShelfBookCardProps = {
  title: string;
  coverUrl?: string;
  progressPercent?: number;
  userRating?: number;
  onClick?: () => void;
};

export function ProfileShelfBookCard({
  title,
  coverUrl,
  progressPercent,
  userRating,
  onClick,
}: ProfileShelfBookCardProps) {
  const content = (
    <>
      <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary-dark/10 p-3">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Capa de ${title}`}
            className="h-full w-full rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="line-clamp-3 pt-8 text-center text-xl font-medium text-deep-green">{title}</div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <p className="truncate text-sm font-semibold text-deep-green">{title}</p>
        {typeof userRating === "number" ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {userRating.toFixed(1)}
          </p>
        ) : null}
        <p className="truncate text-xs text-medium-text">
          {typeof progressPercent === "number" ? `${Math.round(progressPercent)}% concluido` : "Progresso indisponivel"}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:shadow-card-hover"
      >
        {content}
      </button>
    );
  }

  return <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-card-hover">{content}</article>;
}
