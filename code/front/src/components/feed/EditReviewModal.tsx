"use client";

import React from "react";
import { BookcaseModal, RatingStars, BookCoverPlaceholder } from "@/components";
import { updateBookReview } from "@/services/bookcase";

interface EditReviewModalProps {
  reviewId: number;
  initialRating: number;
  initialText: string;
  initialHasSpoiler: boolean;
  bookTitle: string;
  bookCoverUrl?: string | null;
  bookAuthors?: string[] | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditReviewModal({
  reviewId,
  initialRating,
  initialText,
  initialHasSpoiler,
  bookTitle,
  bookCoverUrl,
  bookAuthors,
  onClose,
  onSaved,
}: EditReviewModalProps) {
  const [rating, setRating] = React.useState(initialRating);
  const [text, setText] = React.useState(initialText);
  const [hasSpoiler, setHasSpoiler] = React.useState(initialHasSpoiler);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const authorsText = bookAuthors?.join(", ") ?? "";

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateBookReview(reviewId, rating, text.trim(), hasSpoiler);
      onSaved?.();
      onClose();
    } catch {
      setSubmitError("Não foi possível salvar a avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookcaseModal title="Editar Avaliação" onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="mt-4 space-y-5">

        {/* Book info (read-only) */}
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          {bookCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bookCoverUrl}
              alt={bookTitle}
              className="h-12 w-8 shrink-0 rounded object-cover shadow-sm"
            />
          ) : (
            <div className="h-12 w-8 shrink-0">
              <BookCoverPlaceholder />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{bookTitle}</p>
            {authorsText && (
              <p className="truncate text-xs text-emerald-700 mt-0.5">{authorsText}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Sua nota</p>
          <RatingStars value={rating} size={28} onChange={setRating} />
        </div>

        {/* Review text */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Sua avaliação</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que você achou do livro?"
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* Spoiler toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-800">Contém spoiler</p>
            <p className="text-xs text-gray-400">Oculta o conteúdo para quem ainda não leu</p>
          </div>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${hasSpoiler ? "bg-amber-400" : "bg-gray-300"}`}
            onClick={() => setHasSpoiler((v) => !v)}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${hasSpoiler ? "translate-x-4" : "translate-x-0"}`} />
          </span>
        </label>

        {submitError && <p className="text-xs text-red-600">{submitError}</p>}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
        </button>
      </div>
    </BookcaseModal>
  );
}
