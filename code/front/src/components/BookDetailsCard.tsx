import React from "react";
import { X } from "lucide-react";

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
}: Readonly<BookDetailsCardProps>) {
  let addButtonLabel = "Adicionar à estante";
  if (isAlreadyInShelf) {
    addButtonLabel = "Já está na estante";
  } else if (isAddingToShelf) {
    addButtonLabel = "Adicionando...";
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalhes do livro</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do livro"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${title}`}
              className="w-[120px] h-[160px] rounded-md object-cover"
            />
          ) : (
            <div className="w-[120px] h-[160px] rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
              Capa
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{author}</p>
            <p className="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {synopsis?.trim() ? synopsis : "Sinopse indisponível"}
            </p>

            <div className="mt-4">
              <label htmlFor="book-details-shelf-select" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Adicionar na estante
              </label>
              <select
                id="book-details-shelf-select"
                value={selectedShelfId ?? ""}
                onChange={(event) => onSelectShelf?.(Number(event.target.value))}
                disabled={availableShelves.length === 0 || isAddingToShelf}
                className="mt-2 w-full rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="mt-5">
              <button
                type="button"
                onClick={onAddToShelf}
                disabled={isAlreadyInShelf || isAddingToShelf || availableShelves.length === 0 || selectedShelfId === null}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  isAlreadyInShelf || isAddingToShelf || availableShelves.length === 0 || selectedShelfId === null
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`.trim()}
              >
                {addButtonLabel}
              </button>
            </div>

            {addToShelfError ? <p className="mt-3 text-sm text-red-600">{addToShelfError}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsCard;
