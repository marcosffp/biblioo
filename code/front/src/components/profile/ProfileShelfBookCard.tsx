import React from "react";
import { ProgressBar } from "../ProgressBar";
import { RatingStars } from "../RatingStars";
import { Bookmark } from "./Bookmark";

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
  const statusTextClass = statusClassName?.split(" ").find((token) => token.startsWith("text-"));
  const lighterStatusTextClass =
    statusTextClass
      ?.replace("text-blue-800", "text-blue-500")
      .replace("text-violet-800", "text-violet-500")
      .replace("text-emerald-800", "text-emerald-500")
      .replace("text-amber-800", "text-amber-500")
      .replace("text-rose-800", "text-rose-500") ?? undefined;
  const bookmarkColorByLabel: Record<string, string> = {
    Lendo: "text-blue-500",
    Relendo: "text-amber-500",
    Lido: "text-emerald-500",
    Abandonado: "text-rose-500",
    "Quero ler": "text-violet-500",
  };
  const bookmarkColorClass = lighterStatusTextClass ?? (statusLabel ? bookmarkColorByLabel[statusLabel] : undefined) ?? "text-primary-dark";

  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[22px]">
        {statusLabel ? <Bookmark label={statusLabel} className={bookmarkColorClass} /> : null}
        <div className="absolute inset-0 h-full w-full">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center">
              <div className="line-clamp-3 text-xl font-medium text-deep-green">{title}</div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border p-3">
        <p className="truncate text-sm font-semibold text-deep-green">{title}</p>
        {author ? <p className="truncate text-xs text-medium-text">{author}</p> : null}
        {/* Reserve a consistent space for progress so the top of the card stays identical */}
        <div className="mt-2">
          {showProgress && typeof progressPercent === "number" ? (
            <>
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
            </>
          ) : null}
        </div>
        {typeof userRating === "number" && typeof window !== "undefined" && window.location.pathname.includes("/profile") ? (
          <RatingStars value={userRating} className="mt-1" />
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="overflow-visible rounded-[22px] border border-border bg-card text-left transition-all hover:shadow-card-hover"
      >
        {content}
      </button>
    );
  }

  return <article className="overflow-visible rounded-[22px] border border-border bg-card transition-all hover:shadow-card-hover">{content}</article>;
}
