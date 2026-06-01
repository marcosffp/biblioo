"use client";

import React from "react";
import Image from "next/image";
import { BookcaseModal, RatingStars, BookCoverPlaceholder } from "@/components";
import { updateBookReview } from "@/services/bookcase";

interface EditReviewModalProps {
  reviewId: number;
  initialRating: number;
  initialText: string;
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
  bookTitle,
  bookCoverUrl,
  bookAuthors,
  onClose,
  onSaved,
}: EditReviewModalProps) {
  const [rating, setRating] = React.useState(initialRating);
  const [text, setText] = React.useState(initialText);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const authorsText = bookAuthors?.join(", ") ?? "";

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateBookReview(reviewId, rating, text.trim());
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
            <Image
              src={bookCoverUrl}
              alt={bookTitle}
              width={32}
              height={48}
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
