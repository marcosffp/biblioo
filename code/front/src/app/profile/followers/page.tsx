"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { AppShell, Avatar, AvatarFallback, AvatarImage, Button } from "@/components";
import { getAccessToken } from "@/services/auth";
import {
  followUser,
  getMyProfile,
  listFollowersByUsername,
  listMyFollowing,
  unfollowUser,
  type UserSummaryResponse,
} from "@/services/profile";

function humanizeUsername(username: string): string {
  return username
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\b\w/g, (match) => match.toUpperCase());
}

export default function FollowersPage() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = React.useState("usuario");
  const [followers, setFollowers] = React.useState<UserSummaryResponse[]>([]);
  const [followState, setFollowState] = React.useState<Record<string, boolean>>({});
  const [requestedState, setRequestedState] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("Você precisa estar logado para visualizar seguidores.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const me = await getMyProfile(accessToken);
        const [followersList, myFollowing] = await Promise.all([
          listFollowersByUsername(me.username, accessToken),
          listMyFollowing(accessToken),
        ]);

        if (cancelled) {
          return;
        }

        const followingSet = new Set(myFollowing.map((user) => user.username));
        setOwnerUsername(me.username);
        setFollowers(followersList);
        setFollowState(
          Object.fromEntries(followersList.map((user) => [user.username, followingSet.has(user.username)])),
        );
      } catch {
        if (cancelled) {
          return;
        }
        setError("Não foi possível carregar seguidores agora.");
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

  const filteredFollowers = followers.filter((user) => {
    const normalized = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(normalized) ||
      humanizeUsername(user.username).toLowerCase().includes(normalized)
    );
  });

  const handleToggleFollow = async (username: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    const currentlyFollowing = !!followState[username];
    const currentlyRequested = !!requestedState[username];

    if (currentlyFollowing || currentlyRequested) {
      setFollowState((prev) => ({ ...prev, [username]: false }));
      setRequestedState((prev) => ({ ...prev, [username]: false }));
    } else {
      setRequestedState((prev) => ({ ...prev, [username]: true }));
    }

    try {
      if (currentlyFollowing || currentlyRequested) {
        await unfollowUser(username, accessToken);
      } else {
        const result = await followUser(username, accessToken);

        if (result === "following") {
          setFollowState((prev) => ({ ...prev, [username]: true }));
          setRequestedState((prev) => ({ ...prev, [username]: false }));
        } else {
          setFollowState((prev) => ({ ...prev, [username]: false }));
          setRequestedState((prev) => ({ ...prev, [username]: true }));
        }
      }
    } catch {
      setFollowState((prev) => ({ ...prev, [username]: currentlyFollowing }));
      setRequestedState((prev) => ({ ...prev, [username]: currentlyRequested }));
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[920px] space-y-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-medium-text transition-colors hover:text-deep-green"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          <h1 className="font-display text-3xl font-bold text-deep-green">
            @{ownerUsername} · Seguidores ({followers.length})
          </h1>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-medium-text" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar seguidores..."
            className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-10 text-sm text-deep-green placeholder:text-light-text"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--deep-green)] hover:bg-emerald-100"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="space-y-3">
          {filteredFollowers.map((user) => {
            const isFollowing = !!followState[user.username];
            const isRequested = !!requestedState[user.username];
            let followLabel = "Seguir";
            if (isFollowing) {
              followLabel = "Seguindo";
            } else if (isRequested) {
              followLabel = "Solicitado";
            }
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card"
              >
                <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="h-12 w-12 bg-primary/20">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary/20 font-semibold text-primary-dark">
                      {user.username[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-xl font-semibold text-deep-green">{humanizeUsername(user.username)}</p>
                    <p className="truncate text-sm text-medium-text">@{user.username}</p>
                  </div>
                </Link>

                <Button
                  size="sm"
                  variant={isFollowing || isRequested ? "outline" : "default"}
                  onClick={() => handleToggleFollow(user.username)}
                >
                  {followLabel}
                </Button>
              </div>
            );
          })}

          {!isLoading && filteredFollowers.length === 0 ? (
            <p className="py-8 text-center text-sm text-medium-text">Nenhum usuário encontrado.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

