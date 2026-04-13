"use client";

import Link from "next/link";
import React from "react";
import { BookOpen, BookOpenCheck, MessageSquare, Sparkles, Users } from "lucide-react";
import {
  AppShell,
  Button,
  EmptyState,
  ProfileHeaderCard,
  ProfileShelfBookCard,
  ProfileStatsGrid,
  ProfileTabs,
  ProgressBar,
  SectionHeader,
  TagList,
} from "@/components";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import type { ShelfBook } from "@/hooks/useBookcasePage";
import type { ReadingStatus } from "@/utils/bookcase-filters";
import { getAccessToken } from "@/services/auth";
import {
  BookcaseApiError,
  changeShelfItemStatus,
  createBookReview,
  getMyBookReview,
  getShelfItemById,
  updateBookReview,
  updateShelfItemProgress,
} from "@/services/bookcase";
import {
  getBookById,
  getFollowersCount,
  getFollowingCount,
  getMyProfile,
  getProfilePreferences,
  listMyShelves,
  listShelfItems,
  type ProfilePreferences,
  type ShelfItemSummaryResponse,
  type UserProfileResponse,
} from "@/services/profile";

const isOwner = true;
const isPublic = true;

const tabs = ["Estante", "Comunidades", "Resenhas"] as const;

type DisplayShelfBook = Omit<ShelfBook, "shelfItemId"> & {
  shelfItemId: number;
  shelfId: number;
  bookId: number;
};

type ShelfItemWithShelfId = ShelfItemSummaryResponse & {
  shelfId: number;
};

type GenreDistribution = {
  label: string;
  value: number;
};

function mapBackendReadingStatus(status: string): Exclude<ReadingStatus, "todos"> {
  switch (status) {
    case "READING":
      return "lendo";
    case "REREADING":
      return "relendo";
    case "COMPLETED":
      return "lido";
    case "ABANDONED":
      return "abandonei";
    case "WANT_TO_READ":
    default:
      return "quero-ler";
  }
}

function mapFrontendReadingStatus(status: Exclude<ReadingStatus, "todos">) {
  switch (status) {
    case "lendo":
      return "READING" as const;
    case "relendo":
      return "REREADING" as const;
    case "lido":
      return "COMPLETED" as const;
    case "abandonei":
      return "ABANDONED" as const;
    case "quero-ler":
    default:
      return "WANT_TO_READ" as const;
  }
}

function isDuplicateReviewError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("ja fez uma review") || normalized.includes("já fez uma review");
}

export default function PerfilPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>("Estante");
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
  const [authorItems, setAuthorItems] = React.useState<GenreDistribution[]>([]);
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
  const [reviewError, setReviewError] = React.useState("");
  const [isSavingReview, setIsSavingReview] = React.useState(false);

  const goalTarget = 24;
  const goalCurrent = booksRead;
  const goalPct = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;

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
          group.items.map((item) => ({
            ...item,
            shelfId: group.shelfId,
          })),
        );
        const uniqueItems = Array.from(new Map(flatItems.map((item) => [item.id, item])).values()) as ShelfItemWithShelfId[];
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

        const computedPagesRead = pageCountEntries.reduce((total, entry) => {
          return total + Math.round((entry.pageCount * entry.progressPercent) / 100);
        }, 0);

        const computedReadersReached = pageCountEntries.reduce((total, entry) => {
          return total + Math.max(0, entry.readerCount ?? 0);
        }, 0);

        const authorCountMap = new Map<string, number>();

        pageCountEntries.forEach((entry) => {
          entry.authors.forEach((author) => {
            if (!author || !author.trim()) {
              return;
            }

            authorCountMap.set(author, (authorCountMap.get(author) ?? 0) + 1);
          });
        });

        const computedAuthorItems = Array.from(authorCountMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([label, value]) => ({ label, value }));

        const computedFavoriteAuthors = Array.from(authorCountMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => name);

        const [followers, following] = await Promise.all([
          getFollowersCount(loadedProfile.username, accessToken),
          getFollowingCount(loadedProfile.username, accessToken),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(loadedProfile);
        setPreferences(loadedPreferences);
        setIsPublicProfile(!loadedProfile.isPrivate);
        setFollowersCount(followers);
        setFollowingCount(following);
        setBooksRead(completedCount);
        setPagesRead(computedPagesRead);
        setReadersReached(computedReadersReached);
        setAuthorItems(computedAuthorItems);
        setFavoriteAuthors(computedFavoriteAuthors);
        // build richer shelf book objects so we can render the same layout used in the main estante
        const shelfBookItems = await Promise.all(
          uniqueItems.slice(0, 8).map(async (item) => {
            try {
              const [book, detailedItem, myReview] = await Promise.all([
                getBookById(item.bookId, accessToken),
                getShelfItemById(item.shelfId, item.id),
                getMyBookReview(item.bookId),
              ]);
              const author = (book.authors && book.authors.length > 0) ? book.authors.join(", ") : "Autor desconhecido";

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
        if (cancelled) {
          return;
        }

        setLoadError("Não foi possível carregar as informações do perfil.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenShelfBookDetails = (book: DisplayShelfBook) => {
    setSelectedShelfBook(book);
    setBookDetailsError("");
    setReviewError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setIsShelfBookDetailsOpen(true);

    async function loadExistingReview() {
      const bookId = Number(book.id);
      if (Number.isNaN(bookId)) {
        return;
      }

      try {
        const existingReview = await getMyBookReview(bookId);
        if (!existingReview) {
          return;
        }

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
    setReviewError("");
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

        setShelfBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.shelfItemId === updatedItem.id
              ? {
                  ...book,
                  readingStatus: mapBackendReadingStatus(updatedItem.status),
                  progress: updatedItem.progressPercent ?? undefined,
                  currentPage: updatedItem.currentPage ?? undefined,
                  totalPages: updatedItem.totalPages ?? book.totalPages,
                }
              : book,
          ),
        );

        setSelectedShelfBook((currentBook) => {
          if (!currentBook || currentBook.shelfItemId !== updatedItem.id) {
            return currentBook;
          }

          return {
            ...currentBook,
            readingStatus: mapBackendReadingStatus(updatedItem.status),
            progress: updatedItem.progressPercent ?? undefined,
            currentPage: updatedItem.currentPage ?? undefined,
            totalPages: updatedItem.totalPages ?? currentBook.totalPages,
          };
        });
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

  const handleStepShelfBookPage = (delta: number) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;
    const currentPage = activeBook.currentPage ?? 0;
    const totalPages = activeBook.totalPages;
    const nextPage = currentPage + delta;

    if (nextPage < 0) {
      return;
    }

    if (typeof totalPages === "number" && nextPage > totalPages) {
      return;
    }

    async function updateShelfBookProgressAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");

      try {
        const requiresReadingStatus = activeBook.readingStatus !== "lendo" && activeBook.readingStatus !== "relendo";

        if (requiresReadingStatus) {
          await changeShelfItemStatus(activeBook.shelfId, activeBook.shelfItemId, "READING");
        }

        const updatedItem = await updateShelfItemProgress(activeBook.shelfId, activeBook.shelfItemId, nextPage);

        setShelfBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.shelfItemId === updatedItem.id
              ? {
                  ...book,
                  readingStatus: mapBackendReadingStatus(updatedItem.status),
                  progress: updatedItem.progressPercent ?? undefined,
                  currentPage: updatedItem.currentPage ?? undefined,
                  totalPages: updatedItem.totalPages ?? book.totalPages,
                }
              : book,
          ),
        );

        setSelectedShelfBook((currentBook) => {
          if (!currentBook || currentBook.shelfItemId !== updatedItem.id) {
            return currentBook;
          }

          return {
            ...currentBook,
            readingStatus: mapBackendReadingStatus(updatedItem.status),
            progress: updatedItem.progressPercent ?? undefined,
            currentPage: updatedItem.currentPage ?? undefined,
            totalPages: updatedItem.totalPages ?? currentBook.totalPages,
          };
        });
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

  const handleSetShelfBookPage = (nextPage: number) => {
    if (!selectedShelfBook) {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;
    const totalPages = activeBook.totalPages;

    if (!Number.isInteger(nextPage) || nextPage < 0) {
      return;
    }

    if (typeof totalPages === "number" && nextPage > totalPages) {
      return;
    }

    async function updateShelfBookProgressAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");

      try {
        const requiresReadingStatus = activeBook.readingStatus !== "lendo" && activeBook.readingStatus !== "relendo";

        if (requiresReadingStatus) {
          await changeShelfItemStatus(activeBook.shelfId, activeBook.shelfItemId, "READING");
        }

        const updatedItem = await updateShelfItemProgress(activeBook.shelfId, activeBook.shelfItemId, nextPage);

        setShelfBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.shelfItemId === updatedItem.id
              ? {
                  ...book,
                  readingStatus: mapBackendReadingStatus(updatedItem.status),
                  progress: updatedItem.progressPercent ?? undefined,
                  currentPage: updatedItem.currentPage ?? undefined,
                  totalPages: updatedItem.totalPages ?? book.totalPages,
                }
              : book,
          ),
        );

        setSelectedShelfBook((currentBook) => {
          if (!currentBook || currentBook.shelfItemId !== updatedItem.id) {
            return currentBook;
          }

          return {
            ...currentBook,
            readingStatus: mapBackendReadingStatus(updatedItem.status),
            progress: updatedItem.progressPercent ?? undefined,
            currentPage: updatedItem.currentPage ?? undefined,
            totalPages: updatedItem.totalPages ?? currentBook.totalPages,
          };
        });
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

  const handleSetReviewRating = (value: number) => {
    setReviewError("");
    setReviewRatingDraft(value);
  };

  const handleSetReviewComment = (value: string) => {
    setReviewError("");
    setReviewCommentDraft(value);
  };

  const handleSaveBookReview = () => {
    if (!selectedShelfBook) {
      setReviewError("Não foi possível identificar o livro para avaliar.");
      return;
    }

    const bookId = Number(selectedShelfBook.id);
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
      setReviewError("");

      try {
        const savedReview = activeReviewId
          ? await updateBookReview(activeReviewId, reviewRatingDraft, normalizedComment)
          : await createBookReview(bookId, reviewRatingDraft, normalizedComment);

        setActiveReviewId(savedReview.id);
        setReviewRatingDraft(savedReview.rating);
        setReviewCommentDraft(savedReview.text ?? "");
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
    Estante: BookOpen,
    Comunidades: Users,
    Resenhas: MessageSquare,
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
            <Link
              href="/profile/edit"
              className="mt-0 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm text-black shadow-sm hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Editar perfil
            </Link>
          ) : (
            <button
              type="button"
              className="mt-0 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm text-black shadow-sm hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Seguir
            </button>
          )
        }
      />

      <ProfileStatsGrid
        items={[
          { label: "Livros lidos", value: booksRead, icon: <BookOpen size={16} /> },
          { label: "Páginas lidas", value: pagesRead.toLocaleString("pt-BR"), icon: <BookOpenCheck size={16} /> },
          {
            label: "Status",
            value: booksRead > 0 ? "Leitor assíduo" : isLoading ? "Carregando" : "Começando agora",
            icon: <Sparkles size={16} />,
          },
          { label: "Leitores alcançados", value: readersReached.toLocaleString("pt-BR"), icon: <Users size={16} /> },
        ]}
      />

      {preferences.showReadingGoal ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <SectionHeader title="Meta de leitura 2024" />
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Meta de leitura 2024</span>
              <span>
                {goalCurrent}/{goalTarget}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={goalPct} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Faltam {Math.max(0, goalTarget - goalCurrent)} livros para completar sua meta.
            </p>
          </div>
        </section>
      ) : null}

      {preferences.showDnaLiterario ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <SectionHeader title="DNA literário" subtitle="Seu perfil de leitura" />
          <div className="mt-4">
            {authorItems.length > 0 ? (
              <div className="space-y-3">
                {authorItems.map((item) => {
                  const total = authorItems.reduce((acc, current) => acc + current.value, 0) || 1;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{item.label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-emerald-100">
                        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Ainda não há dados suficientes para montar seu DNA literário.</p>
            )}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="text-xs font-semibold text-gray-500">Autores favoritos</div>
              {favoriteAuthors.length > 0 ? (
                <TagList className="mt-2" tags={favoriteAuthors} />
              ) : (
                <p className="mt-2 text-sm text-gray-500">Sem autores suficientes para análise.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} iconByTab={tabIcons} />

      {activeTab === "Estante" ? (
        <section>
          {shelfBooks.length > 0 ? (
            <section className="grid grid-cols-[repeat(auto-fill,minmax(170px,190px))] items-start gap-4">
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
          ) : (
            <EmptyState
              title="Sua estante está vazia"
              description="Adicione livros para acompanhar progresso e metas no seu perfil."
              action={<Button className="!mt-0 !h-11 !w-auto rounded-2xl px-6 shadow-sm hover:shadow-md">Explorar livros</Button>}
            />
          )}
        </section>
      ) : activeTab === "Comunidades" ? (
        <EmptyState
          title="Nenhuma comunidade ainda"
          description="Encontre clubes e conversas para compartilhar suas leituras."
          action={<Button>Explorar comunidades</Button>}
        />
      ) : (
        <EmptyState
          title="Sem resenhas publicadas"
          description="Escreva uma resenha para registrar suas leituras favoritas."
          action={<Button>Escrever resenha</Button>}
        />
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <SectionHeader title="Importar Goodreads" />
        <div className="mt-4 rounded-xl border border-gray-200 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Importe sua biblioteca do Goodreads</h3>
          <p className="mt-1 text-xs text-gray-500">
            Faça upload do CSV exportado do Goodreads para adicionar seus livros à estante.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Selecionar arquivo CSV
          </button>
        </div>
      </section>

      <ShelfBookDetailsPanel
        isOpen={isShelfBookDetailsOpen}
        book={selectedShelfBook}
        onClose={handleCloseShelfBookDetails}
        onSelectStatus={handleSelectShelfBookStatus}
        onStepPage={handleStepShelfBookPage}
        onSetPage={handleSetShelfBookPage}
        onRemoveFromShelf={() => {
          // Profile page does not expose shelf removal from this modal yet.
        }}
        reviewRating={reviewRatingDraft}
        reviewComment={reviewCommentDraft}
        reviewExists={typeof activeReviewId === "number"}
        onChangeReviewRating={handleSetReviewRating}
        onChangeReviewComment={handleSetReviewComment}
        onSaveReview={handleSaveBookReview}
        reviewError={reviewError}
        isSavingReview={isSavingReview}
        isLoadingReview={false}
        isSaving={isSavingShelfBookDetails}
        isRemovingFromShelf={false}
        errorMessage={bookDetailsError}
      />

    </AppShell>
  );

  
}

