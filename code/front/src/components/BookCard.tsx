import React, { memo } from "react";
import Image from "next/image";
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
  currentPage?: number;
  totalPages?: number;
  variant?: BookCardVariant;
  className?: string;
}

export const BookCard = memo(function BookCard({
  title,
  author,
  coverUrl,
  rating,
  progress,
  currentPage,
  totalPages,
  variant = "list",
  className,
}: Readonly<BookCardProps>) {
  const isCompact = variant === "compact";
  const coverSize = isCompact ? 96 : 72;

  return (
    <div
      className={`flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 ${
        isCompact ? "flex-col items-start" : "items-center"
      } ${className ?? ""}`.trim()}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Capa de ${title}`}
          className="rounded-md object-cover"
          width={coverSize}
          height={coverSize}
        />
      ) : (
        <BookCoverPlaceholder size={coverSize} title={title} author={author} />
      )}

      <div className="flex-1 w-full">
        <div className="flex flex-col gap-1">
          <h3 className="text-[1.85rem] leading-tight font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xl text-[var(--text-secondary)]">{author}</p>
        </div>

        <div className="mt-2">
          <RatingStars value={rating} />
        </div>

        {typeof progress === "number" ? (
          <div className="mt-3">
            <ProgressBar value={progress} />
            <div className="mt-2 flex items-center justify-between gap-3 text-base text-[var(--text-secondary)]">
              <span>
                {typeof currentPage === "number" && typeof totalPages === "number"
                  ? `Página ${currentPage} de ${totalPages}`
                  : "Progresso de leitura"}
              </span>
              <span className="font-semibold text-[var(--text-secondary)]">{Math.round(progress)}%</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default BookCard;

