import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, BookOpen, Bookmark, BookX, Library, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState, ProfileShelfBookCard } from "@/components";
import type {
  BackendCollectionStatisticsResponse,
  BackendCollectionSummaryResponse,
  BackendShelfSummaryResponse,
} from "@/types/api";
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
  onRemoveBook?: (book: ShelfBook) => void;
  rootViewMode: RootViewMode;
  filteredShelves: BackendShelfSummaryResponse[];
  onEnterShelf: (shelf: BackendShelfSummaryResponse) => void;
  onOpenEditShelfModal: (shelf: BackendShelfSummaryResponse) => void;
  onOpenDeleteShelfModal: (shelf: BackendShelfSummaryResponse) => void;
  filteredCollections: BackendCollectionSummaryResponse[];
  onEnterCollection: (collection: BackendCollectionSummaryResponse) => void;
  onEditCollection: (collection: BackendCollectionSummaryResponse) => void;
  onDeleteCollection: (collection: BackendCollectionSummaryResponse) => void;
  selectedCollectionStats: BackendCollectionStatisticsResponse | null;
  isLoadingCollectionStats: boolean;
  collectionStatsError: string;
  selectedCollectionName: string;
  onOpenAddShelfToCollection: () => void;
}

type CollectionStatusCard = {
  label: string;
  icon: typeof BookOpen;
  toneClassName: string;
  count: number;
  tooltip: string;
};

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
  onRemoveBook,
  rootViewMode,
  filteredShelves,
  onEnterShelf,
  onOpenEditShelfModal,
  onOpenDeleteShelfModal,
  filteredCollections,
  onEnterCollection,
  onEditCollection,
  onDeleteCollection,
  selectedCollectionStats,
  isLoadingCollectionStats,
  collectionStatsError,
  selectedCollectionName,
  onOpenAddShelfToCollection,
}: Readonly<BookcaseResultsProps>) {
  const [openShelfMenuId, setOpenShelfMenuId] = useState<number | null>(null);
  const [openCollectionMenuId, setOpenCollectionMenuId] = useState<number | null>(null);
  const [openBookMenuId, setOpenBookMenuId] = useState<string | null>(null);
  const [animatedProgressPercent, setAnimatedProgressPercent] = useState(0);

  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const formatNumber = (value: number) => value.toLocaleString("pt-BR");

  const totalBooks = selectedCollectionStats?.totalBooks ?? 0;
  const booksCompleted = selectedCollectionStats?.booksCompleted ?? 0;
  const booksReading =
    selectedCollectionStats ? selectedCollectionStats.booksReading + selectedCollectionStats.booksRereading : 0;
  const booksWantToRead = selectedCollectionStats?.booksWantToRead ?? 0;
  const booksAbandoned = selectedCollectionStats?.booksAbandoned ?? 0;

  const statusCards: CollectionStatusCard[] = [
    {
      label: "Lidos",
      icon: BookMarked,
      toneClassName: "text-emerald-700",
      count: booksCompleted,
      tooltip: "Livros com status 'Lido' nas estantes desta coleção.",
    },
    {
      label: "Lendo",
      icon: BookOpen,
      toneClassName: "text-amber-700",
      count: booksReading,
      tooltip: "Livros que você está lendo ou relendo atualmente.",
    },
    {
      label: "Quero ler",
      icon: Bookmark,
      toneClassName: "text-slate-600",
      count: booksWantToRead,
      tooltip: "Livros marcados para ler futuramente.",
    },
    {
      label: "Abandonados",
      icon: BookX,
      toneClassName: "text-rose-700",
      count: booksAbandoned,
      tooltip: "Livros que você começou mas parou de ler.",
    },
  ];

  const readingProgressPercent =
    selectedCollectionStats && selectedCollectionStats.totalPages > 0
      ? Math.min(100, Math.round((selectedCollectionStats.pagesRead / selectedCollectionStats.totalPages) * 100))
      : 0;
  const readingStreakDays = Math.max(1, Math.min(30, Math.round((booksReading + booksCompleted) / 2) || 1));
  const readingGoal = Math.max(12, totalBooks + 4);
  const goalProgressPercent = Math.min(100, Math.round((totalBooks / readingGoal) * 100));

  useEffect(() => {
    setAnimatedProgressPercent(0);
    const timeoutId = window.setTimeout(() => {
      setAnimatedProgressPercent(readingProgressPercent);
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [readingProgressPercent]);

  useEffect(() => {
    if (openShelfMenuId === null && openCollectionMenuId === null && openBookMenuId === null) {
      return;
    }

    const handleWindowClick = () => {
      setOpenShelfMenuId(null);
      setOpenCollectionMenuId(null);
      setOpenBookMenuId(null);
    };

    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [openShelfMenuId, openCollectionMenuId, openBookMenuId]);

  if (loadError) {
    return (
      <motion.div className="space-y-4" initial="hidden" animate="show" variants={listVariants}>
        <EmptyState title="Falha ao carregar estante" description={loadError} />
      </motion.div>
    );
  }

  if (hasNoVisibleItems) {
    return (
      <motion.div className="space-y-4" initial="hidden" animate="show" variants={listVariants}>
        <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
      </motion.div>
    );
  }

  if (isInsideShelf) {
    return (
      <motion.div
        className="grid grid-cols-[repeat(auto-fill,minmax(170px,200px))] gap-4"
        initial="hidden"
        animate="show"
        variants={listVariants}
      >
        {filteredBooks.map((book) => (
          <motion.div key={book.id} variants={itemVariants} className="group relative">
            <ProfileShelfBookCard
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              userRating={book.rating}
              statusLabel={statusLabel(book.readingStatus)}
              statusClassName={statusClassName(book.readingStatus)}
              showProgress={true}
              progressPercent={book.progress}
              currentPage={book.currentPage}
              totalPages={book.totalPages}
              showPageCount={true}
              onClick={() => onOpenBookDetails(book)}
            />

            <div
              className="absolute right-1.5 top-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpenBookMenuId((id) => (id === book.id ? null : book.id))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60"
                aria-label={`Mais ações para ${book.title}`}
              >
                <MoreHorizontal size={14} />
              </button>

              {openBookMenuId === book.id ? (
                <div
                  className="absolute right-0 z-30 mt-1 w-44 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-soft)]"
                  role="menu"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]"
                    role="menuitem"
                    onClick={() => {
                      setOpenBookMenuId(null);
                      onOpenBookDetails(book);
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Ver detalhes</span>
                  </button>

                  {onRemoveBook ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--danger-600)] transition hover:bg-[var(--bg-soft)]"
                      role="menuitem"
                      onClick={() => {
                        setOpenBookMenuId(null);
                        onRemoveBook(book);
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remover</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (isInsideCollection) {
    return (
      <section className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="space-y-8">
          <motion.div
            className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#edf8f3] via-[#f7fcf9] to-[#ffffff] p-6 shadow-[0_16px_34px_rgba(31,61,58,0.1)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(62,190,158,0.12)] blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-16 left-16 h-44 w-44 rounded-full bg-[rgba(126,217,182,0.18)] blur-2xl" aria-hidden="true" />

            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.09em] text-[var(--text-secondary)]">Maratona de leitura</p>
                <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">{selectedCollectionName}</h2>
           
              </div>

              <div className="text-left xl:text-right">
                <p className="text-[3.6rem] font-bold leading-none text-[var(--brand-600)]">{readingProgressPercent}%</p>
                <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">concluído</p>
              </div>
            </div>

            <div className="relative mt-6 h-4 overflow-hidden rounded-full bg-[rgba(31,61,58,0.12)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-600)] transition-all duration-700 ease-out"
                style={{ width: `${animatedProgressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
              {formatNumber(selectedCollectionStats?.pagesRead ?? 0)} / {formatNumber(selectedCollectionStats?.totalPages ?? 0)} páginas lidas
            </p>
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-semibold text-[var(--text-primary)]">Estantes da coleção</h3>
              <p className="text-sm text-[var(--text-secondary)]">{filteredShelves.length} estantes</p>
            </div>

            <motion.div className="grid gap-4 md:grid-cols-2" initial="hidden" animate="show" variants={listVariants}>
              {filteredShelves.map((shelf) => (
                <motion.div
                  key={shelf.id}
                  variants={itemVariants}
                  className="relative rounded-[14px] bg-white/90 p-5 shadow-[0_8px_20px_rgba(31,61,58,0.07)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(31,61,58,0.12)]"
                >
                  <button
                    type="button"
                    onClick={() => onEnterShelf(shelf)}
                    className="w-full pr-12 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-offset-2"
                    aria-label={`Abrir estante ${shelf.name}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <ShelfCoverFrame covers={shelf.coverPreview} shelfName={shelf.name} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate text-xl font-semibold text-[var(--text-primary)]">{shelf.name}</p>
                        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                          {shelf.itemCount} {shelf.itemCount === 1 ? "livro" : "livros"}
                        </p>
                      </div>
                    </div>
                  </button>

                  <div className="absolute right-3 top-3" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenShelfMenuId((currentId) => (currentId === shelf.id ? null : shelf.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] transition duration-200 ease-out hover:bg-[#f2f7f5]"
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
                          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--text-primary)] transition duration-200 ease-out hover:bg-[var(--bg-soft)]"
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
                          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--danger-600)] transition duration-200 ease-out hover:bg-[var(--bg-soft)]"
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[14px] bg-white p-5 shadow-[0_8px_22px_rgba(31,61,58,0.07)]">
            <div className="mb-4 flex items-center gap-2">
              <Library size={16} className="text-[var(--brand-600)]" />
              <p className="text-base font-semibold text-[var(--text-primary)]">Estatísticas</p>
            </div>

            {isLoadingCollectionStats ? <p className="text-sm text-[var(--text-secondary)]">Carregando estatísticas...</p> : null}
            {!isLoadingCollectionStats && collectionStatsError ? (
              <p className="text-sm text-[var(--danger-600)]">{collectionStatsError}</p>
            ) : null}

            {!isLoadingCollectionStats && !collectionStatsError && selectedCollectionStats ? (
              <>
                <div className="group relative mb-3 rounded-[12px] bg-[#f4f8f6] px-4 py-3">
                  <div className="absolute right-2 top-2">
                    <span className="flex h-3.5 w-3.5 cursor-default items-center justify-center rounded-full bg-[var(--border-soft)] text-[8px] font-bold text-[var(--text-secondary)]">?</span>
                    <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 w-44 rounded-lg bg-gray-800 px-2.5 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      Total de livros em todas as estantes desta coleção.
                      <div className="absolute right-2 bottom-full border-4 border-transparent border-b-gray-800" />
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Total</p>
                  <p className="mt-1 text-3xl font-semibold leading-none text-[var(--text-primary)]">{formatNumber(totalBooks)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {statusCards.map((statusCard) => {
                    const StatusIcon = statusCard.icon;

                    return (
                      <div key={statusCard.label} className="group relative rounded-[12px] bg-[#f4f8f6] px-3.5 py-2.5">
                        <div className="absolute right-2 top-2">
                          <span className="flex h-3.5 w-3.5 cursor-default items-center justify-center rounded-full bg-[var(--border-soft)] text-[8px] font-bold text-[var(--text-secondary)]">?</span>
                          <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 w-44 rounded-lg bg-gray-800 px-2.5 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {statusCard.tooltip}
                            <div className="absolute right-2 bottom-full border-4 border-transparent border-b-gray-800" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon size={13} className={statusCard.toneClassName} />
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                            {statusCard.label}
                          </p>
                        </div>
                        <p className="mt-1 text-2xl font-semibold leading-none text-[var(--text-primary)]">
                          {formatNumber(statusCard.count)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>

          <div className="rounded-[14px] bg-white p-3 shadow-[0_8px_22px_rgba(31,61,58,0.07)]">
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Adicione novas estantes :)</p>
            <button
              type="button"
              onClick={onOpenAddShelfToCollection}
              className=" mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--brand-600)] px-4 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-[var(--brand-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-offset-2"
            >
              <Plus size={16} />
              <span>Adicionar estante</span>
            </button>
          </div>
        </aside>
      </section>
    );
  }

  if (rootViewMode === "estantes") {
    return (
      <motion.div className="space-y-4" initial="hidden" animate="show" variants={listVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShelves.map((shelf) => (
            <motion.div
              key={shelf.id}
              variants={itemVariants}
              className="relative rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white/80 p-4 shadow-[0_8px_18px_rgba(31,61,58,0.06)] transition hover:-translate-y-0.5 hover:border-[var(--brand-500)] hover:shadow-[0_16px_28px_rgba(31,61,58,0.12)]"
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
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4" initial="hidden" animate="show" variants={listVariants}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCollections.map((collection) => (
          <motion.div
            key={collection.id}
            variants={itemVariants}
            className="relative rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white/80 p-4 shadow-[0_8px_18px_rgba(31,61,58,0.06)] transition hover:-translate-y-0.5 hover:border-[var(--brand-500)] hover:shadow-[0_16px_28px_rgba(31,61,58,0.12)]"
          >
            <button
              type="button"
              onClick={() => onEnterCollection(collection)}
              className="w-full pr-12 text-left"
              aria-label={`Abrir coleção ${collection.name}`}
            >
              <p className="truncate text-left text-base font-semibold text-[var(--text-primary)]">{collection.name}</p>
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

            <div className="absolute right-3 top-3" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenCollectionMenuId((currentId) => (currentId === collection.id ? null : collection.id))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
                aria-label={`Mais ações para a coleção ${collection.name}`}
                aria-haspopup="menu"
                aria-expanded={openCollectionMenuId === collection.id}
              >
                <MoreHorizontal size={16} />
              </button>

              {openCollectionMenuId === collection.id ? (
                <div
                  className="absolute right-0 z-20 mt-2 w-40 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-soft)]"
                  role="menu"
                  aria-label={`Ações da coleção ${collection.name}`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]"
                    role="menuitem"
                    onClick={() => {
                      setOpenCollectionMenuId(null);
                      onEditCollection(collection);
                    }}
                  >
                    <Pencil size={14} />
                    <span>Editar coleção</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[var(--danger-600)] transition hover:bg-[var(--bg-soft)]"
                    role="menuitem"
                    onClick={() => {
                      setOpenCollectionMenuId(null);
                      onDeleteCollection(collection);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Apagar coleção</span>
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}