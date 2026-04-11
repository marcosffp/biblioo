"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { AppShell, Avatar, AvatarFallback, AvatarImage, Button } from "@/components";
import { getAccessToken } from "@/services/auth";
import {
  followUser,
  getMyProfile,
  listFollowingByUsername,
  unfollowUser,
  type UserSummaryResponse,
} from "@/services/profile";

function humanizeUsername(username: string): string {
  return username
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\b\w/g, (match) => match.toUpperCase());
}

export default function FollowingPage() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = React.useState("usuario");
  const [following, setFollowing] = React.useState<UserSummaryResponse[]>([]);
  const [followState, setFollowState] = React.useState<Record<string, boolean>>({});
  const [requestedState, setRequestedState] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("Você precisa estar logado para visualizar quem você segue.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const me = await getMyProfile(accessToken);
        const followingList = await listFollowingByUsername(me.username, accessToken);

        if (cancelled) {
          return;
        }

        setOwnerUsername(me.username);
        setFollowing(followingList);
        setFollowState(Object.fromEntries(followingList.map((user) => [user.username, true])));
      } catch {
        if (cancelled) {
          return;
        }
        setError("Não foi possível carregar quem você segue agora.");
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

  const filteredFollowing = following.filter((user) => {
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
            className="rounded-lg p-2 text-deep-green hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-3xl font-bold text-deep-green">
            @{ownerUsername} · Seguindo ({following.length})
          </h1>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-medium-text" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar seguindo..."
            className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-3 text-sm text-deep-green placeholder:text-light-text"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="space-y-3">
          {filteredFollowing.map((user) => {
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

          {!isLoading && filteredFollowing.length === 0 ? (
            <p className="py-8 text-center text-sm text-medium-text">Nenhum usuário encontrado.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
