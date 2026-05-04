"use client";

import React from "react";
import { X } from "lucide-react";
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
}

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
}: Readonly<BookDetailsCardProps>) {
  const [synopsisExpanded, setSynopsisExpanded] = React.useState(false);

  const synopsisText = synopsis?.trim() ? synopsis : null;
  const SYNOPSIS_LIMIT = 280;
  const synopsisIsLong = synopsisText ? synopsisText.length > SYNOPSIS_LIMIT : false;

  let addButtonLabel = "Adicionar à estante";
  if (isAlreadyInShelf) {
    addButtonLabel = "Já está na estante";
  } else if (isAddingToShelf) {
    addButtonLabel = "Adicionando...";
  }

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

            <div className="flex max-h-[78vh] flex-1 flex-col gap-4 px-6 py-5">
              <div className="grid gap-5 md:grid-cols-[140px_1fr]">
                <div className="flex items-start justify-center md:justify-start">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={`Capa de ${title}`}
                      className="h-[190px] w-[140px] rounded-[18px] object-cover shadow-[0_12px_30px_rgba(15,47,44,0.22)]"
                    />
                  ) : (
                    <div className="flex h-[190px] w-[140px] items-center justify-center rounded-[18px] bg-[var(--bg-soft)] text-sm font-semibold text-[var(--text-secondary)]">
                      Capa
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{author || "Autor não informado"}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-2.5 py-1">
                      Biblioteca Biblioo
                    </span>
                    <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-2.5 py-1">
                      Detalhes completos
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  Sinopse
                </p>
                <div className="mt-2">
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {synopsisText
                      ? synopsisExpanded || !synopsisIsLong
                        ? synopsisText
                        : `${synopsisText.slice(0, SYNOPSIS_LIMIT).trimEnd()}…`
                      : "Sinopse indisponível"}
                  </p>
                  {synopsisIsLong && (
                    <button
                      type="button"
                      onClick={() => setSynopsisExpanded((v) => !v)}
                      className="mt-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {synopsisExpanded ? "Ver menos" : "Ver mais"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-soft)] bg-white/90 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                {currentShelfName ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Adicionar na estante
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{currentShelfName}</p>
                  </div>
                ) : (
                  <div className="w-full sm:max-w-[320px]">
                    <label
                      htmlFor="book-details-shelf-select"
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                    >
                      Adicionar na estante
                    </label>
                    <select
                      id="book-details-shelf-select"
                      value={selectedShelfId ?? ""}
                      onChange={(event) => onSelectShelf?.(Number(event.target.value))}
                      disabled={availableShelves.length === 0 || isAddingToShelf}
                      className="mt-2 w-full rounded-[12px] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[rgba(63,195,167,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {availableShelves.length > 0 ? "Selecione uma estante" : "Nenhuma estante disponível"}
                      </option>
                      {availableShelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <button
                    type="button"
                    onClick={onAddToShelf}
                    disabled={isAlreadyInShelf || isAddingToShelf || (!currentShelfName && (availableShelves.length === 0 || selectedShelfId === null))}
                    className={`inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out ${
                      isAlreadyInShelf || isAddingToShelf || (!currentShelfName && (availableShelves.length === 0 || selectedShelfId === null))
                        ? "cursor-not-allowed bg-[var(--bg-soft)] text-[var(--text-secondary)]"
                        : "bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] text-white shadow-[0_12px_24px_rgba(19,147,122,0.28)] hover:-translate-y-0.5"
                    }`.trim()}
                  >
                    {isAddingToShelf ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : null}
                    {addButtonLabel}
                  </button>

                  {addToShelfError ? <p className="text-xs text-red-600">{addToShelfError}</p> : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default BookDetailsCard;
