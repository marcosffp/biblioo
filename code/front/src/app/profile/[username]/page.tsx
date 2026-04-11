"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BookMarked, BookOpen, Library, MoreHorizontal, Sparkles, Star, Users } from "lucide-react";
import { AppShell, Avatar, AvatarFallback, AvatarImage, Button } from "@/components";
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

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1040px] space-y-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div
            className="h-56 bg-gradient-to-br from-[#e6c77a33] via-primary/25 to-primary-dark/25"
            style={
              profile?.bannerUrl
                ? {
                    backgroundImage: `url(${profile.bannerUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : undefined
            }
          />
          <div className="relative px-8 pb-8 pt-14">
            <div className="absolute -top-12 left-8">
              <Avatar className="h-24 w-24 border-4 border-card bg-primary/20 shadow-card">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-3xl font-bold text-deep-green">{initial}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold text-deep-green">{displayName}</h1>
                <p className="mt-1 text-lg text-medium-text">@{username}</p>
                <p className="mt-3 max-w-2xl text-xl text-deep-green">{bio}</p>
                {profile?.createdAt ? (
                  <p className="mt-2 text-sm text-medium-text">
                    Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                ) : null}
              </div>

              {showFollowAction ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleToggleFollow}
                    disabled={isTogglingFollow}
                  >
                    {followButtonLabel}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Mais opcoes">
                    <MoreHorizontal size={18} />
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-7 text-lg">
              <span>
                <strong className="text-deep-green">{followersCount}</strong> <span className="text-medium-text">Seguidores</span>
              </span>
              <span>
                <strong className="text-deep-green">{followingCount}</strong> <span className="text-medium-text">Seguindo</span>
              </span>
              {!isRestrictedProfileView ? (
                <span>
                  <strong className="text-deep-green">{booksReadLabel}</strong> <span className="text-medium-text">Livros lidos</span>
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {isRestrictedProfileView ? (
          <section className="rounded-2xl border border-border bg-card p-6 text-center text-medium-text">
            <strong>Este perfil é privado.</strong>  Apenas seguidores tem acesso às informações. Clique em seguir para solicitar acesso.
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-2 flex items-center gap-2 text-medium-text">
                  <BookOpen size={16} className="text-primary-dark" />
                  <span className="text-sm">Livros lidos</span>
                </div>
                <div className="font-display text-4xl font-bold text-deep-green">{booksReadLabel}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-2 flex items-center gap-2 text-medium-text">
                  <BookMarked size={16} className="text-primary-dark" />
                  <span className="text-sm">Páginas lidas</span>
                </div>
                <div className="font-display text-4xl font-bold text-deep-green">{pagesReadLabel}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-2 flex items-center gap-2 text-medium-text">
                  <Sparkles size={16} className="text-premium" />
                  <span className="text-sm">Status</span>
                </div>
                <div className="font-display text-3xl font-bold text-deep-green">{readerStatusLabel}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-2 flex items-center gap-2 text-medium-text">
                  <Library size={16} className="text-primary-dark" />
                  <span className="text-sm">Gênero favorito</span>
                </div>
                <div className="font-display text-3xl font-bold text-deep-green">Sem dados</div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-muted p-1.5">
              <div className="grid grid-cols-2 gap-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab;
                  const Icon = tab === "Estante" ? BookOpen : Users;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active ? "bg-card text-deep-green shadow-sm" : "text-medium-text hover:bg-card/60"
                      }`}
                    >
                      <Icon size={16} />
                      {tab}
                    </button>
                  );
                })}
              </div>
            </section>

            {activeTab === "Estante" ? (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {shelfBooks.length > 0 ? (
                  shelfBooks.map((book) => (
                    <article
                      key={book.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-card-hover"
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary-dark/10 p-3">
                        <div className="line-clamp-3 pt-8 text-center text-xl font-medium text-deep-green">{book.title}</div>
                      </div>
                      <div className="border-t border-border p-3">
                        <p className="truncate text-sm font-semibold text-deep-green">{book.title}</p>
                        {typeof book.userRating === "number" ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {book.userRating.toFixed(1)}
                          </p>
                        ) : null}
                        <p className="truncate text-xs text-medium-text">
                          {typeof book.progressPercent === "number"
                            ? `${book.progressPercent}% concluído`
                            : "Progresso indisponível"}
                        </p>
                      </div>
                    </article>
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
                <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h2 className="mb-3 font-display text-2xl font-semibold text-deep-green">Seguidores</h2>
                  {followersUsers.length > 0 ? (
                    <ul className="space-y-2">
                      {followersUsers.slice(0, 8).map((user) => {
                        const followedByMe = myFollowingUsernames.includes(user.username.toLowerCase());

                        return (
                          <li
                            key={`follower-${user.id}`}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                          >
                            <span className="truncate text-sm font-semibold text-deep-green">@{user.username}</span>
                            <span className="text-xs text-medium-text">{followedByMe ? "Você segue" : ""}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-medium-text">Nenhum seguidor visível.</p>
                  )}
                </article>

                <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h2 className="mb-3 font-display text-2xl font-semibold text-deep-green">Seguindo</h2>
                  {followingUsers.length > 0 ? (
                    <ul className="space-y-2">
                      {followingUsers.slice(0, 8).map((user) => (
                        <li
                          key={`following-${user.id}`}
                          className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                        >
                          <span className="truncate text-sm font-semibold text-deep-green">@{user.username}</span>
                          <span className="text-xs text-medium-text">Leitor</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-medium-text">Não segue nenhum usuário visível.</p>
                  )}
                </article>
              </section>
            )}
          </>
        )}

        {isLoading ? <p className="text-sm text-medium-text">Carregando...</p> : null}
      </div>
    </AppShell>
  );
}
