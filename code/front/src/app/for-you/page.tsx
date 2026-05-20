"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Star, Users } from "lucide-react";
import { AppShell, BookCoverPlaceholder, PageHeader, SkeletonBlock } from "@/components";
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

const DICE_DOTS: Record<1 | 2 | 3 | 4 | 5 | 6, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 28], [70, 28], [30, 50], [70, 50], [30, 72], [70, 72]],
};

function DiceFace({ value }: { value: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <svg viewBox="0 0 100 100" className="h-9 w-9" aria-hidden="true">
      <rect
        x="5" y="5" width="90" height="90" rx="20"
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="5"
      />
      {DICE_DOTS[value].map(([cx, cy], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <circle key={i} cx={cx} cy={cy} r="10" fill="white" />
      ))}
    </svg>
  );
}

type DicePhase = "idle" | "rolling" | "stopping";

function DiceRollButton({
  rolling,
  onRoll,
  onAnimationStart,
  onAnimationComplete,
}: {
  rolling: boolean;
  onRoll: () => void;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}) {
  const [face, setFace] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [phase, setPhase] = useState<DicePhase>("idle");

  useEffect(() => {
    if (rolling && phase === "idle") {
      setPhase("rolling");
      onAnimationStart?.();
    }
  }, [rolling, phase, onAnimationStart]);

  useEffect(() => {
    if (!rolling && phase === "rolling") setPhase("stopping");
  }, [rolling, phase]);

  // fast cycling while API is loading
  useEffect(() => {
    if (phase !== "rolling") return;
    const id = setInterval(() => setFace((f) => ((f % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6), 80);
    return () => clearInterval(id);
  }, [phase]);

  // exponential slowdown after API resolves
  useEffect(() => {
    if (phase !== "stopping") return;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 140;
    let count = 0;
    const step = () => {
      setFace((f) => ((f % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6);
      count++;
      if (count >= 5) {
        setPhase("idle");
        onAnimationComplete?.();
        return;
      }
      delay = Math.round(delay * 1.8);
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [phase, onAnimationComplete]);

  const isAnimating = phase !== "idle";

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={isAnimating}
      aria-label={isAnimating ? "Sorteando livro..." : "Sortear um livro aleatório"}
      className={[
        "flex flex-col items-center gap-1.5 rounded-xl border px-5 py-3 text-xs font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed",
        isAnimating
          ? "animate-dice-glow border-white/60 bg-white/20"
          : "border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50",
      ].join(" ")}
    >
      <span className={isAnimating ? "animate-dice-roll" : "transition-transform duration-300"}>
        <DiceFace value={face} />
      </span>
      <span className="tracking-wide uppercase">
        {isAnimating ? "Sorteando..." : "Sortear"}
      </span>
    </button>
  );
}

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
          <div className="h-56 w-full overflow-hidden">
            <BookCoverPlaceholder title={book.title} />
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
  // visibleBook only updates when the dice animation finishes
  const [visibleBook, setVisibleBook] = useState<DiceRollBook | null>(null);
  const [animating, setAnimating] = useState(false);
  const pendingRef = useRef<DiceRollBook | null>(null);

  useEffect(() => { pendingRef.current = book; }, [book]);

  // initial load: show the book immediately (no dice animation on first render)
  useEffect(() => {
    if (book && !visibleBook && !rolling) setVisibleBook(book);
  }, [book, visibleBook, rolling]);

  const handleStart = useCallback(() => setAnimating(true), []);
  const handleComplete = useCallback(() => {
    setAnimating(false);
    setVisibleBook(pendingRef.current);
  }, []);

  if (loading) {
    return <SkeletonBlock lines={4} className="h-44 rounded-2xl" />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-700,#0d6e5c)] to-[var(--brand-500,#13937a)] p-6 text-white">
      <div className="flex items-center gap-6">

        {/* cover — blurs while dice is rolling */}
        <button
          type="button"
          onClick={() => visibleBook && !animating && onBookClick(visibleBook.id)}
          disabled={!visibleBook || animating}
          className="shrink-0 disabled:cursor-default"
          aria-label={visibleBook ? `Ver detalhes de ${visibleBook.title}` : undefined}
        >
          <div className={`transition-all duration-500 ${animating ? "opacity-25 blur-sm scale-95" : "opacity-100 blur-0 scale-100"}`}>
            {visibleBook?.coverUrl ? (
              <img
                src={visibleBook.coverUrl}
                alt={visibleBook.title}
                className="h-36 w-24 rounded-lg object-cover shadow-lg transition hover:scale-105"
              />
            ) : (
              <div className="flex h-36 w-24 items-center justify-center rounded-lg bg-white/10">
                <BookOpen className="h-10 w-10 text-white/50" />
              </div>
            )}
          </div>
        </button>

        {/* book info — fades + slides while dice is rolling */}
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">
            Recomendação do dia
          </p>
          <div className={`transition-all duration-500 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {visibleBook ? (
              <>
                <button
                  type="button"
                  onClick={() => onBookClick(visibleBook.id)}
                  disabled={animating}
                  className="mb-1 text-left text-2xl font-bold leading-tight hover:underline disabled:pointer-events-none"
                >
                  {visibleBook.title}
                </button>
                <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-white/75">
                  {visibleBook.averageRating ? (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      {visibleBook.averageRating.toFixed(1)}
                    </span>
                  ) : null}
                  {visibleBook.pageCount ? (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {visibleBook.pageCount} páginas
                    </span>
                  ) : null}
                  {visibleBook.readerCount ? (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {visibleBook.readerCount.toLocaleString("pt-BR")} leitores
                    </span>
                  ) : null}
                </div>
                {visibleBook.description && (
                  <p className="line-clamp-2 text-sm text-white/65">{visibleBook.description}</p>
                )}
              </>
            ) : (
              <p className="text-white/60">Nenhum livro disponível no momento.</p>
            )}
          </div>
        </div>

        {/* dice button */}
        <div className="shrink-0">
          <DiceRollButton
            rolling={rolling}
            onRoll={onRoll}
            onAnimationStart={handleStart}
            onAnimationComplete={handleComplete}
          />
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
          pageCount={modalBook?.pageCount}
          averageRating={modalBook?.averageRating}
          readerCount={modalBook?.readerCount}
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
