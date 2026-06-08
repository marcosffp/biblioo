"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { BookcaseModal, RatingStars, BookCoverPlaceholder } from "@/components";
import {
  listShelves,
  listShelfItems,
  createBookReview,
} from "@/services/bookcase";

interface ShelfBook {
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
}

interface CreateReviewModalProps {
  onClose: () => void;
  onPublished?: () => void;
}

export function CreateReviewModal({ onClose, onPublished }: CreateReviewModalProps) {
  const [shelfBooks, setShelfBooks] = React.useState<ShelfBook[]>([]);
  const [loadingBooks, setLoadingBooks] = React.useState(true);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [selectedBook, setSelectedBook] = React.useState<ShelfBook | null>(null);
  const [rating, setRating] = React.useState(0);
  const [text, setText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const shelves = await listShelves();
        const itemArrays = await Promise.all(shelves.map((s) => listShelfItems(s.id)));
        const seen = new Set<number>();
        const books: ShelfBook[] = [];
        for (const items of itemArrays) {
          for (const item of items) {
            if (!seen.has(item.bookId)) {
              seen.add(item.bookId);
              books.push({
                bookId: item.bookId,
                bookTitle: item.bookTitle,
                bookCoverUrl: item.bookCoverUrl,
              });
            }
          }
        }
        if (!cancelled) setShelfBooks(books);
      } catch {
        // silently ignore — user sees empty list
      } finally {
        if (!cancelled) setLoadingBooks(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredBooks = filterQuery.trim().length === 0
    ? shelfBooks
    : shelfBooks.filter((b) =>
        b.bookTitle.toLowerCase().includes(filterQuery.trim().toLowerCase()),
      );

  const handleSubmit = async () => {
    if (!selectedBook || rating === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createBookReview(
        selectedBook.bookId,
        rating,
        text.trim() || undefined,
      );
      onPublished?.();
      onClose();
    } catch {
      setSubmitError("Não foi possível publicar a avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedBook !== null && rating > 0 && !isSubmitting;

  return (
    <BookcaseModal title="Avaliar Livro" onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="mt-4 space-y-5">

        {/* Book picker */}
        {!selectedBook ? (
          <div className="relative">
            <input
              type="text"
              placeholder={loadingBooks ? "Carregando estante..." : "Buscar livro na sua estante..."}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              disabled={loadingBooks}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:opacity-50"
            />

            {filterQuery.trim().length >= 1 && (
              <ul className="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredBooks.length === 0 ? (
                  <li className="px-3 py-4 text-center text-sm text-gray-400">Nenhum livro encontrado.</li>
                ) : (
                  filteredBooks.map((book) => (
                    <li key={book.bookId}>
                      <button
                        type="button"
                        onClick={() => { setSelectedBook(book); setFilterQuery(""); }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        {book.bookCoverUrl ? (
                          <Image src={book.bookCoverUrl} alt={book.bookTitle} width={28} height={40} className="h-10 w-7 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-7 shrink-0"><BookCoverPlaceholder /></div>
                        )}
                        <p className="truncate text-sm font-medium text-gray-900">{book.bookTitle}</p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            {selectedBook.bookCoverUrl ? (
              <Image
                src={selectedBook.bookCoverUrl}
                alt={selectedBook.bookTitle}
                width={32}
                height={48}
                className="h-12 w-8 shrink-0 rounded object-cover shadow-sm"
              />
            ) : (
              <div className="h-12 w-8 shrink-0">
                <BookCoverPlaceholder />
              </div>
            )}
            <p className="flex-1 truncate text-sm font-semibold text-gray-900">{selectedBook.bookTitle}</p>
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="shrink-0 text-gray-400 hover:text-gray-600"
              aria-label="Trocar livro"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Rating */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Sua nota <span className="text-red-500">*</span></p>
          <RatingStars value={rating} size={28} onChange={setRating} />
        </div>

        {/* Review text (optional) */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Descrição <span className="text-xs font-normal text-gray-400">(opcional)</span>
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que você achou do livro? Compartilhe sua experiência de leitura..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {submitError && <p className="text-xs text-red-600">{submitError}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Publicando..." : "Publicar Avaliação"}
        </button>
      </div>
    </BookcaseModal>
  );
}
