"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BookMarked, BookOpen, MessageSquare, MoreHorizontal, Sparkles, Users } from "lucide-react";
import {
  AppShell,
  Button,
  EmptyState,
  ProfileFollowersPanel,
  ProfileHeaderCard,
  ProfileShelfBookCard,
  ProfileStatsGrid,
  ProfileTabs,
  UnfollowPrivateConfirmModal,
} from "@/components";
import { ShelfBookDetailsPanel } from "@/components/bookcase/ShelfBookDetailsPanel";
import { ReadingGoalSection } from "@/components/profile/ReadingGoalSection";
import { LiteraryDnaSection } from "@/components/profile/LiteraryDnaSection";
import type { ShelfBook } from "@/hooks/useBookcasePage";
import { mapBackendReadingStatus } from "@/utils/bookcase-filters";
import { humanizeUsername } from "@/utils/format";
import type { DisplayShelfBook, GenreDistribution, ShelfItemWithShelfId } from "@/types/profile";
import { getAccessToken } from "@/services/auth";
import {
  followUser,
  getBookById,
  getMyProfile,
  getProfileByUsername,
  listFollowersByUsername,
  listFollowingByUsername,
  listUserReviewsByUserId,
  listShelvesByUserId,
  listMyFollowing,
  listShelfItemsByUserId,
  type UserSummaryResponse,
  unfollowUser,
  type UserProfileResponse,
} from "@/services/profile";

const tabs = ["Biblioteca", "Comunidades", "Resenhas"] as const;

type PanelShelfBook = ShelfBook & { shelfId?: number };

function toPanelBook(book: DisplayShelfBook): PanelShelfBook {
  return { ...book, shelfItemId: book.shelfItemId, readingStatus: "quero-ler" };
}

function normalizeUsernameParam(value: string): string {
  return decodeURIComponent(value).trim().replace(/^@+/, "").toLowerCase();
}


const noop = () => undefined;

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
  const [readersReached, setReadersReached] = React.useState(0);
  const [authorItems, setAuthorItems] = React.useState<GenreDistribution[]>([]);
  const [favoriteAuthors, setFavoriteAuthors] = React.useState<string[]>([]);
  const [isShelfBookDetailsOpen, setIsShelfBookDetailsOpen] = React.useState(false);
  const [selectedShelfBook, setSelectedShelfBook] = React.useState<DisplayShelfBook | null>(null);

  const goalTarget = 24;

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
        let computedReadersReached = 0;
        let computedAuthorItems: GenreDistribution[] = [];
        let computedFavoriteAuthors: string[] = [];
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

          computedReadersReached = pageCountEntries.reduce(
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

          const sortedAuthors = Array.from(authorCountMap.entries()).sort((a, b) => b[1] - a[1]);
          computedAuthorItems = sortedAuthors.slice(0, 6).map(([label, value]) => ({ label, value }));
          computedFavoriteAuthors = sortedAuthors.slice(0, 5).map(([name]) => name);

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
        setReadersReached(computedReadersReached);
        setAuthorItems(computedAuthorItems);
        setFavoriteAuthors(computedFavoriteAuthors);
        setShelfBooks(computedShelfBooks);
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
  const readersReachedLabel = readersReached.toLocaleString("pt-BR");
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

  const readerStatusLabel = booksRead > 0 ? "Leitor assíduo" : isLoading ? "Carregando" : "Começando agora";
  const tabIcons = {
    Biblioteca: BookOpen,
    Comunidades: Users,
    Resenhas: MessageSquare,
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
                { label: "Livros lidos", value: booksReadLabel, icon: <BookOpen size={16} className="text-primary-dark" /> },
                { label: "Páginas lidas", value: pagesReadLabel, icon: <BookMarked size={16} className="text-primary-dark" /> },
                { label: "Status", value: readerStatusLabel, icon: <Sparkles size={16} className="text-premium" /> },
                { label: "Leitores alcançados", value: readersReachedLabel, icon: <Users size={16} className="text-primary-dark" /> },
              ]}
            />

            <ReadingGoalSection current={booksRead} target={goalTarget} />

            <LiteraryDnaSection
              authorItems={authorItems}
              favoriteAuthors={favoriteAuthors}
              subtitle="Perfil de leitura"
              emptyMessage="Ainda não há dados suficientes para montar o DNA literário."
            />

            <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} iconByTab={tabIcons} />

            {activeTab === "Biblioteca" ? (
              <section className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {shelfBooks.length > 0 ? (
                  shelfBooks.map((book) => (
                    <ProfileShelfBookCard
                      key={book.shelfItemId}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl}
                      userRating={book.rating}
                      progressPercent={book.progress}
                      onClick={() => handleOpenShelfBookDetails(book)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Biblioteca vazia"
                    description={
                      isOwnProfile
                        ? "Adicione livros para acompanhar progresso e metas no perfil."
                        : "Este usuário ainda não adicionou livros visíveis na biblioteca."
                    }
                  />
                )}
              </section>
            ) : activeTab === "Comunidades" ? (
              <section className="grid gap-4 lg:grid-cols-2">
                <ProfileFollowersPanel
                  title="Seguidores"
                  emptyLabel="Nenhum seguidor visível."
                  users={followersUsers.slice(0, 8).map((user) => ({
                    id: user.id,
                    username: user.username,
                    sideLabel: myFollowingUsernames.includes(user.username.toLowerCase()) ? "Você segue" : "",
                  }))}
                />

                <ProfileFollowersPanel
                  title="Seguindo"
                  emptyLabel="Não segue nenhum usuário visível."
                  users={followingUsers.slice(0, 8).map((user) => ({ id: user.id, username: user.username, sideLabel: "Leitor" }))}
                />
              </section>
            ) : (
              <EmptyState
                title="Sem resenhas publicadas"
                description="As resenhas deste usuário aparecerão aqui quando forem publicadas."
              />
            )}
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
