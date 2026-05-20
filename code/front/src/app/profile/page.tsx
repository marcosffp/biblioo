"use client";

import Link from "next/link";
import React from "react";
import { Activity, BookOpen, BookOpenCheck, Flame, Sparkles, Users } from "lucide-react";
import {
  AppShell,
  Button,
  EmptyState,
  ProfileHeaderCard,
  ProfileShelfBookCard,
  ProfileStatsGrid,
  ProfileTabs,
  UserActivityFeed,

  UserCommunitiesTab,
  ShareCapsuleModal,
} from "@/components";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import { ReadingGoalSection } from "@/components/profile/ReadingGoalSection";
import { LiteraryDnaSection } from "@/components/profile/LiteraryDnaSection";
import type { ReadingStatus } from "@/utils/bookcase-filters";
import {
  isDuplicateReviewError,
  mapBackendReadingStatus,
  mapFrontendReadingStatus,
} from "@/utils/bookcase-filters";
import type { DisplayShelfBook, ShelfItemWithShelfId } from "@/types/profile";
import { getAccessToken } from "@/services/auth";
import {
  BookcaseApiError,
  changeShelfItemStatus,
  createBookReview,
  getMyBookReview,
  getShelfItemById,
  removeBookFromShelf,
  updateBookReview,
  updateShelfItemProgress,
} from "@/services/bookcase";
import {
  getBookById,
  getFollowersCount,
  getFollowingCount,
  getMyProfile,
  getMyDna,
  getProfilePreferences,
  listMyShelves,
  listShelfItems,
  type DnaResponse,
  type DnaProgressResponse,
  type ProfilePreferences,
  type UserProfileResponse,
} from "@/services/profile";

function FireIcon({ count }: { count: number }) {
  if (count === 0) return <Flame size={16} className="text-muted-foreground/30" />;
  if (count <= 3)  return <Flame size={16} className="animate-flame-slow text-yellow-400" />;
  if (count <= 10) return <Flame size={16} className="animate-flame-slow text-orange-400" />;
  if (count <= 20) return <Flame size={16} className="animate-flame text-orange-500" />;
  return <Flame size={16} className="animate-flame text-red-500" />;
}

const isOwner = true;
const isPublic = true;

const BOOKS_PER_PAGE = 10;

const tabs = ["Biblioteca", "Atividade", "Comunidades"] as const;


export default function PerfilPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>("Biblioteca");
  const [shareCapsuleOpen, setShareCapsuleOpen] = React.useState(false);
  const [isPublicProfile, setIsPublicProfile] = React.useState(isPublic);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
  const [followersCount, setFollowersCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);
  const [shelfBooks, setShelfBooks] = React.useState<DisplayShelfBook[]>([]);
  const [booksRead, setBooksRead] = React.useState(0);
  const [pagesRead, setPagesRead] = React.useState(0);
  const [readersReached, setReadersReached] = React.useState(0);
  const [dna, setDna] = React.useState<DnaResponse | DnaProgressResponse | null>(null);
  const [favoriteAuthors, setFavoriteAuthors] = React.useState<string[]>([]);
  const [preferences, setPreferences] = React.useState<ProfilePreferences>({
    displayName: null,
    showReadingGoal: true,
    showDnaLiterario: true,
  });

  const [isShelfBookDetailsOpen, setIsShelfBookDetailsOpen] = React.useState(false);
  const [selectedShelfBook, setSelectedShelfBook] = React.useState<DisplayShelfBook | null>(null);
  const [bookDetailsError, setBookDetailsError] = React.useState("");
  const [isSavingShelfBookDetails, setIsSavingShelfBookDetails] = React.useState(false);
  const [activeReviewId, setActiveReviewId] = React.useState<number | null>(null);
  const [reviewRatingDraft, setReviewRatingDraft] = React.useState(0);
  const [reviewCommentDraft, setReviewCommentDraft] = React.useState("");
  const [reviewSuccessMessage, setReviewSuccessMessage] = React.useState("");
  const [reviewError, setReviewError] = React.useState("");
  const [isSavingReview, setIsSavingReview] = React.useState(false);
  const [isRemovingBookFromShelf, setIsRemovingBookFromShelf] = React.useState(false);

  const [allShelfItems, setAllShelfItems] = React.useState<ShelfItemWithShelfId[]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isFetchingPage, setIsFetchingPage] = React.useState(false);

  const [goalTarget, setGoalTarget] = React.useState<number>(() => {
    if (typeof window === "undefined") return 24;
    return parseInt(localStorage.getItem("biblioo.profile.goal.target") ?? "24", 10) || 24;
  });
  const [goalEditOpen, setGoalEditOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setLoadError("Você precisa estar logado para visualizar o perfil.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedProfile = await getMyProfile(accessToken);
        const loadedPreferences = getProfilePreferences();
        const shelves = await listMyShelves(accessToken);
        const shelfItemGroups = await Promise.all(
          shelves.map(async (shelf) => {
            const items = await listShelfItems(shelf.id, accessToken);
            return { shelfId: shelf.id, items };
          }),
        );

        const flatItems = shelfItemGroups.flatMap((group) =>
          group.items.map((item) => ({ ...item, shelfId: group.shelfId })),
        );
        const uniqueItems = Array.from(
          new Map(flatItems.map((item) => [item.id, item])).values(),
        ) as ShelfItemWithShelfId[];

        const completedCount = uniqueItems.filter((item) => item.status === "COMPLETED").length;

        const pageCountEntries = await Promise.all(
          uniqueItems.map(async (item) => {
            try {
              const book = await getBookById(item.bookId, accessToken);
              return {
                progressPercent: item.progressPercent ?? 0,
                pageCount: book.pageCount ?? 0,
                authors: book.authors ?? [],
                readerCount: book.readerCount ?? 0,
              };
            } catch {
              return { progressPercent: 0, pageCount: 0, authors: [], readerCount: 0 };
            }
          }),
        );

        const computedPagesRead = pageCountEntries.reduce(
          (total, entry) => total + Math.round((entry.pageCount * entry.progressPercent) / 100),
          0,
        );

        const computedReadersReached = pageCountEntries.reduce(
          (total, entry) => total + Math.max(0, entry.readerCount ?? 0),
          0,
        );

        const authorCountMap = new Map<string, number>();
        pageCountEntries.forEach((entry) => {
          entry.authors.forEach((author) => {
            if (author?.trim()) {
              authorCountMap.set(author, (authorCountMap.get(author) ?? 0) + 1);
            }
          });
        });
        const computedFavoriteAuthors = Array.from(authorCountMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => name);

        const [followers, following] = await Promise.all([
          getFollowersCount(loadedProfile.username, accessToken),
          getFollowingCount(loadedProfile.username, accessToken),
        ]);

        if (cancelled) return;

        setProfile(loadedProfile);
        setPreferences(loadedPreferences);
        setIsPublicProfile(!loadedProfile.isPrivate);
        setFollowersCount(followers);
        setFollowingCount(following);
        setBooksRead(completedCount);
        setPagesRead(computedPagesRead);
        setReadersReached(computedReadersReached);
        setFavoriteAuthors(computedFavoriteAuthors);

        try {
          const dnaData = await getMyDna(accessToken);
          if (!cancelled) setDna(dnaData);
        } catch {
          // DNA é opcional
        }

        setAllShelfItems(uniqueItems);

        const shelfBookItems = await Promise.all(
          uniqueItems.slice(0, BOOKS_PER_PAGE).map(async (item) => {
            try {
              const [book, detailedItem, myReview] = await Promise.all([
                getBookById(item.bookId, accessToken),
                getShelfItemById(item.shelfId, item.id),
                getMyBookReview(item.bookId),
              ]);
              const author =
                book.authors && book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido";

              return {
                shelfId: item.shelfId,
                shelfItemId: item.id,
                id: item.bookId.toString(),
                bookId: item.bookId,
                title: item.bookTitle,
                author,
                coverUrl: item.bookCoverUrl ?? book.coverUrl ?? undefined,
                rating: myReview?.rating ?? book.averageRating ?? undefined,
                synopsis: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
                description: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
                readerCount: book.readerCount ?? undefined,
                progress: item.progressPercent ?? undefined,
                readingStatus: mapBackendReadingStatus(item.status),
                currentPage: detailedItem?.currentPage ?? undefined,
                totalPages: detailedItem?.totalPages ?? book.pageCount ?? undefined,
              } as DisplayShelfBook;
            } catch {
              return {
                shelfId: item.shelfId,
                shelfItemId: item.id,
                id: item.bookId.toString(),
                bookId: item.bookId,
                title: item.bookTitle,
                author: "Autor desconhecido",
                coverUrl: item.bookCoverUrl ?? undefined,
                rating: undefined,
                synopsis: undefined,
                description: undefined,
                readerCount: undefined,
                progress: item.progressPercent ?? undefined,
                readingStatus: mapBackendReadingStatus(item.status),
              } as DisplayShelfBook;
            }
          }),
        );

        setShelfBooks(shelfBookItems);
      } catch {
        if (!cancelled) setLoadError("Não foi possível carregar as informações do perfil.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  const handleOpenShelfBookDetails = (book: DisplayShelfBook) => {
    setSelectedShelfBook(book);
    setBookDetailsError("");
    setReviewError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewSuccessMessage("");
    setIsShelfBookDetailsOpen(true);

    async function loadExistingReview() {
      const bookId = Number(book.id);
      if (Number.isNaN(bookId)) return;
      try {
        const existingReview = await getMyBookReview(bookId);
        if (!existingReview) return;
        setActiveReviewId(existingReview.id);
        setReviewRatingDraft(existingReview.rating);
        setReviewCommentDraft(existingReview.text ?? "");
      } catch {
        // noop: if loading existing review fails, user can still write a new one
      }
    }

    void loadExistingReview();
  };

  const handleCloseShelfBookDetails = () => {
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
    setBookDetailsError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewSuccessMessage("");
    setReviewError("");
  };

  const handleRemoveFromShelf = () => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }

    const { shelfId, shelfItemId } = selectedShelfBook;

    async function removeAction() {
      setIsRemovingBookFromShelf(true);
      setBookDetailsError("");
      try {
        await removeBookFromShelf(shelfId, shelfItemId);

        setShelfBooks((books) => books.filter((b) => b.shelfItemId !== shelfItemId));
        setAllShelfItems((items) => items.filter((i) => i.id !== shelfItemId));
        handleCloseShelfBookDetails();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para remover livros da estante.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível remover o livro da estante.");
        }
      } finally {
        setIsRemovingBookFromShelf(false);
      }
    }

    void removeAction();
  };

  const handlePageChange = async (newPage: number) => {
    const token = getAccessToken();
    if (!token) return;
    setCurrentPage(newPage);
    setIsFetchingPage(true);
    try {
      const pageItems = allShelfItems.slice(newPage * BOOKS_PER_PAGE, (newPage + 1) * BOOKS_PER_PAGE);
      const books = await Promise.all(
        pageItems.map(async (item) => {
          try {
            const [book, detailedItem, myReview] = await Promise.all([
              getBookById(item.bookId, token),
              getShelfItemById(item.shelfId, item.id),
              getMyBookReview(item.bookId),
            ]);
            const author = book.authors && book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido";
            return {
              shelfId: item.shelfId,
              shelfItemId: item.id,
              id: item.bookId.toString(),
              bookId: item.bookId,
              title: item.bookTitle,
              author,
              coverUrl: item.bookCoverUrl ?? book.coverUrl ?? undefined,
              rating: myReview?.rating ?? book.averageRating ?? undefined,
              synopsis: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
              description: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
              readerCount: book.readerCount ?? undefined,
              progress: item.progressPercent ?? undefined,
              readingStatus: mapBackendReadingStatus(item.status),
              currentPage: detailedItem?.currentPage ?? undefined,
              totalPages: detailedItem?.totalPages ?? book.pageCount ?? undefined,
            } as DisplayShelfBook;
          } catch {
            return {
              shelfId: item.shelfId,
              shelfItemId: item.id,
              id: item.bookId.toString(),
              bookId: item.bookId,
              title: item.bookTitle,
              author: "Autor desconhecido",
              coverUrl: item.bookCoverUrl ?? undefined,
              rating: undefined,
              synopsis: undefined,
              description: undefined,
              readerCount: undefined,
              progress: item.progressPercent ?? undefined,
              readingStatus: mapBackendReadingStatus(item.status),
            } as DisplayShelfBook;
          }
        }),
      );
      setShelfBooks(books);
    } finally {
      setIsFetchingPage(false);
    }
  };

  const applyShelfItemUpdate = (updatedItem: { id: number; status: string; progressPercent?: number | null; currentPage?: number | null; totalPages?: number | null }) => {
    const next = {
      readingStatus: mapBackendReadingStatus(updatedItem.status),
      progress: updatedItem.progressPercent ?? undefined,
      currentPage: updatedItem.currentPage ?? undefined,
    };

    setShelfBooks((books) =>
      books.map((book) =>
        book.shelfItemId === updatedItem.id
          ? { ...book, ...next, totalPages: updatedItem.totalPages ?? book.totalPages }
          : book,
      ),
    );

    setSelectedShelfBook((current) => {
      if (!current || current.shelfItemId !== updatedItem.id) return current;
      return { ...current, ...next, totalPages: updatedItem.totalPages ?? current.totalPages };
    });
  };

  const handleSelectShelfBookStatus = (nextStatus: Exclude<ReadingStatus, "todos">) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;

    async function updateShelfBookStatusAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");
      try {
        const updatedItem = await changeShelfItemStatus(
          activeBook.shelfId,
          activeBook.shelfItemId,
          mapFrontendReadingStatus(nextStatus),
        );
        applyShelfItemUpdate(updatedItem);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para atualizar o status do livro.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível atualizar o status do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }

    void updateShelfBookStatusAction();
  };

  const updateShelfBookProgress = (nextPage: number) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;

    async function updateShelfBookProgressAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");
      try {
        if (activeBook.readingStatus !== "lendo" && activeBook.readingStatus !== "relendo") {
          await changeShelfItemStatus(activeBook.shelfId, activeBook.shelfItemId, "READING");
        }
        const updatedItem = await updateShelfItemProgress(activeBook.shelfId, activeBook.shelfItemId, nextPage);
        applyShelfItemUpdate(updatedItem);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para atualizar o progresso.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível atualizar o progresso do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }

    void updateShelfBookProgressAction();
  };

  const handleStepShelfBookPage = (delta: number) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const currentPage = selectedShelfBook.currentPage ?? 0;
    const totalPages = selectedShelfBook.totalPages;
    const nextPage = currentPage + delta;
    if (nextPage < 0) return;
    if (typeof totalPages === "number" && nextPage > totalPages) return;
    updateShelfBookProgress(nextPage);
  };

  const handleSetShelfBookPage = (nextPage: number) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const totalPages = selectedShelfBook.totalPages;
    if (!Number.isInteger(nextPage) || nextPage < 0) return;
    if (typeof totalPages === "number" && nextPage > totalPages) return;
    updateShelfBookProgress(nextPage);
  };

  const handleSetReviewRating = (value: number) => {
    setReviewSuccessMessage("");
    setReviewError("");
    setReviewRatingDraft(value);
  };

  const handleSetReviewComment = (value: string) => {
    setReviewSuccessMessage("");
    setReviewError("");
    setReviewCommentDraft(value);
  };

  const handleSaveBookReview = () => {
    if (!selectedShelfBook) {
      setReviewError("Não foi possível identificar o livro para avaliar.");
      return;
    }

    const activeBook = selectedShelfBook;
    const bookId = Number(activeBook.id);
    if (Number.isNaN(bookId)) {
      setReviewError("Não foi possível identificar o livro para avaliar.");
      return;
    }

    if (!Number.isInteger(reviewRatingDraft) || reviewRatingDraft < 1 || reviewRatingDraft > 5) {
      setReviewError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    const normalizedComment = reviewCommentDraft.trim();
    if (normalizedComment.length > 2000) {
      setReviewError("O comentário deve ter no máximo 2000 caracteres.");
      return;
    }

    if (activeReviewId && normalizedComment.length === 0) {
      setReviewError("Para editar a avaliação com as rotas atuais, informe um comentário.");
      return;
    }

    async function saveBookReviewAction() {
      setIsSavingReview(true);
      setReviewSuccessMessage("");
      setReviewError("");

      try {
        const savedReview = activeReviewId
          ? await updateBookReview(activeReviewId, reviewRatingDraft, normalizedComment)
          : await createBookReview(bookId, reviewRatingDraft, normalizedComment);

        setActiveReviewId(savedReview.id);
        setReviewRatingDraft(savedReview.rating);
        setReviewCommentDraft(savedReview.text ?? "");
        setReviewSuccessMessage("Avaliação salva com sucesso.");
      } catch (error) {
        if (error instanceof BookcaseApiError && isDuplicateReviewError(error.message)) {
          try {
            const existingReview = await getMyBookReview(bookId);
            if (existingReview) {
              setActiveReviewId(existingReview.id);
              setReviewRatingDraft(existingReview.rating);
              setReviewCommentDraft(existingReview.text ?? "");
              setReviewError("");
              return;
            }
          } catch {
            // fallback to generic error handling below
          }
        }

        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setReviewError("Faça login para salvar sua avaliação.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setReviewError(error.message);
        } else {
          setReviewError("Não foi possível salvar sua avaliação. Tente novamente.");
        }
      } finally {
        setIsSavingReview(false);
      }
    }

    void saveBookReviewAction();
  };

  const profileName = preferences.displayName?.trim() ? preferences.displayName : profile?.username ?? "Usuário";
  const profileBio = profile?.bio ?? "Sem bio cadastrada.";
  const profileHandle = profile ? `@${profile.username}` : "@usuario";
  const initial = (profileName[0] ?? "U").toUpperCase();

  const tabIcons = {
    Biblioteca: BookOpen,
    Atividade: Activity,
    Comunidades: Users,
  };

  return (
    <AppShell>
      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      <ProfileHeaderCard
        name={profileName}
        handle={profileHandle}
        bio={profileBio}
        initial={initial}
        avatarUrl={profile?.avatarUrl ?? undefined}
        bannerUrl={profile?.bannerUrl ?? undefined}
        isPrivate={!isPublicProfile}
        followersCount={followersCount}
        followingCount={followingCount}
        followersHref="/profile/followers"
        followingHref="/profile/following"
        action={
          isOwner ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShareCapsuleOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(19,147,122,0.22)] transition-all hover:-translate-y-px hover:bg-primary hover:shadow-[0_12px_24px_rgba(19,147,122,0.30)]"
              >
                <Sparkles size={14} />
                Compartilhar cápsula
              </button>
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Editar perfil
              </Link>
            </div>
          ) : null
        }
      />

      <ProfileStatsGrid
        items={[
          { label: "Livros lidos", value: booksRead, icon: <BookOpen size={16} /> },
          { label: "Páginas lidas", value: pagesRead.toLocaleString("pt-BR"), icon: <BookOpenCheck size={16} /> },
          {
            label: "Dias p/ livro",
            value:
              dna && "avgDaysPerBook" in dna && (dna as DnaResponse).avgDaysPerBook != null
                ? `${Math.round((dna as DnaResponse).avgDaysPerBook!)}d`
                : "—",
            icon: <FireIcon count={booksRead} />,
          },
          { label: "Leitores alcançados", value: readersReached.toLocaleString("pt-BR"), icon: <Users size={16} /> },
        ]}
      />

      {(preferences.showReadingGoal || preferences.showDnaLiterario) && (
        <div className={`grid gap-4 ${preferences.showReadingGoal && preferences.showDnaLiterario ? "lg:grid-cols-2" : ""}`}>
          {preferences.showReadingGoal && (
            <ReadingGoalSection
              current={booksRead}
              target={goalTarget}
              year={currentYear}
              onEdit={() => setGoalEditOpen(true)}
            />
          )}
          {preferences.showDnaLiterario && (
            <LiteraryDnaSection dna={dna} isLoading={isLoading} />
          )}
        </div>
      )}

      {goalEditOpen && (
        <GoalEditModal
          currentTarget={goalTarget}
          year={currentYear}
          onSave={(next: number) => {
            setGoalTarget(next);
            localStorage.setItem("biblioo.profile.goal.target", String(next));
            setGoalEditOpen(false);
          }}
          onClose={() => setGoalEditOpen(false)}
        />
      )}

      <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} iconByTab={tabIcons} />

      {activeTab === "Biblioteca" ? (
        <section>
          {allShelfItems.length > 0 ? (
            <>
              <section className={`grid grid-cols-[repeat(auto-fill,minmax(170px,190px))] items-start gap-4 transition-opacity duration-200 ${isFetchingPage ? "pointer-events-none opacity-50" : ""}`}>
                {shelfBooks.map((book) => (
                  <ProfileShelfBookCard
                    key={book.shelfItemId}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                    progressPercent={book.progress}
                    userRating={book.rating}
                    onClick={() => handleOpenShelfBookDetails(book)}
                  />
                ))}
              </section>

              {Math.ceil(allShelfItems.length / BOOKS_PER_PAGE) > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0 || isFetchingPage}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {Math.ceil(allShelfItems.length / BOOKS_PER_PAGE)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(allShelfItems.length / BOOKS_PER_PAGE) - 1 || isFetchingPage}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          ) : !isLoading ? (
            <EmptyState
              title="Sua biblioteca está vazia"
              description="Adicione livros para acompanhar progresso e metas no seu perfil."
              action={<Button className="!mt-0 !h-11 !w-auto rounded-2xl px-6 shadow-sm hover:shadow-md">Explorar livros</Button>}
            />
          ) : null}
        </section>
      ) : activeTab === "Atividade" ? (
        profile ? (
          <UserActivityFeed
            userId={profile.id}
            authorName={profileName}
            authorAvatarUrl={profile.avatarUrl ?? null}
            isOwnProfile
          />
        ) : null
      ) : activeTab === "Comunidades" ? (
        <UserCommunitiesTab isOwnProfile />
      ) : null}

      <ShareCapsuleModal
        open={shareCapsuleOpen}
        onClose={() => setShareCapsuleOpen(false)}
        userName={profileName}
        userHandle={profileHandle}
        avatarUrl={profile?.avatarUrl ?? null}
        booksRead={booksRead}
        pagesRead={pagesRead}
        favoriteAuthors={favoriteAuthors}
      />

      <ShelfBookDetailsPanel
        isOpen={isShelfBookDetailsOpen}
        book={selectedShelfBook}
        onClose={handleCloseShelfBookDetails}
        onSelectStatus={handleSelectShelfBookStatus}
        onStepPage={handleStepShelfBookPage}
        onSetPage={handleSetShelfBookPage}
        onRemoveFromShelf={handleRemoveFromShelf}
        reviewRating={reviewRatingDraft}
        reviewComment={reviewCommentDraft}
        reviewExists={typeof activeReviewId === "number"}
        onChangeReviewRating={handleSetReviewRating}
        onChangeReviewComment={handleSetReviewComment}
        onSaveReview={handleSaveBookReview}
        reviewSuccessMessage={reviewSuccessMessage}
        reviewError={reviewError}
        isSavingReview={isSavingReview}
        isLoadingReview={false}
        isSaving={isSavingShelfBookDetails}
        isRemovingFromShelf={isRemovingBookFromShelf}
        errorMessage={bookDetailsError}
      />
    </AppShell>
  );
}

// ─── Goal Edit Modal ──────────────────────────────────────────────────────────

function GoalEditModal({
  currentTarget,
  year,
  onSave,
  onClose,
}: Readonly<{
  currentTarget: number;
  year: number;
  onSave: (v: number) => void;
  onClose: () => void;
}>) {
  const [value, setLocalValue] = React.useState(currentTarget);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = Math.max(1, Math.min(365, value));
    onSave(n);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground">
          Meta de leitura {year}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Quantos livros você quer ler em {year}?
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <input
            type="number"
            min={1}
            max={365}
            value={value}
            onChange={(e) => setLocalValue(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-3xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <p className="mt-1.5 text-center text-xs text-muted-foreground">livros</p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
