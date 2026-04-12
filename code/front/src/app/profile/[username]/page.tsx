"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BookMarked, BookOpen, Library, MoreHorizontal, Sparkles, Users } from "lucide-react";
import {
  AppShell,
  Button,
  ProfileFollowersPanel,
  ProfileHeaderCard,
  ProfileShelfBookCard,
  ProfileStatsGrid,
  ProfileTabs,
  UnfollowPrivateConfirmModal,
} from "@/components";
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
  type ShelfItemSummaryResponse,
  type UserSummaryResponse,
  unfollowUser,
  type UserProfileResponse,
} from "@/services/profile";

const tabs = ["Estante", "Comunidades em comum"] as const;

type DisplayShelfBook = {
  id: number;
  title: string;
  coverUrl?: string;
  progressPercent?: number;
  userRating?: number;
};

function normalizeUsernameParam(value: string): string {
  return decodeURIComponent(value).trim().replace(/^@+/, "").toLowerCase();
}

function humanizeUsername(username: string): string {
  return username
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\b\w/g, (match) => match.toUpperCase());
}

export default function SeguidorProfilePage() {
  const params = useParams<{ username: string }>();
  const username = normalizeUsernameParam(params?.username ?? "");

  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>("Estante");
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
  const [booksRead, setBooksRead] = React.useState<number | null>(null);
  const [pagesRead, setPagesRead] = React.useState<number | null>(null);

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

        let computedBooksRead: number | null = null;
        let computedPagesRead: number | null = null;
        let computedShelfBooks: DisplayShelfBook[] = [];

        if (!loadedProfile.restricted) {
          const shelves = await listShelvesByUserId(loadedProfile.id, accessToken);
          const shelfItemGroups = await Promise.all(
            shelves.map((shelf) => listShelfItemsByUserId(shelf.id, loadedProfile.id, accessToken)),
          );

          const flatItems = shelfItemGroups.flat();
          const uniqueItems = Array.from(new Map(flatItems.map((item) => [item.id, item])).values());

          const ratingsByBookId = new Map<number, number>();
          if (accessToken) {
            try {
              const reviews = await listUserReviewsByUserId(loadedProfile.id, accessToken);
              reviews.forEach((review) => {
                ratingsByBookId.set(review.bookId, review.rating);
              });
            } catch {
              // Rating is optional in this view. If it fails, shelf data still renders.
            }
          }

          computedBooksRead = uniqueItems.filter((item) => item.status === "COMPLETED").length;

          const pageCountEntries = await Promise.all(
            uniqueItems.map(async (item) => {
              try {
                const book = await getBookById(item.bookId, accessToken);
                return { progressPercent: item.progressPercent ?? 0, pageCount: book.pageCount ?? 0 };
              } catch {
                return { progressPercent: 0, pageCount: 0 };
              }
            }),
          );

          computedPagesRead = pageCountEntries.reduce((total, entry) => {
            return total + Math.round((entry.pageCount * entry.progressPercent) / 100);
          }, 0);

          computedShelfBooks = uniqueItems.map((item: ShelfItemSummaryResponse) => ({
            id: item.id,
            title: item.bookTitle,
            coverUrl: item.bookCoverUrl ?? undefined,
            progressPercent: item.progressPercent ?? undefined,
            userRating: ratingsByBookId.get(item.bookId),
          }));
        }

        if (cancelled) {
          return;
        }

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
      } catch {
        if (cancelled) {
          return;
        }
        setError("Não foi possível carregar o perfil deste usuário.");
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
  }, [username]);

  const handleToggleFollow = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isTogglingFollow) {
      return;
    }

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
        if (previous === "following") {
          setFollowersCount((prev) => Math.max(0, prev - 1));
        }
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
    if (!accessToken || isTogglingFollow) {
      return;
    }

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
  const bio = isRestrictedProfileView
    ? ""
    : profile?.bio ?? "Sem bio cadastrada.";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const booksReadLabel = booksRead == null ? "Sem dados" : booksRead.toLocaleString("pt-BR");
  const pagesReadLabel = pagesRead == null ? "Sem dados" : pagesRead.toLocaleString("pt-BR");
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

  let readerStatusLabel = "Sem dados";
  if (booksRead != null) {
    readerStatusLabel = booksRead > 0 ? "Leitor ativo" : "Sem leituras";
  }
  const tabIcons = {
    Estante: BookOpen,
    "Comunidades em comum": Users,
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
            <strong>Este perfil é privado.</strong>  Apenas seguidores tem acesso às informações. Clique em seguir para solicitar acesso.
          </section>
        ) : (
          <>
            <ProfileStatsGrid
              items={[
                { label: "Livros lidos", value: booksReadLabel, icon: <BookOpen size={16} className="text-primary-dark" /> },
                { label: "Páginas lidas", value: pagesReadLabel, icon: <BookMarked size={16} className="text-primary-dark" /> },
                { label: "Status", value: readerStatusLabel, icon: <Sparkles size={16} className="text-premium" /> },
                { label: "Gênero favorito", value: "Sem dados", icon: <Library size={16} className="text-primary-dark" /> },
              ]}
            />

            <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} iconByTab={tabIcons} />

            {activeTab === "Estante" ? (
              <section className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {shelfBooks.length > 0 ? (
                  shelfBooks.map((book) => (
                    <ProfileShelfBookCard
                      key={book.id}
                      title={book.title}
                      coverUrl={book.coverUrl}
                      userRating={book.userRating}
                      progressPercent={book.progressPercent}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-border bg-card p-6 text-center text-medium-text">
                    {isOwnProfile
                      ? "Sua estante está vazia."
                      : "Estante indisponível para este usuário no backend atual."}
                  </div>
                )}
              </section>
            ) : (
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
    </AppShell>
  );
}
