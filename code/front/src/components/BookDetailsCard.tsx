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
  isAlreadyInShelf?: boolean;
}

export function BookDetailsCard({
  isOpen,
  title,
  author,
  coverUrl,
  synopsis,
  onClose,
  onAddToShelf,
  isAlreadyInShelf = false,
}: BookDetailsCardProps) {
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
              {synopsis?.trim() ? synopsis : "Sinopse indisponivel"}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={onAddToShelf}
                disabled={isAlreadyInShelf}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  isAlreadyInShelf
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`.trim()}
              >
                {isAlreadyInShelf ? "Ja esta na estante" : "Adicionar a estante"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsCard;
