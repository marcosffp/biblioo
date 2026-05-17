"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommunityCard } from "@/components/CommunityCard";
import { ProfileFollowersPanel } from "@/components/profile/ProfileFollowersPanel";
import { listCommunities, type BackendCommunityResponse } from "@/services/community";
import { getAccessToken } from "@/services/auth";
import { getBookById } from "@/services/bookcase";

function useCommunityBooks(communities: BackendCommunityResponse[]) {
  const [bookTitles, setBookTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    if (communities.length === 0) return;

    const bookIds = [...new Set(communities.map((c) => c.bookId).filter(Boolean))];
    void Promise.all(
      bookIds.map(async (bookId) => {
        try {
          const book = await getBookById(bookId);
          return { bookId, title: book.title };
        } catch {
          return { bookId, title: "Livro desconhecido" };
        }
      }),
    ).then((results) => {
      const map: Record<number, string> = {};
      results.forEach(({ bookId, title }) => {
        map[bookId] = title;
      });
      setBookTitles(map);
    });
  }, [communities]);

  return bookTitles;
}

type FollowerUser = { id: number; username: string; sideLabel?: string };

export type UserCommunitiesTabProps = {
  isOwnProfile: boolean;
  followersUsers?: FollowerUser[];
  followingUsers?: FollowerUser[];
  myFollowingUsernames?: string[];
};

export function UserCommunitiesTab({
  isOwnProfile,
  followersUsers = [],
  followingUsers = [],
  myFollowingUsernames = [],
}: UserCommunitiesTabProps) {
  const router = useRouter();
  const [communities, setCommunities] = useState<BackendCommunityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bookTitles = useCommunityBooks(communities);

  useEffect(() => {
    if (!isOwnProfile) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      const token = getAccessToken();
      try {
        const data = await listCommunities({ mine: true, token: token ?? undefined, size: 20 });
        if (!cancelled) setCommunities(data);
      } catch {
        // silently handled by empty state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile]);

  if (!isOwnProfile) {
    return (
      <section className="grid gap-4 lg:grid-cols-2">
        <ProfileFollowersPanel
          title="Seguidores"
          emptyLabel="Nenhum seguidor visível."
          users={followersUsers.slice(0, 8).map((u) => ({
            id: u.id,
            username: u.username,
            sideLabel: myFollowingUsernames.includes(u.username.toLowerCase()) ? "Você segue" : "",
          }))}
        />
        <ProfileFollowersPanel
          title="Seguindo"
          emptyLabel="Não segue nenhum usuário visível."
          users={followingUsers.slice(0, 8).map((u) => ({ id: u.id, username: u.username, sideLabel: "Leitor" }))}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-gray-100 bg-white p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-gray-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-14 w-full rounded-2xl bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Users size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Nenhuma comunidade ainda</p>
        <p className="mt-1 text-xs text-gray-400">
          Encontre clubes de leitura e conversas para compartilhar suas leituras.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          name={community.name}
          description={community.description ?? undefined}
          bookTitle={bookTitles[community.bookId] ?? "Carregando..."}
          visibility={community.type}
          members={community.memberCount}
          onClick={() => router.push(`/community/${community.id}`)}
          actionLabel="Ver comunidade"
          onActionClick={() => router.push(`/community/${community.id}`)}
        />
      ))}
    </div>
  );
}
