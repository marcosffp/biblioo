import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { EmptyState, ProfileShelfBookCard } from "@/components";
import type { BackendCollectionSummaryResponse, BackendShelfSummaryResponse } from "@/services";
import type { RootViewMode, ShelfBook } from "@/hooks/useBookcasePage";
import { ShelfCoverFrame } from "./ShelfCoverFrame";

interface BookcaseResultsProps {
  loadError: string;
  hasNoVisibleItems: boolean;
  emptyStateTitle: string;
  emptyStateDescription: string;
  isInsideCollection: boolean;
  isInsideShelf: boolean;
  filteredBooks: ShelfBook[];
  onOpenBookDetails: (book: ShelfBook) => void;
  rootViewMode: RootViewMode;
  filteredShelves: BackendShelfSummaryResponse[];
  onEnterShelf: (shelf: BackendShelfSummaryResponse) => void;
  onOpenEditShelfModal: (shelf: BackendShelfSummaryResponse) => void;
  onOpenDeleteShelfModal: (shelf: BackendShelfSummaryResponse) => void;
  filteredCollections: BackendCollectionSummaryResponse[];
  onEnterCollection: (collection: BackendCollectionSummaryResponse) => void;
}

function statusClassName(status: ShelfBook["readingStatus"]): string {
  switch (status) {
    case "lendo":
      return "bg-blue-50 text-blue-800";
    case "quero-ler":
      return "bg-violet-50 text-violet-800";
    case "lido":
      return "bg-emerald-50 text-emerald-800";
    case "relendo":
      return "bg-amber-50 text-amber-800";
    case "abandonei":
      return "bg-rose-50 text-rose-800";
    default:
      return "bg-[var(--bg-soft)] text-[var(--text-secondary)]";
  }
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
  isInsideCollection,
  isInsideShelf,
  filteredBooks,
  onOpenBookDetails,
  rootViewMode,
  filteredShelves,
  onEnterShelf,
  onOpenEditShelfModal,
  onOpenDeleteShelfModal,
  filteredCollections,
  onEnterCollection,
}: Readonly<BookcaseResultsProps>) {
  const [openShelfMenuId, setOpenShelfMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openShelfMenuId === null) {
      return;
    }

    const handleWindowClick = () => {
      setOpenShelfMenuId(null);
    };

    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [openShelfMenuId]);

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
          <ProfileShelfBookCard
            key={book.id}
            title={book.title}
            author={book.author}
            coverUrl={book.coverUrl}
            userRating={book.rating}
            statusLabel={statusLabel(book.readingStatus)}
            statusClassName={statusClassName(book.readingStatus)}
            showProgress={typeof book.progress === "number" && book.progress > 0}
            progressPercent={book.progress}
            currentPage={book.currentPage}
            totalPages={book.totalPages}
            showPageCount={true}
            onClick={() => onOpenBookDetails(book)}
          />
        ))}
      </div>
    );
  }

  if (rootViewMode === "estantes" || isInsideCollection) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredShelves.map((shelf) => (
            <div
              key={shelf.id}
              className="relative rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--brand-500)] hover:shadow-[var(--shadow-soft)]"
            >
              <button
                type="button"
                onClick={() => onEnterShelf(shelf)}
                className="w-full pr-12 text-left"
                aria-label={`Abrir estante ${shelf.name}`}
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

              <div className="absolute right-3 top-3" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setOpenShelfMenuId((currentId) => (currentId === shelf.id ? null : shelf.id))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
                  aria-label={`Mais ações para a estante ${shelf.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openShelfMenuId === shelf.id}
                >
                  <MoreHorizontal size={16} />
                </button>

                {openShelfMenuId === shelf.id ? (
                  <div
                    className="absolute right-0 z-20 mt-2 w-40 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-soft)]"
                    role="menu"
                    aria-label={`Ações da estante ${shelf.name}`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]"
                      role="menuitem"
                      onClick={() => {
                        setOpenShelfMenuId(null);
                        onOpenEditShelfModal(shelf);
                      }}
                    >
                      <Pencil size={14} />
                      <span>Editar estante</span>
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--danger-600)] transition hover:bg-[var(--bg-soft)]"
                      role="menuitem"
                      onClick={() => {
                        setOpenShelfMenuId(null);
                        onOpenDeleteShelfModal(shelf);
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Apagar estante</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredCollections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => onEnterCollection(collection)}
            className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4"
          >
            <p className="text-left text-base font-semibold text-[var(--text-primary)]">{collection.name}</p>
            <p className="mt-1 text-left text-sm text-[var(--text-secondary)]">
              {collection.shelfCount} {collection.shelfCount === 1 ? "estante" : "estantes"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-left">
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
          </button>
        ))}
      </div>
    </div>
  );
}