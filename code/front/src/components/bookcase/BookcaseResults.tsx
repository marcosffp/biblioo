import { BookCoverPlaceholder, EmptyState, ProgressBar, Button } from "@/components";
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

function statusLabel(status: ShelfBook["readingStatus"]): string {
  switch (status) {
    case "lendo":
      return "Lendo";
    case "relendo":
      return "Relendo";
    case "lido":
      return "Lido";
    case "abandonei":
      return "Abandonado";
    case "quero-ler":
    default:
      return "Quero ler";
  }
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,190px))] gap-4">
        {filteredBooks.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onOpenBookDetails(book)}
            className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-3 text-left transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
            aria-label={`Abrir opções do livro ${book.title}`}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-soft)]">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={`Capa de ${book.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookCoverPlaceholder size={84} />
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="truncate text-[0.95rem] font-semibold leading-tight text-[var(--text-primary)]">{book.title}</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">{book.author}</p>
            </div>

            <div className="mt-2">
              <span className="inline-flex rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                {statusLabel(book.readingStatus)}
              </span>
            </div>

            {(book.readingStatus === "lendo" || book.readingStatus === "relendo") &&
            typeof book.progress === "number" ? (
              <div className="mt-2">
                <ProgressBar value={book.progress} />
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>
                    {typeof book.currentPage === "number" && typeof book.totalPages === "number"
                      ? `p. ${book.currentPage} / ${book.totalPages}`
                      : "Progresso de leitura"}
                  </span>
                  <span className="font-semibold">{Math.round(book.progress)}%</span>
                </div>
              </div>
            ) : null}
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
              className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-4 text-left">
                <ShelfCoverFrame covers={shelf.coverPreview} shelfName={shelf.name} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[var(--text-primary)]">{shelf.name}</p>
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
              <Button onClick={() => onOpenManageCollectionShelvesModal(collection)}>
                Adicionar estantes
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}