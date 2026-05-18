"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Heart, MessageCircle, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { UserBadge } from "./UserBadge";
import { BookCoverPlaceholder } from "./BookCoverPlaceholder";
import { BookDetailsCard } from "./BookDetailsCard";
import { CommentsSection } from "./CommentsSection";
import { getBookById } from "@/services/bookcase";
import { toggleReviewLike } from "@/services/feed";
import { ClientPortal } from "./ClientPortal";

export interface ReviewFeedCardProps {
  reviewId?: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  time?: string;
  bookId?: number | null;
  bookTitle: string;
  bookAuthors?: string[] | null;
  bookCoverUrl?: string | null;
  rating: number;
  reviewText?: string | null;
  images?: string[];
  gifUrl?: string | null;
  likes?: number;
  comments?: number;
  hasSpoiler?: boolean;
  isOwn?: boolean;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onLikeChange?: (newCount: number) => void;
}

function ConfirmDeleteModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-pop-in">
        <h3 className="text-base font-semibold text-gray-900">Apagar avaliação?</h3>
        <p className="mt-2 text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isDeleting ? "Apagando..." : "Apagar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewFeedCard({
  reviewId,
  authorName,
  authorAvatarUrl,
  time,
  bookId,
  bookTitle,
  bookAuthors,
  bookCoverUrl,
  rating,
  reviewText,
  images = [],
  gifUrl,
  likes = 0,
  comments = 0,
  hasSpoiler = false,
  isOwn = false,
  className,
  onEdit,
  onDelete,
}: ReviewFeedCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookSynopsis, setBookSynopsis] = useState<string | null | undefined>(undefined);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [likePending, setLikePending] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(comments);

  const authorsText = bookAuthors?.join(", ") ?? "";
  const subtitle = time ? `avaliou um livro · ${time}` : "avaliou um livro";

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleOpenBookModal = () => {
    setBookModalOpen(true);
    if (bookId && bookSynopsis === undefined) {
      getBookById(bookId)
        .then((b) => setBookSynopsis(b.synopsis ?? b.description ?? null))
        .catch(() => setBookSynopsis(null));
    }
  };

  const handleLike = async () => {
    if (!reviewId || likePending) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    if (!prevLiked) setHeartKey((k) => k + 1);
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikePending(true);
    try {
      const result = await toggleReviewLike(reviewId);
      setLiked(result.liked);
      if (result.liked !== !prevLiked) {
        setLikeCount(result.liked ? prevCount + 1 : prevCount - 1);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikePending(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      setConfirmDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article
        className={`group/card rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className ?? ""}`.trim()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <UserBadge name={authorName} avatarUrl={authorAvatarUrl ?? undefined} subtitle={subtitle} />

          <div className="flex items-center gap-1">
            {isOwn && reviewId != null ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Opções"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="ml-1 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-600"
                >
                  <MoreHorizontal size={16} />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg animate-pop-in">
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onEdit?.(); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Pencil size={14} className="shrink-0 text-gray-400" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); setConfirmDeleteOpen(true); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={14} className="shrink-0" />
                      Apagar
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                aria-label="Opções"
                className="ml-1 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all group-hover/card:opacity-100 hover:bg-slate-100 hover:text-gray-600"
              >
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* Book card */}
          <button
            type="button"
            onClick={handleOpenBookModal}
            className="mb-3 flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg shadow-sm">
              {bookCoverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bookCoverUrl} alt={bookTitle} className="h-full w-full object-cover" />
              ) : (
                <BookCoverPlaceholder title={bookTitle} author={bookAuthors?.[0] ?? undefined} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{bookTitle}</p>
              {authorsText ? (
                <p className="mt-0.5 truncate text-xs text-emerald-700">{authorsText}</p>
              ) : null}
              <div className="mt-1.5">
                <RatingStars value={rating} size={13} />
              </div>
            </div>
          </button>

          {/* Review text / spoiler */}
          {reviewText ? (
            <div className="mb-3">
              {hasSpoiler && !spoilerRevealed ? (
                <div className="flex flex-col items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle size={18} className="text-amber-500" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-amber-800">Esta avaliação contém spoilers</p>
                  <button
                    type="button"
                    onClick={() => setSpoilerRevealed(true)}
                    className="rounded-full bg-amber-400 px-5 py-1.5 text-xs font-bold text-white transition-all hover:bg-amber-500 active:scale-95"
                  >
                    Revelar
                  </button>
                </div>
              ) : (
                <div>
                  <p className="border-l-2 border-emerald-300 pl-3 text-sm leading-relaxed text-gray-600 line-clamp-4 whitespace-pre-line">
                    {reviewText}
                  </p>
                  {hasSpoiler && (
                    <button
                      type="button"
                      onClick={() => setSpoilerRevealed(false)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <AlertTriangle size={11} />
                      Ocultar spoiler
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Media */}
          {images && images.length > 0 ? (
            <div className={`mb-3 overflow-hidden rounded-xl ${images.length === 1 ? "" : "grid grid-cols-2 gap-1.5"}`}>
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Imagem ${i + 1} da avaliação`}
                  className={`w-full object-cover ${images.length === 1 ? "max-h-72 rounded-xl" : "h-40 rounded-lg"}`}
                />
              ))}
            </div>
          ) : gifUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifUrl}
              alt="GIF da avaliação"
              className="mb-3 w-full max-h-64 rounded-xl object-cover"
            />
          ) : null}

          {/* Footer actions */}
          <div className="mt-3 flex items-center gap-0.5 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => void handleLike()}
              disabled={!reviewId || likePending}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all active:scale-95 disabled:cursor-default ${
                liked
                  ? "bg-rose-50 text-rose-500"
                  : "text-gray-400 hover:bg-rose-50 hover:text-rose-500"
              }`}
            >
              <Heart
                key={heartKey}
                size={15}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "animate-heart-pop" : ""}
              />
              <span>{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                showComments
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <MessageCircle size={15} fill={showComments ? "currentColor" : "none"} />
              <span>{commentCount}</span>
            </button>

            <button
              type="button"
              aria-label="Compartilhar"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-400 transition-all hover:bg-slate-50 hover:text-gray-600 active:scale-95"
            >
              <Share2 size={15} />
            </button>
          </div>

          {showComments && reviewId !== undefined && (
            <CommentsSection
              contentId={reviewId}
              contentType="REVIEW"
              onCommentAdded={() => setCommentCount((c) => c + 1)}
            />
          )}
        </div>
      </article>

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        isDeleting={isDeleting}
        onConfirm={() => void handleDeleteConfirmed()}
        onCancel={() => { if (!isDeleting) setConfirmDeleteOpen(false); }}
      />

      {bookModalOpen && (
        <ClientPortal>
          <BookDetailsCard
            isOpen={bookModalOpen}
            title={bookTitle}
            author={authorsText}
            coverUrl={bookCoverUrl ?? undefined}
            synopsis={bookSynopsis ?? undefined}
            onClose={() => setBookModalOpen(false)}
            onAddToShelf={() => {}}
            availableShelves={[]}
          />
        </ClientPortal>
      )}
    </>
  );
}

export default ReviewFeedCard;
