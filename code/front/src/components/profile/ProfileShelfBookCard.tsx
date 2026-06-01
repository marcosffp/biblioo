import React from "react";
import Image from "next/image";
import { BookCoverPlaceholder } from "../BookCoverPlaceholder";
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
}: Readonly<ProfileShelfBookCardProps>) {
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
  const shouldShowProgress = showProgress;
  const shouldShowRating =
    typeof userRating === "number" &&
    globalThis.window !== undefined &&
    globalThis.window?.location.pathname.includes("/profile") === true;
  const normalizedProgressPercent = typeof progressPercent === "number" ? progressPercent : 0;
  const progressLabel = typeof progressPercent === "number" ? `${Math.round(progressPercent)}%` : "--";

  const titleClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[3/4] rounded-t-[22px]">
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-t-[22px]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Capa de ${title}`}
              width={150}
              height={200}
              className="h-full w-full object-cover"
            />
          ) : (
            <BookCoverPlaceholder title={title} author={author} className="h-full w-full" />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col border-t border-border p-3">
        <p className="text-sm font-semibold text-deep-green" style={titleClampStyle}>
          {title}
        </p>
        {author ? <p className="mt-1 truncate text-xs text-medium-text">{author}</p> : null}
        {shouldShowProgress ? (
          <div className="mt-auto pt-3">
            <ProgressBar value={normalizedProgressPercent} />
            <div className="mt-2 flex items-center justify-between text-xs text-medium-text">
              {showPageCount && typeof currentPage === "number" && typeof totalPages === "number" && totalPages > 0 ? (
                <span>
                  p. {Math.max(0, Math.floor(currentPage))} / {Math.max(1, Math.floor(totalPages))}
                </span>
              ) : (
                <span className="opacity-0">p. 0 / 0</span>
              )}
              <span className="font-semibold">{progressLabel}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-2 h-[14px]">
          {shouldShowRating ? <RatingStars value={userRating} /> : null}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        {content}
      </button>
    );
  }

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {content}
    </article>
  );
}
