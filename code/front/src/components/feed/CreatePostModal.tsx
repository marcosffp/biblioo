"use client";

import React from "react";
import { X, ImageIcon, Gift } from "lucide-react";
import { BookcaseModal, BookCoverPlaceholder } from "@/components";
import {
  listShelves,
  listShelfItems,
  createFeedPost,
} from "@/services/bookcase";

const MAX_IMAGES = 5;

interface ShelfBook {
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
}

interface CreatePostModalProps {
  onClose: () => void;
  onPublished?: () => void;
}

export function CreatePostModal({ onClose, onPublished }: CreatePostModalProps) {
  const [shelfBooks, setShelfBooks] = React.useState<ShelfBook[]>([]);
  const [loadingBooks, setLoadingBooks] = React.useState(true);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [selectedBook, setSelectedBook] = React.useState<ShelfBook | null>(null);
  const [text, setText] = React.useState("");
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [gif, setGif] = React.useState<File | null>(null);
  const [gifPreview, setGifPreview] = React.useState<string | null>(null);
  const [hasSpoiler, setHasSpoiler] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const gifInputRef = React.useRef<HTMLInputElement>(null);

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

  React.useEffect(() => {
    return () => { imagePreviews.forEach((url) => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  React.useEffect(() => {
    return () => { if (gifPreview) URL.revokeObjectURL(gifPreview); };
  }, [gifPreview]);

  const filteredBooks = filterQuery.trim().length === 0
    ? shelfBooks
    : shelfBooks.filter((b) =>
        b.bookTitle.toLowerCase().includes(filterQuery.trim().toLowerCase()),
      );

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGifPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (gifPreview) URL.revokeObjectURL(gifPreview);
    setGif(file);
    setGifPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveGif = () => {
    if (gifPreview) URL.revokeObjectURL(gifPreview);
    setGif(null);
    setGifPreview(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !selectedBook) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createFeedPost(text.trim(), {
        bookId: selectedBook?.bookId,
        images: images.length > 0 ? images : undefined,
        gif: gif ?? undefined,
        hasSpoiler,
      });
      onPublished?.();
      onClose();
    } catch {
      setSubmitError("Não foi possível publicar o post. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = (text.trim().length > 0 || selectedBook !== null) && !isSubmitting;

  return (
    <BookcaseModal title="Escrever Post" onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="mt-4 space-y-5">

        {/* Book picker (optional) */}
        {!selectedBook ? (
          <div className="relative">
            <input
              type="text"
              placeholder={loadingBooks ? "Carregando estante..." : "Referenciar livro da sua estante (opcional)..."}
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={book.bookCoverUrl} alt={book.bookTitle} className="h-10 w-7 shrink-0 rounded object-cover" />
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedBook.bookCoverUrl}
                alt={selectedBook.bookTitle}
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
              aria-label="Remover livro"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Post text */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que você quer compartilhar?"
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Foto ${i + 1}`} className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-900"
                  aria-label="Remover foto"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* GIF preview */}
        {gifPreview && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gifPreview} alt="GIF selecionado" className="max-h-40 rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={handleRemoveGif}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-900"
              aria-label="Remover GIF"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Attachment buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES || gif !== null}
            title={images.length >= MAX_IMAGES ? `Máximo de ${MAX_IMAGES} fotos` : "Adicionar foto"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-100"
          >
            <ImageIcon size={14} aria-hidden />
            Foto {images.length > 0 ? `(${images.length}/${MAX_IMAGES})` : ""}
          </button>

          <input
            ref={gifInputRef}
            type="file"
            accept="image/gif"
            className="hidden"
            onChange={handleGifPick}
          />
          <button
            type="button"
            onClick={() => gifInputRef.current?.click()}
            disabled={images.length > 0 || gif !== null}
            title={images.length > 0 ? "Remova as fotos para adicionar um GIF" : gif ? "GIF já selecionado" : "Adicionar GIF"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-100"
          >
            <Gift size={14} aria-hidden />
            GIF
          </button>
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Publicando..." : "Publicar Post"}
        </button>
      </div>
    </BookcaseModal>
  );
}
