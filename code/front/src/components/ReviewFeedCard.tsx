import React from "react";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { UserBadge } from "./UserBadge";

export interface ReviewFeedCardProps {
  authorName: string;
  authorAvatarUrl?: string | null;
  time?: string;
  bookTitle: string;
  bookAuthors?: string[] | null;
  bookCoverUrl?: string | null;
  rating: number;
  reviewText?: string | null;
  likes?: number;
  comments?: number;
  className?: string;
}

export function ReviewFeedCard({
  authorName,
  authorAvatarUrl,
  time,
  bookTitle,
  bookAuthors,
  bookCoverUrl,
  rating,
  reviewText,
  likes = 0,
  comments = 0,
  className,
}: ReviewFeedCardProps) {
  const authorsText = bookAuthors?.join(", ") ?? "";
  const subtitle = time ? `avaliou um livro · ${time}` : "avaliou um livro";

  return (
    <article
      className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-3">
        <UserBadge name={authorName} avatarUrl={authorAvatarUrl ?? undefined} subtitle={subtitle} />
        <button
          type="button"
          aria-label="Opções"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Card do livro */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 flex items-center gap-3 mb-3">
        <div className="w-12 h-[68px] rounded flex-shrink-0 overflow-hidden bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
          {bookCoverUrl ? (
            <img src={bookCoverUrl} alt={bookTitle} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 text-center px-1 leading-tight">
              Capa
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
            {bookTitle}
          </p>
          {authorsText ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 line-clamp-1">
              {authorsText}
            </p>
          ) : null}
          <div className="mt-1.5">
            <RatingStars value={rating} size={14} />
          </div>
        </div>
      </div>

      {/* Texto da avaliação */}
      {reviewText ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3 line-clamp-3 leading-relaxed">
          {reviewText}
        </p>
      ) : null}

      {/* Rodapé: curtidas, comentários, compartilhar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <Heart size={16} />
            <span>{likes}</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={16} />
            <span>{comments}</span>
          </button>
        </div>
        <button
          type="button"
          aria-label="Compartilhar"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>
    </article>
  );
}

export default ReviewFeedCard;
