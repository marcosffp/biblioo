"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Activity, BookOpen, BookOpenCheck, Flame, MessageSquare, MoreHorizontal, Users } from "lucide-react";
import {
  AppShell,
  Button,
  EmptyState,
  ProfileHeaderCard,
  ProfileShelfBookCard,
  ProfileStatsGrid,
  ProfileTabs,
  ProgressBar,
  UnfollowPrivateConfirmModal,
  UserActivityFeed,
  UserCommunitiesTab,
} from "@/components";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import { ReadingGoalSection } from "@/components/profile/ReadingGoalSection";
import { LiteraryDnaSection } from "@/components/profile/LiteraryDnaSection";
import type { ShelfBook } from "@/hooks/useBookcasePage";
import { mapBackendReadingStatus } from "@/utils/bookcase-filters";
import { humanizeUsername } from "@/utils/format";
import type { DisplayShelfBook, ShelfItemWithShelfId } from "@/types/profile";
import { getAccessToken } from "@/services/auth";
import {
  followUser,
  getBookById,
  getDnaByUserId,
  getMyProfile,
  getProfileByUsername,
  listFollowersByUsername,
  listFollowingByUsername,
  listUserReviewsByUserId,
  listShelvesByUserId,
  listMyFollowing,
  listShelfItemsByUserId,
  unfollowUser,
} from "@/services/profile";
import type { DnaResponse, DnaProgressResponse, UserSummaryResponse, UserProfileResponse } from "@/types/api";

const BOOKS_PER_PAGE = 10;

const tabs = ["Biblioteca", "Atividade", "Comunidades"] as const;

type PanelShelfBook = ShelfBook & {
  shelfId?: number;
};

function toPanelBook(book: DisplayShelfBook): PanelShelfBook {
  return {
    ...book,
    shelfItemId: book.shelfItemId,
    // In another user's profile, show a neutral default status in the details panel.
    readingStatus: "quero-ler",
  };
}

function normalizeUsernameParam(value: string): string {
  return decodeURIComponent(value).trim().replace(/^@+/, "").toLowerCase();
}


const noop = () => undefined;

function FireIcon({ count }: { count: number }) {
  if (count === 0) return <Flame size={16} className="text-muted-foreground/30" />;
  if (count <= 5)  return <Flame size={16} className="animate-flame-slow text-yellow-400" />;
  if (count <= 15) return <Flame size={16} className="animate-flame-slow text-orange-400" />;
  if (count <= 30) return <Flame size={16} className="animate-flame text-orange-500" />;
  return <Flame size={16} className="animate-flame text-red-500" />;
}

export default function SeguidorProfilePage() {
  const params = useParams<{ username: string }>();
  const username = normalizeUsernameParam(params?.username ?? "");

  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>("Biblioteca");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
  const [followersCount, setFollowersCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);
  const [followersUsers, setFollowersUsers] = React.useState<UserSummaryResponse[]>([]);
  const [followingUsers, setFollowingUsers] = React.useState<UserSummaryResponse[]>([]);
  const [myFollowingUsernames, setMyFollowingUsernames] = React.useState<string[]>([]);
  const [followRelationship, setFollowRelationship] = React.useState<"none" | "following" | "requested">("none");
  const [isTogglingFollow, setIsTogglingFollow] = React.useState(false);
  const [isUnfollowConfirmOpen, setIsUnfollowConfirmOpen] = React.useState(false);
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const [shelfBooks, setShelfBooks] = React.useState<DisplayShelfBook[]>([]);
  const [booksRead, setBooksRead] = React.useState(0);
  const [pagesRead, setPagesRead] = React.useState(0);
  const [dna, setDna] = React.useState<DnaResponse | DnaProgressResponse | null>(null);
  const [isShelfBookDetailsOpen, setIsShelfBookDetailsOpen] = React.useState(false);
  const [selectedShelfBook, setSelectedShelfBook] = React.useState<DisplayShelfBook | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);

  const goalTarget = 24;
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    if (!username) {
      setError("Username inválido.");
      setIsLoading(false);
      return;
    }

    const accessToken = getAccessToken();
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedProfile, followersList, followingList] = await Promise.all([
          getProfileByUsername(username, accessToken),
          listFollowersByUsername(username, accessToken),
          listFollowingByUsername(username, accessToken),
        ]);

        let followingState = false;
        let ownProfileState = false;
        let myFollowing: UserSummaryResponse[] = [];

        if (accessToken) {
          const [me, myFollowingList] = await Promise.all([getMyProfile(accessToken), listMyFollowing(accessToken)]);
          ownProfileState = me.username.toLowerCase() === username;
          myFollowing = myFollowingList;
          followingState = myFollowing.some((user) => user.username.toLowerCase() === username);
        }

        let computedBooksRead = 0;
        let computedPagesRead = 0;
        let computedShelfBooks: DisplayShelfBook[] = [];

        if (!loadedProfile.restricted) {
          const shelves = await listShelvesByUserId(loadedProfile.id, accessToken);
          const shelfItemGroups = await Promise.all(
            shelves.map((shelf) => listShelfItemsByUserId(shelf.id, loadedProfile.id, accessToken)),
          );

          const flatItems = shelfItemGroups.flatMap((items, index) =>
            items.map((item) => ({ ...item, shelfId: shelves[index]?.id })),
          );
          const uniqueItems = Array.from(
            new Map(flatItems.map((item) => [item.id, item])).values(),
          ) as ShelfItemWithShelfId[];

          const ratingsByBookId = new Map<number, number>();
          if (accessToken) {
            try {
              const reviews = await listUserReviewsByUserId(loadedProfile.id, accessToken);
              reviews.forEach((review) => {
                ratingsByBookId.set(review.bookId, review.rating);
              });
            } catch {
              // Rating is optional in this view
            }
          }

          computedBooksRead = uniqueItems.filter((item) => item.status === "COMPLETED").length;

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

          computedPagesRead = pageCountEntries.reduce(
            (total, entry) => total + Math.round((entry.pageCount * entry.progressPercent) / 100),
            0,
          );


          computedShelfBooks = await Promise.all(
            uniqueItems.map(async (item) => {
              try {
                const book = await getBookById(item.bookId, accessToken);
                const author = book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido";

                return {
                  shelfId: item.shelfId,
                  shelfItemId: item.id,
                  id: item.bookId.toString(),
                  bookId: item.bookId,
                  title: item.bookTitle,
                  author,
                  coverUrl: item.bookCoverUrl ?? book.coverUrl ?? undefined,
                  rating: ratingsByBookId.get(item.bookId) ?? book.averageRating ?? undefined,
                  synopsis: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
                  description: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
                  readerCount: book.readerCount ?? undefined,
                  progress: item.progressPercent ?? undefined,
                  readingStatus: mapBackendReadingStatus(item.status),
                  currentPage: 0,
                  totalPages: book.pageCount ?? undefined,
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
                  rating: ratingsByBookId.get(item.bookId),
                  synopsis: undefined,
                  description: undefined,
                  readerCount: undefined,
                  progress: item.progressPercent ?? undefined,
                  readingStatus: mapBackendReadingStatus(item.status),
                  currentPage: undefined,
                  totalPages: undefined,
                } as DisplayShelfBook;
              }
            }),
          );
        }

        if (cancelled) return;

        setProfile(loadedProfile);
        setFollowersUsers(followersList);
        setFollowingUsers(followingList);
        setFollowersCount(followersList.length);
        setFollowingCount(followingList.length);
        setMyFollowingUsernames(myFollowing.map((user) => user.username.toLowerCase()));
        setFollowRelationship(followingState ? "following" : "none");
        setIsOwnProfile(ownProfileState);
        setBooksRead(computedBooksRead);
        setPagesRead(computedPagesRead);
        setShelfBooks(computedShelfBooks);

        if (!loadedProfile.restricted) {
          try {
            const dnaData = await getDnaByUserId(loadedProfile.id, accessToken);
            if (!cancelled) setDna(dnaData);
          } catch {
            // DNA é opcional
          }
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar o perfil deste usuário.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [username]);

  const handleOpenShelfBookDetails = (book: DisplayShelfBook) => {
    setSelectedShelfBook(book);
    setIsShelfBookDetailsOpen(true);
  };

  const handleCloseShelfBookDetails = () => {
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
  };

  const handleToggleFollow = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isTogglingFollow) return;

    const previous = followRelationship;
    if (previous === "following" && profile?.isPrivate) {
      setIsUnfollowConfirmOpen(true);
      return;
    }

    if (previous === "following") {
      setFollowRelationship("none");
    } else if (previous === "requested") {
      setFollowRelationship("none");
    } else {
      setFollowRelationship("requested");
    }
    setIsTogglingFollow(true);

    try {
      if (previous === "following" || previous === "requested") {
        await unfollowUser(username, accessToken);
        if (previous === "following") setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        const result = await followUser(username, accessToken);
        if (result === "following") {
          setFollowRelationship("following");
          setFollowersCount((prev) => prev + 1);
        } else {
          setFollowRelationship("requested");
        }
      }
    } catch {
      setFollowRelationship(previous);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleConfirmPrivateUnfollow = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isTogglingFollow) return;

    setIsTogglingFollow(true);
    try {
      await unfollowUser(username, accessToken);
      setFollowRelationship("none");
      setFollowersCount((prev) => Math.max(0, prev - 1));
      setIsUnfollowConfirmOpen(false);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const displayName = profile ? humanizeUsername(profile.username) : humanizeUsername(username || "usuario");
  const isRestrictedProfileView = Boolean(profile?.restricted && !isOwnProfile);
  const bio = isRestrictedProfileView ? "" : profile?.bio ?? "Sem bio cadastrada.";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const booksReadLabel = booksRead.toLocaleString("pt-BR");
  const pagesReadLabel = pagesRead.toLocaleString("pt-BR");
  const showFollowAction = Boolean(getAccessToken()) && !isOwnProfile;

  const isFollowing = followRelationship === "following";
  const isRequested = followRelationship === "requested";
  const isPrivateTarget = profile?.isPrivate === true;
  let followButtonLabel = "Seguir";
  if (isFollowing) {
    followButtonLabel = "Seguindo";
  } else if (isRequested) {
    followButtonLabel = "Solicitação enviada";
  } else if (isPrivateTarget) {
    followButtonLabel = "Solicitar para seguir";
  }

  const tabIcons = {
    Biblioteca: BookOpen,
    Atividade: Activity,
    Comunidades: Users,
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1040px] space-y-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <ProfileHeaderCard
          name={displayName}
          handle={`@${username}`}
          bio={bio}
          initial={initial}
          avatarUrl={profile?.avatarUrl ?? undefined}
          bannerUrl={profile?.bannerUrl ?? undefined}
          isPrivate={profile?.isPrivate === true}
          followersCount={followersCount}
          followingCount={followingCount}
          extraInfo={
            profile?.createdAt ? `Membro desde ${new Date(profile.createdAt).toLocaleDateString("pt-BR")}` : undefined
          }
          footerContent={
            !isRestrictedProfileView ? (
              <span>
                <strong>{booksReadLabel}</strong> livros lidos
              </span>
            ) : null
          }
          action={
            showFollowAction ? (
              <div className="flex items-center gap-2">
                <Button variant={isFollowing ? "outline" : "default"} onClick={handleToggleFollow} disabled={isTogglingFollow}>
                  {followButtonLabel}
                </Button>
                <Button variant="ghost" size="icon" aria-label="Mais opcoes">
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            ) : null
          }
        />

        {isRestrictedProfileView ? (
          <section className="rounded-2xl border border-border bg-card p-6 text-center text-medium-text">
            <strong>Este perfil é privado.</strong> Apenas seguidores tem acesso às informações. Clique em seguir para solicitar acesso.
          </section>
        ) : (
          <>
            <ProfileStatsGrid
              items={[
                { label: "Livros lidos", value: booksReadLabel, icon: <BookOpen size={16} />, tooltip: "Total de livros com status 'Lido' em todas as estantes." },
                { label: "Páginas lidas", value: pagesReadLabel, icon: <BookOpenCheck size={16} />, tooltip: "Soma das páginas lidas, calculada pelo progresso registrado em cada livro." },
                { label: "Dias ativos", value: "—", icon: <FireIcon count={0} />, tooltip: "Dias em que o usuário atualizou o progresso de algum livro." },
              ]}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <ReadingGoalSection current={booksRead} target={goalTarget} year={currentYear} />
              <LiteraryDnaSection dna={dna} isLoading={isLoading} />
            </div>

            <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} iconByTab={tabIcons} />

            {activeTab === "Biblioteca" ? (
              <section>
                {shelfBooks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 items-start gap-3 justify-center">
                      {shelfBooks.slice(currentPage * BOOKS_PER_PAGE, (currentPage + 1) * BOOKS_PER_PAGE).map((book) => (
                        <ProfileShelfBookCard
                          key={book.shelfItemId}
                          title={book.title}
                          author={book.author}
                          coverUrl={book.coverUrl}
                          userRating={book.rating}
                          progressPercent={book.progress}
                          onClick={() => handleOpenShelfBookDetails(book)}
                        />
                      ))}
                    </div>

                    {Math.ceil(shelfBooks.length / BOOKS_PER_PAGE) > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ← Anterior
                        </button>
                        <span className="text-sm text-muted-foreground">
                          Página {currentPage + 1} de {Math.ceil(shelfBooks.length / BOOKS_PER_PAGE)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(Math.ceil(shelfBooks.length / BOOKS_PER_PAGE) - 1, p + 1))}
                          disabled={currentPage >= Math.ceil(shelfBooks.length / BOOKS_PER_PAGE) - 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Próxima →
                        </button>
                      </div>
                    )}
                  </>
                ) : !isLoading ? (
                  <EmptyState
                    title="Biblioteca vazia"
                    description="Este usuário ainda não adicionou livros visíveis na biblioteca."
                  />
                ) : null}
              </section>
            ) : activeTab === "Atividade" ? (
              profile ? (
                <UserActivityFeed
                  userId={profile.id}
                  authorName={displayName}
                  authorUsername={profile.username}
                  authorAvatarUrl={profile.avatarUrl ?? null}
                  isOwnProfile={isOwnProfile}
                />
              ) : null
            ) : activeTab === "Comunidades" ? (
              <UserCommunitiesTab
                isOwnProfile={isOwnProfile}
                followersUsers={followersUsers.slice(0, 8).map((user) => ({
                  id: user.id,
                  username: user.username,
                  sideLabel: myFollowingUsernames.includes(user.username.toLowerCase()) ? "Você segue" : "",
                }))}
                followingUsers={followingUsers.slice(0, 8).map((user) => ({
                  id: user.id,
                  username: user.username,
                  sideLabel: "Leitor",
                }))}
                myFollowingUsernames={myFollowingUsernames}
              />
            ) : null}
          </>
        )}

        {isLoading ? <p className="text-sm text-medium-text">Carregando...</p> : null}
      </div>

      <UnfollowPrivateConfirmModal
        isOpen={isUnfollowConfirmOpen}
        username={username}
        isLoading={isTogglingFollow}
        onCancel={() => setIsUnfollowConfirmOpen(false)}
        onConfirm={handleConfirmPrivateUnfollow}
      />
      <ShelfBookDetailsPanel
        isOpen={isShelfBookDetailsOpen}
        book={selectedShelfBook ? toPanelBook(selectedShelfBook) : null}
        onClose={handleCloseShelfBookDetails}
        onSelectStatus={noop}
        onStepPage={noop}
        onSetPage={noop}
        onRemoveFromShelf={noop}
        canRemove={false}
        reviewRating={0}
        reviewComment=""
        reviewExists={false}
        onChangeReviewRating={noop}
        onChangeReviewComment={noop}
        onSaveReview={noop}
        reviewSuccessMessage=""
        reviewError=""
        isSavingReview={false}
        isLoadingReview={false}
        isSaving
        isRemovingFromShelf={false}
        errorMessage=""
      />
    </AppShell>
  );
}
