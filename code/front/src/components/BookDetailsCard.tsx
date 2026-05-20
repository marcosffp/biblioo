"use client";

import React from "react";
import { BookOpen, Star, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface BookDetailsCardProps {
  isOpen: boolean;
  title: string;
  author: string;
  coverUrl?: string;
  synopsis?: string;
  onClose: () => void;
  onAddToShelf: () => void;
  availableShelves?: Array<{ id: number; name: string }>;
  selectedShelfId?: number | null;
  onSelectShelf?: (shelfId: number) => void;
  isAlreadyInShelf?: boolean;
  isAddingToShelf?: boolean;
  addToShelfError?: string;
  currentShelfName?: string;
  pageCount?: number | null;
  averageRating?: number | null;
  readerCount?: number | null;
}

// ── sub-components ────────────────────────────────────────────────────────────

function BookCover({ coverUrl, title }: Readonly<{ coverUrl?: string; title: string }>) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`Capa de ${title}`}
        className="h-[190px] w-[140px] rounded-[18px] object-cover shadow-[0_12px_30px_rgba(15,47,44,0.22)]"
      />
    );
  }
  return (
    <div className="flex h-[190px] w-[140px] items-center justify-center rounded-[18px] bg-[var(--bg-soft)] text-sm font-semibold text-[var(--text-secondary)]">
      Capa
    </div>
  );
}

function BookMetaRow({ averageRating, pageCount, readerCount }: Readonly<{
  averageRating?: number | null;
  pageCount?: number | null;
  readerCount?: number | null;
}>) {
  if (averageRating == null && pageCount == null && readerCount == null) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
      {averageRating != null && (
        <span className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-[var(--text-primary)]">{averageRating.toFixed(1)}</span>
        </span>
      )}
      {pageCount != null && pageCount > 0 && (
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          <span>{pageCount} páginas</span>
        </span>
      )}
      {readerCount != null && readerCount > 0 && (
        <span className="flex items-center gap-1">
          <Users size={14} />
          <span>{readerCount.toLocaleString("pt-BR")} leitores</span>
        </span>
      )}
    </div>
  );
}

const SYNOPSIS_LIMIT = 280;

function BookSynopsis({ synopsis }: Readonly<{ synopsis?: string }>) {
  const [expanded, setExpanded] = React.useState(false);
  const text = synopsis?.trim() || null;
  const isLong = text ? text.length > SYNOPSIS_LIMIT : false;
  const displayed = text
    ? expanded || !isLong ? text : `${text.slice(0, SYNOPSIS_LIMIT).trimEnd()}…`
    : "Sinopse indisponível";

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Sinopse</p>
      <div className="mt-2">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{displayed}</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>
    </div>
  );
}

function ShelfFooter({ currentShelfName, availableShelves, selectedShelfId, onSelectShelf, isAlreadyInShelf, isAddingToShelf, addToShelfError, onAddToShelf }: Readonly<{
  currentShelfName?: string;
  availableShelves: Array<{ id: number; name: string }>;
  selectedShelfId: number | null;
  onSelectShelf?: (id: number) => void;
  isAlreadyInShelf: boolean;
  isAddingToShelf: boolean;
  addToShelfError?: string;
  onAddToShelf: () => void;
}>) {
  const isDisabled = isAlreadyInShelf || isAddingToShelf || (!currentShelfName && (availableShelves.length === 0 || selectedShelfId === null));
  const label = isAlreadyInShelf ? "Já está na estante" : isAddingToShelf ? "Adicionando..." : "Adicionar à estante";
  const btnClass = isDisabled
    ? "cursor-not-allowed bg-[var(--bg-soft)] text-[var(--text-secondary)]"
    : "bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] text-white shadow-[0_12px_24px_rgba(19,147,122,0.28)] hover:-translate-y-0.5";

  return (
    <div className="border-t border-[var(--border-soft)] bg-white/90 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {currentShelfName ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">Na estante</p>
            <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{currentShelfName}</p>
          </div>
        ) : (
          <div className="w-full sm:max-w-[340px]">
            <label htmlFor="book-details-shelf-select" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Adicionar na estante
            </label>
            <div className="relative mt-2">
              <select
                id="book-details-shelf-select"
                value={selectedShelfId ?? ""}
                onChange={(e) => onSelectShelf?.(Number(e.target.value))}
                disabled={availableShelves.length === 0 || isAddingToShelf}
                className="w-full appearance-none rounded-[14px] border border-[var(--border-soft)] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[hsl(var(--brand-500)/0.18)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <option value="" disabled>
                  {availableShelves.length > 0 ? "Selecione uma estante…" : "Nenhuma estante disponível"}
                </option>
                {availableShelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>{shelf.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={onAddToShelf}
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out ${btnClass}`}
          >
            {isAddingToShelf && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {label}
          </button>
          {addToShelfError && <p className="text-xs text-red-600">{addToShelfError}</p>}
        </div>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function BookDetailsCard({
  isOpen,
  title,
  author,
  coverUrl,
  synopsis,
  onClose,
  onAddToShelf,
  availableShelves = [],
  selectedShelfId = null,
  onSelectShelf,
  isAlreadyInShelf = false,
  isAddingToShelf = false,
  addToShelfError,
  currentShelfName,
  pageCount,
  averageRating,
  readerCount,
}: Readonly<BookDetailsCardProps>) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b1c17]/45 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex w-full max-w-3xl max-h-[85vh] flex-col overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-white/95 shadow-[0_30px_70px_rgba(15,47,44,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-6 py-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Detalhes do livro</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes do livro"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border-soft)] hover:bg-[var(--bg-soft)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex max-h-[78vh] flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <div className="grid gap-5 md:grid-cols-[140px_1fr]">
                <div className="flex items-start justify-center md:justify-start">
                  <BookCover coverUrl={coverUrl} title={title} />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{author || "Autor não informado"}</p>
                  <BookMetaRow averageRating={averageRating} pageCount={pageCount} readerCount={readerCount} />
                </div>
              </div>
              <BookSynopsis synopsis={synopsis} />
            </div>

            <ShelfFooter
              currentShelfName={currentShelfName}
              availableShelves={availableShelves}
              selectedShelfId={selectedShelfId}
              onSelectShelf={onSelectShelf}
              isAlreadyInShelf={isAlreadyInShelf}
              isAddingToShelf={isAddingToShelf}
              addToShelfError={addToShelfError}
              onAddToShelf={onAddToShelf}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default BookDetailsCard;
