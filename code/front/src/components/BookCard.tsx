import React from "react";
import { BookCoverPlaceholder } from "./BookCoverPlaceholder";
import { RatingStars } from "./RatingStars";
import { ProgressBar } from "./ProgressBar";

export type BookCardVariant = "list" | "compact";

export interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  progress?: number;
  variant?: BookCardVariant;
  className?: string;
}

export function BookCard({
  title,
  author,
  coverUrl,
  rating,
  progress,
  variant = "list",
  className,
}: BookCardProps) {
  const isCompact = variant === "compact";
  const coverSize = isCompact ? 96 : 72;

  return (
    <div
      className={`flex gap-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${
        isCompact ? "flex-col items-start" : "items-center"
      } ${className ?? ""}`.trim()}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={`Capa de ${title}`}
          className="rounded-md object-cover"
          width={coverSize}
          height={coverSize}
        />
      ) : (
        <BookCoverPlaceholder size={coverSize} />
      )}

      <div className="flex-1 w-full">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500">{author}</p>
        </div>

        {typeof rating === "number" ? (
          <div className="mt-2">
            <RatingStars value={rating} />
          </div>
        ) : null}

        {typeof progress === "number" ? (
          <div className="mt-3">
            <ProgressBar value={progress} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BookCard;
