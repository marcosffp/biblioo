"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Heart, MessageCircle, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { UserBadge } from "./UserBadge";

export interface ReviewFeedCardProps {
  reviewId?: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  time?: string;
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
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
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
        className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-3">
          <UserBadge name={authorName} avatarUrl={authorAvatarUrl ?? undefined} subtitle={subtitle} />

          {isOwn && reviewId != null ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Opções"
                onClick={() => setMenuOpen((v) => !v)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit?.(); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-700"
                  >
                    <Pencil size={14} className="shrink-0 text-gray-400" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setConfirmDeleteOpen(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
          )}
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
          <div className="mb-3">
            {hasSpoiler && !spoilerRevealed ? (
              <button
                type="button"
                onClick={() => setSpoilerRevealed(true)}
                className="inline-flex items-center gap-1.5 text-left text-xs text-muted-foreground"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Spoiler - toque para revelar
              </button>
            ) : (
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 line-clamp-3 leading-relaxed">
                  {reviewText}
                </p>
                {hasSpoiler && (
                  <button
                    type="button"
                    onClick={() => setSpoilerRevealed(false)}
                    className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Ocultar spoiler
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Mídia: imagens */}
        {images.length > 0 ? (
          <div className={`mb-3 overflow-hidden rounded-xl ${images.length === 1 ? "" : "grid grid-cols-2 gap-1"}`}>
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`Imagem ${i + 1} da avaliação`}
                className={`w-full object-cover bg-emerald-100 dark:bg-emerald-900 ${
                  images.length === 1 ? "max-h-72 rounded-xl" : "h-40 rounded-sm"
                }`}
              />
            ))}
          </div>
        ) : gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gifUrl}
            alt="GIF da avaliação"
            className="mb-3 w-full max-h-72 rounded-xl object-cover bg-emerald-100 dark:bg-emerald-900"
          />
        ) : null}

        {/* Rodapé */}
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

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        isDeleting={isDeleting}
        onConfirm={() => void handleDeleteConfirmed()}
        onCancel={() => { if (!isDeleting) setConfirmDeleteOpen(false); }}
      />
    </>
  );
}

export default ReviewFeedCard;
