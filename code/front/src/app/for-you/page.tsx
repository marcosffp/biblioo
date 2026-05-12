"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Shuffle, Star, Users } from "lucide-react";
import { AppShell, BookCoverPlaceholder, Button, PageHeader, SkeletonBlock } from "@/components";
import { BookDetailsCard } from "@/components/BookDetailsCard";
import {
  addBookToShelf,
  getBookById,
  listShelves,
  type BackendBookResponse,
  type BackendShelfSummaryResponse,
} from "@/services/bookcase";
import {
  getBecauseYouRead,
  getCatalogSurprise,
  getFavoriteGenreNow,
  getRereadWorthIt,
  getSimilarAuthors,
  getTrendingInCommunities,
  rollDice,
  type BecauseYouReadData,
  type DiceRollBook,
  type FavoriteGenreNowData,
  type RecommendedBook,
} from "@/services/recommendations";

// ─── sub-components ───────────────────────────────────────────────────────────

function RatingBadge({ value }: { value?: number | null }) {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
      <Star className="h-2.5 w-2.5 fill-white" />
      {value.toFixed(1)}
    </span>
  );
}

function RecBookCard({
  book,
  onClick,
}: {
  book: RecommendedBook;
  onClick: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(book.id)}
      className="group w-40 shrink-0 cursor-pointer text-left"
    >
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-[var(--bg-soft)]">
            <BookCoverPlaceholder size={72} />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <RatingBadge value={book.averageRating} />
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--text-primary)]">
          {book.title}
        </p>
        {book.readerCount ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <Users className="h-3 w-3" />
            {book.readerCount.toLocaleString("pt-BR")} leitores
          </p>
        ) : null}
      </div>
    </button>
  );
}

function RecRowSkeleton() {
  return (
    <section className="space-y-3">
      <SkeletonBlock lines={1} className="h-5 w-56 rounded" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <SkeletonBlock key={i} lines={3} className="h-72 w-40 shrink-0 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

function RecRow({
  title,
  subtitle,
  books,
  loading,
  onBookClick,
}: {
  title: string;
  subtitle?: string;
  books: RecommendedBook[] | null;
  loading: boolean;
  onBookClick: (id: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    if (el) ro.observe(el);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, books]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -640 : 640, behavior: "smooth" });
  };

  if (loading) return <RecRowSkeleton />;
  if (!books || books.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[1.1rem] font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-md transition hover:bg-[var(--bg-soft)]"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="h-5 w-5 text-[var(--text-primary)]" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {books.map((book) => (
            <RecBookCard key={book.id} book={book} onClick={onBookClick} />
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-md transition hover:bg-[var(--bg-soft)]"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="h-5 w-5 text-[var(--text-primary)]" />
          </button>
        )}
      </div>
    </section>
  );
}

function HeroBanner({
  book,
  loading,
  rolling,
  onRoll,
  onBookClick,
}: {
  book: DiceRollBook | null;
  loading: boolean;
  rolling: boolean;
  onRoll: () => void;
  onBookClick: (id: number) => void;
}) {
  if (loading) {
    return <SkeletonBlock lines={4} className="h-44 rounded-2xl" />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-700,#0d6e5c)] to-[var(--brand-500,#13937a)] p-6 text-white">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => book && onBookClick(book.id)}
          disabled={!book}
          className="shrink-0 disabled:cursor-default"
          aria-label={book ? `Ver detalhes de ${book.title}` : undefined}
        >
          {book?.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-36 w-24 rounded-lg object-cover shadow-lg transition hover:scale-105"
            />
          ) : (
            <div className="flex h-36 w-24 items-center justify-center rounded-lg bg-white/10">
              <BookOpen className="h-10 w-10 text-white/50" />
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">
            Recomendação do dia
          </p>
          {book ? (
            <>
              <button
                type="button"
                onClick={() => onBookClick(book.id)}
                className="mb-1 text-left text-2xl font-bold leading-tight hover:underline"
              >
                {book.title}
              </button>
              <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-white/75">
                {book.averageRating ? (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    {book.averageRating.toFixed(1)}
                  </span>
                ) : null}
                {book.pageCount ? (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {book.pageCount} páginas
                  </span>
                ) : null}
                {book.readerCount ? (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {book.readerCount.toLocaleString("pt-BR")} leitores
                  </span>
                ) : null}
              </div>
              {book.description && (
                <p className="line-clamp-2 text-sm text-white/65">{book.description}</p>
              )}
            </>
          ) : (
            <p className="text-white/60">Nenhum livro disponível no momento.</p>
          )}
        </div>

        <div className="shrink-0">
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
            onClick={onRoll}
            disabled={rolling}
          >
            <Shuffle className="h-4 w-4" />
            {rolling ? "Sorteando..." : "Sortear livro"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ParaVocePage() {
  const [diceBook, setDiceBook] = useState<DiceRollBook | null>(null);
  const [diceLoading, setDiceLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  const [becauseYouRead, setBecauseYouRead] = useState<BecauseYouReadData | null>(null);
  const [byrLoading, setByrLoading] = useState(true);

  const [favoriteGenre, setFavoriteGenre] = useState<FavoriteGenreNowData | null>(null);
  const [fgnLoading, setFgnLoading] = useState(true);

  const [trending, setTrending] = useState<RecommendedBook[] | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [catalogSurprise, setCatalogSurprise] = useState<RecommendedBook[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [similarAuthors, setSimilarAuthors] = useState<RecommendedBook[] | null>(null);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  const [rereadWorthIt, setRereadWorthIt] = useState<RecommendedBook[] | null>(null);
  const [rereadLoading, setRereadLoading] = useState(true);

  // ── book detail modal ──────────────────────────────────────────────────────
  const [modalBook, setModalBook] = useState<BackendBookResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [shelves, setShelves] = useState<BackendShelfSummaryResponse[]>([]);
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [addToShelfError, setAddToShelfError] = useState("");
  const [isAlreadyInShelf, setIsAlreadyInShelf] = useState(false);

  const openBook = useCallback(async (bookId: number) => {
    setIsLoadingBook(true);
    setIsModalOpen(true);
    setModalBook(null);
    setSelectedShelfId(null);
    setAddToShelfError("");
    setIsAlreadyInShelf(false);

    try {
      const [book, shelfList] = await Promise.all([
        getBookById(bookId),
        listShelves().catch(() => [] as BackendShelfSummaryResponse[]),
      ]);
      setModalBook(book);
      setShelves(shelfList);
    } catch {
      setIsModalOpen(false);
    } finally {
      setIsLoadingBook(false);
    }
  }, []);

  const handleAddToShelf = useCallback(async () => {
    if (!modalBook || selectedShelfId === null) return;
    setIsAddingToShelf(true);
    setAddToShelfError("");
    try {
      await addBookToShelf(selectedShelfId, modalBook.id);
      setIsAlreadyInShelf(true);
    } catch (e) {
      setAddToShelfError(e instanceof Error ? e.message : "Erro ao adicionar à estante.");
    } finally {
      setIsAddingToShelf(false);
    }
  }, [modalBook, selectedShelfId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalBook(null);
  }, []);

  // ── data loading ───────────────────────────────────────────────────────────
  const handleRollDice = useCallback(async () => {
    setRolling(true);
    try {
      const result = await rollDice();
      setDiceBook(result);
    } catch {
      // keep previous book on error
    } finally {
      setRolling(false);
      setDiceLoading(false);
    }
  }, []);

  useEffect(() => {
    void handleRollDice();

    getBecauseYouRead()
      .then(setBecauseYouRead)
      .catch(() => setBecauseYouRead(null))
      .finally(() => setByrLoading(false));

    getFavoriteGenreNow()
      .then(setFavoriteGenre)
      .catch(() => setFavoriteGenre(null))
      .finally(() => setFgnLoading(false));

    getTrendingInCommunities()
      .then((d) => setTrending(d.books))
      .catch(() => setTrending(null))
      .finally(() => setTrendingLoading(false));

    getCatalogSurprise()
      .then((d) => setCatalogSurprise(d.books))
      .catch(() => setCatalogSurprise(null))
      .finally(() => setCatalogLoading(false));

    getSimilarAuthors()
      .then((d) => setSimilarAuthors(d.books))
      .catch(() => setSimilarAuthors(null))
      .finally(() => setAuthorsLoading(false));

    getRereadWorthIt()
      .then((d) => setRereadWorthIt(d.books))
      .catch(() => setRereadWorthIt(null))
      .finally(() => setRereadLoading(false));
  }, [handleRollDice]);

  return (
    <AppShell>
      <PageHeader
        title="Para Você"
        subtitle="Recomendações personalizadas baseadas no seu histórico"
      />

      <div className="space-y-10">
        <HeroBanner
          book={diceBook}
          loading={diceLoading}
          rolling={rolling}
          onRoll={() => void handleRollDice()}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title={
            becauseYouRead?.seedBookTitle
              ? `Porque você leu "${becauseYouRead.seedBookTitle}"`
              : "Porque você leu..."
          }
          subtitle="Leitores com gosto similar também curtiram"
          books={becauseYouRead?.books ?? null}
          loading={byrLoading}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title="Seu Gênero Favorito Agora"
          subtitle={favoriteGenre?.topGenres?.join(" · ") ?? undefined}
          books={favoriteGenre?.books ?? null}
          loading={fgnLoading}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title="Em Alta nas Comunidades"
          subtitle="Os mais comentados e discutidos essa semana"
          books={trending}
          loading={trendingLoading}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title="Surpresa do Catálogo"
          subtitle="Algo fora da sua zona de conforto para expandir horizontes"
          books={catalogSurprise}
          loading={catalogLoading}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title="Autores Similares"
          subtitle="Você pode gostar de quem escreve assim"
          books={similarAuthors}
          loading={authorsLoading}
          onBookClick={(id) => void openBook(id)}
        />

        <RecRow
          title="Releituras que Valem"
          subtitle="Livros que você leu e que merecem uma nova chance"
          books={rereadWorthIt}
          loading={rereadLoading}
          onBookClick={(id) => void openBook(id)}
        />
      </div>

      {/* Book detail modal */}
      {(isModalOpen || isLoadingBook) && (
        <BookDetailsCard
          isOpen={isModalOpen && !isLoadingBook}
          title={modalBook?.title ?? ""}
          author={modalBook?.authors?.join(", ") ?? ""}
          coverUrl={modalBook?.coverUrl ?? undefined}
          synopsis={modalBook?.synopsis ?? modalBook?.description ?? undefined}
          onClose={closeModal}
          onAddToShelf={() => void handleAddToShelf()}
          availableShelves={shelves.map((s) => ({ id: s.id, name: s.name }))}
          selectedShelfId={selectedShelfId}
          onSelectShelf={setSelectedShelfId}
          isAlreadyInShelf={isAlreadyInShelf}
          isAddingToShelf={isAddingToShelf}
          addToShelfError={addToShelfError}
        />
      )}
    </AppShell>
  );
}
