"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Check, ChevronDown, Plus, Search, Star, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface BookDetailsCardProps {
  isOpen: boolean;
  title: string;
  author: string;
  coverUrl?: string;
  synopsis?: string;
  onClose: () => void;
  onAddToShelf: (shelfId: number) => void;
  availableShelves?: Array<{ id: number; name: string }>;
  alreadyInShelfIds?: number[];
  isAddingToShelf?: boolean;
  addToShelfError?: string;
  pageCount?: number | null;
  averageRating?: number | null;
  readerCount?: number | null;
}

// ── sub-components ────────────────────────────────────────────────────────────

function BookCover({ coverUrl, title }: Readonly<{ coverUrl?: string; title: string }>) {
  if (coverUrl) {
    return (
      <Image
        src={coverUrl}
        alt={`Capa de ${title}`}
        width={140}
        height={190}
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

function ShelfFooter({
  availableShelves,
  alreadyInShelfIds,
  isAddingToShelf,
  addToShelfError,
  onAddToShelf,
}: Readonly<{
  availableShelves: Array<{ id: number; name: string }>;
  alreadyInShelfIds: number[];
  isAddingToShelf: boolean;
  addToShelfError?: string;
  onAddToShelf: (shelfId: number) => void;
}>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pendingShelfId, setPendingShelfId] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isAddingToShelf) setPendingShelfId(null);
  }, [isAddingToShelf]);

  React.useEffect(() => {
    if (!isOpen) { setSearch(""); return; }
    const id = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  const allInShelf =
    availableShelves.length > 0 && availableShelves.every((s) => alreadyInShelfIds.includes(s.id));

  const filtered = search.trim()
    ? availableShelves.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : availableShelves;

  function handleShelfSelect(shelfId: number) {
    if (alreadyInShelfIds.includes(shelfId)) return;
    setPendingShelfId(shelfId);
    setIsOpen(false);
    onAddToShelf(shelfId);
  }

  return (
    <div className="border-t border-[var(--border-soft)] bg-white/90 px-6 py-4">
      <div ref={containerRef} className="relative inline-block">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          disabled={availableShelves.length === 0 || isAddingToShelf || allInShelf}
          className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(19,147,122,0.22)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:translate-y-0"
        >
          {isAddingToShelf ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Plus size={15} />
          )}
          <span>
            {allInShelf
              ? "Em todas as estantes"
              : availableShelves.length === 0
                ? "Nenhuma estante"
                : "Adicionar na estante"}
          </span>
          {!allInShelf && availableShelves.length > 0 && (
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {/* Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-[16px] border border-[var(--border-soft)] bg-white shadow-[0_16px_48px_rgba(15,47,44,0.18)]"
            >
              {/* Search — only when há mais de 4 estantes */}
              {availableShelves.length > 4 && (
                <div className="border-b border-[var(--border-soft)] px-3 py-2.5">
                  <div className="flex items-center gap-2 rounded-[10px] bg-[var(--bg-soft)] px-3 py-1.5">
                    <Search size={13} className="shrink-0 text-[var(--text-secondary)]" />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar estante…"
                      className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)/70]"
                    />
                  </div>
                </div>
              )}

              {/* Lista */}
              <div className="max-h-[224px] overflow-y-auto py-1">
                {filtered.length > 0 ? (
                  filtered.map((shelf) => {
                    const isLoading = pendingShelfId === shelf.id && isAddingToShelf;
                    const isAlreadyHere = alreadyInShelfIds.includes(shelf.id);
                    return (
                      <button
                        key={shelf.id}
                        type="button"
                        onClick={() => handleShelfSelect(shelf.id)}
                        disabled={isLoading || isAlreadyHere}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isAlreadyHere
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-[var(--bg-soft)] disabled:opacity-60"
                        }`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-soft)]">
                          {isLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--brand-500)/30] border-t-[var(--brand-500)]" />
                          ) : isAlreadyHere ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <BookOpen size={13} className="text-[var(--text-secondary)]" />
                          )}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                          {shelf.name}
                        </span>
                        {isAlreadyHere ? (
                          <span className="shrink-0 text-xs font-medium text-emerald-600">Já adicionado</span>
                        ) : (
                          <Plus size={14} className="shrink-0 text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Nenhuma estante encontrada
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {addToShelfError && (
          <p className="mt-2 text-xs text-red-600">{addToShelfError}</p>
        )}
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
  alreadyInShelfIds = [],
  isAddingToShelf = false,
  addToShelfError,
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
              availableShelves={availableShelves}
              alreadyInShelfIds={alreadyInShelfIds}
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
