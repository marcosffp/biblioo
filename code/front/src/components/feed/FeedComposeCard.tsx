"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Gift, ImageIcon, X } from "lucide-react";
import { BookCoverPlaceholder } from "@/components/BookCoverPlaceholder";
import { getAuthSession } from "@/services/auth";
import { createFeedPost, listShelves, listShelfItems } from "@/services/bookcase";
import type { AuthSession } from "@/types";

const MAX_IMAGES = 5;

interface ShelfBook {
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
}

interface FeedComposeCardProps {
  onPublished?: () => void;
}

export function FeedComposeCard({ onPublished }: Readonly<FeedComposeCardProps>) {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  const [shelfBooks, setShelfBooks] = React.useState<ShelfBook[]>([]);
  const [loadingBooks, setLoadingBooks] = React.useState(false);
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setSession(getAuthSession());
  }, []);

  React.useEffect(() => {
    return () => { imagePreviews.forEach((url) => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  React.useEffect(() => {
    return () => { if (gifPreview) URL.revokeObjectURL(gifPreview); };
  }, [gifPreview]);

  const handleExpand = () => {
    if (expanded) return;
    setExpanded(true);
    setLoadingBooks(true);

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
              books.push({ bookId: item.bookId, bookTitle: item.bookTitle, bookCoverUrl: item.bookCoverUrl });
            }
          }
        }
        setShelfBooks(books);
      } catch {
        // ignore — user sees empty book list
      } finally {
        setLoadingBooks(false);
      }
    };

    void load();
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const handleCancel = () => {
    setExpanded(false);
    setText("");
    setSelectedBook(null);
    setFilterQuery("");
    setImages([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    if (gifPreview) URL.revokeObjectURL(gifPreview);
    setGif(null);
    setGifPreview(null);
    setHasSpoiler(false);
    setSubmitError(null);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const toAdd = files.slice(0, MAX_IMAGES - images.length);
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
      handleCancel();
    } catch {
      setSubmitError("Não foi possível publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks =
    filterQuery.trim().length === 0
      ? shelfBooks
      : shelfBooks.filter((b) =>
          b.bookTitle.toLowerCase().includes(filterQuery.trim().toLowerCase()),
        );

  const canSubmit = (text.trim().length > 0 || selectedBook !== null) && !isSubmitting;

  const avatarUrl = session?.user.avatarUrl ?? null;
  const initials = (session?.user.username ?? "EU").slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header row — always visible */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-emerald-50 flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Seu avatar" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-emerald-700">{initials}</span>
          )}
        </div>

        {expanded ? (
          <span className="flex-1 text-sm font-semibold text-gray-700">Novo post</span>
        ) : (
          <button
            type="button"
            onClick={handleExpand}
            className="flex-1 rounded-full border border-gray-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-gray-400 transition-all hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-gray-500 active:scale-[0.99]"
          >
            O que você quer compartilhar?
          </button>
        )}

        {expanded && (
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancelar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Expanded compose form */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Book picker */}
          {!selectedBook ? (
            <div className="relative">
              <input
                type="text"
                placeholder={loadingBooks ? "Carregando estante..." : "Referenciar livro (opcional)..."}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                disabled={loadingBooks}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 disabled:opacity-50 transition-colors"
              />
              {filterQuery.trim().length >= 1 && (
                <ul className="absolute z-10 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {filteredBooks.length === 0 ? (
                    <li className="px-3 py-4 text-center text-sm text-gray-400">Nenhum livro encontrado.</li>
                  ) : (
                    filteredBooks.map((book) => (
                      <li key={book.bookId}>
                        <button
                          type="button"
                          onClick={() => { setSelectedBook(book); setFilterQuery(""); }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-emerald-50 border-b border-gray-100 last:border-0"
                        >
                          {book.bookCoverUrl ? (
                            <Image src={book.bookCoverUrl} alt={book.bookTitle} width={28} height={40} className="h-10 w-7 shrink-0 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-7 shrink-0 overflow-hidden rounded"><BookCoverPlaceholder title={book.bookTitle} /></div>
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
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              {selectedBook.bookCoverUrl ? (
                <Image src={selectedBook.bookCoverUrl} alt={selectedBook.bookTitle} width={32} height={48} className="h-12 w-8 shrink-0 rounded object-cover shadow-sm" />
              ) : (
                <div className="h-12 w-8 shrink-0 overflow-hidden rounded"><BookCoverPlaceholder title={selectedBook.bookTitle} /></div>
              )}
              <p className="flex-1 truncate text-sm font-semibold text-gray-900">{selectedBook.bookTitle}</p>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Remover livro"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Text area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que você quer compartilhar?"
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-colors"
          />

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <Image src={src} alt={`Foto ${i + 1}`} width={80} height={80} className="h-20 w-20 rounded-lg object-cover border border-gray-200" unoptimized />
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
              <Image src={gifPreview} alt="GIF selecionado" width={400} height={160} className="max-h-40 rounded-lg border border-gray-200" unoptimized />
              <button
                type="button"
                onClick={() => { if (gifPreview) URL.revokeObjectURL(gifPreview); setGif(null); setGifPreview(null); }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-900"
                aria-label="Remover GIF"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImagePick} />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES || gif !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <ImageIcon size={14} className="text-emerald-500" />
              Foto {images.length > 0 ? `(${images.length}/${MAX_IMAGES})` : ""}
            </button>

            <input ref={gifInputRef} type="file" accept="image/gif" className="hidden" onChange={handleGifPick} />
            <button
              type="button"
              onClick={() => gifInputRef.current?.click()}
              disabled={images.length > 0 || gif !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <Gift size={14} className="text-emerald-500" />
              GIF
            </button>

            <label className="ml-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500">
              <span
                onClick={() => setHasSpoiler((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${hasSpoiler ? "bg-amber-400" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${hasSpoiler ? "translate-x-4" : "translate-x-0"}`} />
              </span>
              Spoiler
            </label>

            {submitError && <p className="ml-2 text-xs text-red-500">{submitError}</p>}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              className="ml-auto rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}

      {/* Collapsed quick-action bar */}
      {!expanded && (
        <div className="flex items-center gap-1 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={handleExpand}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
          >
            <ImageIcon size={14} className="text-emerald-500" />
            Foto
          </button>
          <button
            type="button"
            onClick={handleExpand}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
          >
            <BookOpen size={14} className="text-emerald-500" />
            Livro
          </button>
          <button
            type="button"
            onClick={handleExpand}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
          >
            <Gift size={14} className="text-emerald-500" />
            GIF
          </button>

          <button
            type="button"
            onClick={handleExpand}
            className="ml-auto rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow active:scale-95"
          >
            Publicar
          </button>
        </div>
      )}
    </div>
  );
}
