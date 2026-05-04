"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { AppShell } from "@/components";
import { getAccessToken } from "@/services/auth";
import { humanizeUsername } from "@/utils/format";
import { useFollowToggle } from "@/hooks/useFollowToggle";
import { FollowUserCard } from "@/components/profile/FollowUserCard";
import {
  getMyProfile,
  listFollowingByUsername,
  type UserSummaryResponse,
} from "@/services/profile";

export default function FollowingPage() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = React.useState("usuario");
  const [following, setFollowing] = React.useState<UserSummaryResponse[]>([]);

  const { followState, requestedState, initFollowState, handleToggleFollow } = useFollowToggle();

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

        if (cancelled) return;

        setOwnerUsername(me.username);
        setFollowing(followingList);
        initFollowState(Object.fromEntries(followingList.map((user) => [user.username, true])));
      } catch {
        if (cancelled) return;
        setError("Não foi possível carregar quem você segue agora.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [initFollowState]);

  const filteredFollowing = following.filter((user) => {
    const normalized = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(normalized) ||
      humanizeUsername(user.username).toLowerCase().includes(normalized)
    );
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[920px] space-y-5">
        <header className="space-y-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-medium-text transition-colors hover:text-deep-green"
            aria-label="Voltar para perfil"
          >
            <ArrowLeft size={18} />
            <span>Voltar para perfil</span>
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
          {filteredFollowing.map((user) => (
            <FollowUserCard
              key={user.id}
              user={user}
              isFollowing={!!followState[user.username]}
              isRequested={!!requestedState[user.username]}
              onToggleFollow={(username) => void handleToggleFollow(username)}
            />
          ))}

          {!isLoading && filteredFollowing.length === 0 ? (
            <p className="py-8 text-center text-sm text-medium-text">Nenhum usuário encontrado.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
