import { BookCard, EmptyState, SecondaryButton } from "@/components";
import type { BackendCollectionSummaryResponse, BackendShelfSummaryResponse } from "@/services";
import type { RootViewMode, ShelfBook } from "@/hooks/useBookcasePage";

interface BookcaseResultsProps {
  loadError: string;
  hasNoVisibleItems: boolean;
  emptyStateTitle: string;
  emptyStateDescription: string;
  isInsideShelf: boolean;
  filteredBooks: ShelfBook[];
  onOpenProgressModal: (book: ShelfBook) => void;
  rootViewMode: RootViewMode;
  filteredShelves: BackendShelfSummaryResponse[];
  onEnterShelf: (shelf: BackendShelfSummaryResponse) => void;
  filteredCollections: BackendCollectionSummaryResponse[];
  onOpenManageCollectionShelvesModal: (collection: BackendCollectionSummaryResponse) => void;
}

export function BookcaseResults({
  loadError,
  hasNoVisibleItems,
  emptyStateTitle,
  emptyStateDescription,
  isInsideShelf,
  filteredBooks,
  onOpenProgressModal,
  rootViewMode,
  filteredShelves,
  onEnterShelf,
  filteredCollections,
  onOpenManageCollectionShelvesModal,
}: Readonly<BookcaseResultsProps>) {
  if (loadError) {
    return (
      <div className="space-y-4">
        <EmptyState title="Falha ao carregar estante" description={loadError} />
      </div>
    );
  }

  if (hasNoVisibleItems) {
    return (
      <div className="space-y-4">
        <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
      </div>
    );
  }

  if (isInsideShelf) {
    return (
      <div className="space-y-4">
        {filteredBooks.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onOpenProgressModal(book)}
            className="block w-full rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={`Abrir opcoes do livro ${book.title}`}
          >
            <BookCard
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              rating={book.rating}
              progress={book.progress}
              currentPage={book.currentPage}
              totalPages={book.totalPages}
              className="cursor-pointer transition hover:border-indigo-300 hover:shadow-sm dark:hover:border-indigo-500"
            />
          </button>
        ))}
      </div>
    );
  }

  if (rootViewMode === "estantes") {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredShelves.map((shelf) => (
            <button
              key={shelf.id}
              type="button"
              onClick={() => onEnterShelf(shelf)}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500"
            >
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{shelf.name}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {shelf.itemCount} {shelf.itemCount === 1 ? "livro" : "livros"}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredCollections.map((collection) => (
          <div
            key={collection.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{collection.name}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {collection.shelfCount} {collection.shelfCount === 1 ? "estante" : "estantes"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {collection.shelfPreviews.slice(0, 4).map((shelfPreview) => (
                <span
                  key={shelfPreview.id}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-slate-800 dark:text-gray-200"
                >
                  {shelfPreview.name}
                </span>
              ))}
              {collection.shelfPreviews.length === 0 ? (
                <span className="text-xs text-gray-500">Nenhuma estante vinculada</span>
              ) : null}
            </div>

            <div className="mt-4 flex justify-end">
              <SecondaryButton onClick={() => onOpenManageCollectionShelvesModal(collection)}>
                Adicionar estantes
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
