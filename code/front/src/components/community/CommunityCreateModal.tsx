"use client";

import React from "react";
import { Check, X } from "lucide-react";
import type { CommunityBookOption, CommunityVisibility } from "../../hooks/useCommunity";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

export interface CommunityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormSubmitEvent) => void;
  communityName: string;
  onChangeCommunityName: (value: string) => void;
  communityDescription: string;
  onChangeCommunityDescription: (value: string) => void;
  selectedBookId: string;
  onChangeSelectedBookId: (value: string) => void;
  visibility: CommunityVisibility;
  onToggleVisibility: () => void;
  bookSearchTerm: string;
  onChangeBookSearchTerm: (value: string) => void;
  isSearchingBooks: boolean;
  bookOptions: CommunityBookOption[];
  bookSearchError?: string;
  submitError?: string;
  isSubmitting?: boolean;
  canSubmit: boolean;
}

export function CommunityCreateModal({
  isOpen,
  onClose,
  onSubmit,
  communityName,
  onChangeCommunityName,
  communityDescription,
  onChangeCommunityDescription,
  selectedBookId,
  onChangeSelectedBookId,
  visibility,
  onToggleVisibility,
  bookSearchTerm,
  onChangeBookSearchTerm,
  isSearchingBooks,
  bookOptions,
  bookSearchError,
  submitError,
  isSubmitting = false,
  canSubmit,
}: Readonly<CommunityCreateModalProps>) {
  const selectorRef = React.useRef<HTMLDivElement | null>(null);

  const selectedBook = bookOptions.find((book) => String(book.id) === selectedBookId) ?? null;
  const hasMinimumSearch = bookSearchTerm.trim().length >= 2;
  const showSuggestions = hasMinimumSearch || isSearchingBooks || bookOptions.length > 0;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-2xl leading-none font-semibold text-foreground">Criar Clube do Livro</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="community-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Nome do clube
            </label>
            <input
              id="community-name"
              type="text"
              value={communityName}
              onChange={(event) => onChangeCommunityName(event.target.value)}
              placeholder="Ex: Clube Machado de Assis"
              maxLength={80}
              autoFocus
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
            />
          </div>

          <div>
            <label htmlFor="community-description" className="mb-1.5 block text-sm font-medium text-foreground">
              Descricao <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="community-description"
              value={communityDescription}
              onChange={(event) => onChangeCommunityDescription(event.target.value)}
              placeholder="Descreva o objetivo da comunidade..."
              rows={3}
              maxLength={300}
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
            />
          </div>

          <div ref={selectorRef}>
            <label htmlFor="community-book-search" className="mb-1.5 block text-sm font-medium text-foreground">
              Livro da comunidade
            </label>

            <input
              id="community-book-search"
              type="text"
              value={bookSearchTerm}
              onChange={(event) => {
                onChangeBookSearchTerm(event.target.value);
                onChangeSelectedBookId("");
              }}
              placeholder="Digite para buscar livros"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
            />

            <p className="mt-1 px-1 text-xs text-muted-foreground">
              {isSearchingBooks
                ? "Buscando livros..."
                : "Digite e selecione um livro na lista abaixo."}
            </p>

            {showSuggestions ? (
              <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-sm">
                {bookOptions.length === 0 && !isSearchingBooks ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    Nenhum livro encontrado para este termo.
                  </p>
                ) : null}

                {bookOptions.map((book) => {
                  const optionId = String(book.id);
                  const isSelected = optionId === selectedBookId;

                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        onChangeSelectedBookId(optionId);
                        onChangeBookSearchTerm(book.title);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${isSelected ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted/50"}`}
                    >
                      <span className="truncate pr-3">{book.title} - {book.author}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selectedBook ? (
              <p className="mt-1 px-1 text-xs text-foreground">
                Selecionado: {selectedBook.title} - {selectedBook.author}
              </p>
            ) : null}

            {bookSearchError ? <p className="mt-1 text-xs text-red-600">{bookSearchError}</p> : null}
          </div>

          <div className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={onToggleVisibility}
              className={`relative h-6 w-10 rounded-full transition-colors ${visibility === "PRIVATE" ? "bg-primary" : "bg-muted"}`}
              aria-label="Alternar privacidade do clube"
              aria-pressed={visibility === "PRIVATE"}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${visibility === "PRIVATE" ? "left-5" : "left-1"}`}
              />
            </button>
            <span>
              <span className="block text-sm font-medium text-foreground">Clube privado</span>
              <span className="block text-xs text-muted-foreground">Apenas membros convidados podem participar</span>
            </span>
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Criando..." : "Criar Clube"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunityCreateModal;
