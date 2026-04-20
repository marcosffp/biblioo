"use client";

import React from "react";
import { X } from "lucide-react";
import type { CommunityBookOption, CommunityVisibility } from "../../hooks/useCommunity";

export interface CommunityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  communityName: string;
  onChangeCommunityName: (value: string) => void;
  communityDescription: string;
  onChangeCommunityDescription: (value: string) => void;
  selectedBookId: string;
  onChangeSelectedBookId: (value: string) => void;
  visibility: CommunityVisibility;
  onToggleVisibility: () => void;
  bookOptions: CommunityBookOption[];
  submitError?: string;
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
  bookOptions,
  submitError,
  canSubmit,
}: Readonly<CommunityCreateModalProps>) {
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

          <div>
            <label htmlFor="community-book" className="mb-1.5 block text-sm font-medium text-foreground">
              Livro atual da leitura
            </label>
            <select
              id="community-book"
              value={selectedBookId}
              onChange={(event) => onChangeSelectedBookId(event.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
            >
              <option value="">Selecione um livro...</option>
              {bookOptions.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
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
          </label>

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
              disabled={!canSubmit}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Criar Clube
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunityCreateModal;
