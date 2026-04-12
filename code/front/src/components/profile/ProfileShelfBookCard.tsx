import React from "react";
import { ProgressBar } from "../ProgressBar";
import { RatingStars } from "../RatingStars";

type ProfileShelfBookCardProps = {
  title: string;
  author?: string;
  coverUrl?: string;
  progressPercent?: number;
  userRating?: number | null;
  currentPage?: number;
  totalPages?: number;
  showPageCount?: boolean;
  statusLabel?: string;
  statusClassName?: string;
  showProgress?: boolean;
  onClick?: () => void;
};

export function ProfileShelfBookCard({
  title,
  author,
  coverUrl,
  progressPercent,
  userRating,
  currentPage,
  totalPages,
  showPageCount = false,
  statusLabel,
  statusClassName,
  showProgress = false,
  onClick,
}: ProfileShelfBookCardProps) {
  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Capa de ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div className="line-clamp-3 text-xl font-medium text-deep-green">{title}</div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <p className="truncate text-sm font-semibold text-deep-green">{title}</p>
        {author ? <p className="truncate text-xs text-medium-text">{author}</p> : null}
        {typeof userRating === "number" ? (
          <div className="mt-1">
            <RatingStars value={userRating} />
          </div>
        ) : null}
        {statusLabel ? (
          <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName ?? "bg-muted text-medium-text"}`}>
            {statusLabel}
          </span>
        ) : null}
        {showProgress && typeof progressPercent === "number" ? (
          <div className="mt-2">
            <ProgressBar value={progressPercent} />
            <div className="mt-2 flex items-center justify-between text-xs text-medium-text">
              {showPageCount && typeof currentPage === "number" && typeof totalPages === "number" && totalPages > 0 ? (
                <span>
                  p. {Math.max(0, Math.floor(currentPage))} / {Math.max(1, Math.floor(totalPages))}
                </span>
              ) : (
                <span />
              )}
              <span className="font-semibold">{Math.round(progressPercent)}%</span>
            </div>
          </div>
        ) : null}
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
