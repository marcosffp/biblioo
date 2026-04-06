import { BookCard, EmptyState, SecondaryButton } from "@/components";
import type { BackendCollectionSummaryResponse, BackendShelfSummaryResponse } from "@/services";
import type { RootViewMode, ShelfBook } from "@/hooks/useBookcasePage";
import { ShelfCoverFrame } from "./ShelfCoverFrame";

interface BookcaseResultsProps {
  loadError: string;
  hasNoVisibleItems: boolean;
  emptyStateTitle: string;
  emptyStateDescription: string;
  isInsideShelf: boolean;
  filteredBooks: ShelfBook[];
  onOpenBookDetails: (book: ShelfBook) => void;
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
  onOpenBookDetails,
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
            onClick={() => onOpenBookDetails(book)}
            className="block w-full rounded-[var(--radius-lg)] text-left focus:outline-none"
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
              className="cursor-pointer transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
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
              className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 text-left transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-4">
                <ShelfCoverFrame covers={shelf.coverPreview} shelfName={shelf.name} />
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{shelf.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {shelf.itemCount} {shelf.itemCount === 1 ? "livro" : "livros"}
                  </p>
                </div>
              </div>
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
            className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4"
          >
            <p className="text-base font-semibold text-[var(--text-primary)]">{collection.name}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {collection.shelfCount} {collection.shelfCount === 1 ? "estante" : "estantes"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {collection.shelfPreviews.slice(0, 4).map((shelfPreview) => (
                <span
                  key={shelfPreview.id}
                  className="rounded-full bg-[var(--bg-soft)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                >
                  {shelfPreview.name}
                </span>
              ))}
              {collection.shelfPreviews.length === 0 ? (
                <span className="text-xs text-[var(--text-secondary)]">Nenhuma estante vinculada</span>
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
