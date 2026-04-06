"use client";

import Link from "next/link";
import React from "react";
import { AppShell, Avatar, AvatarFallback, AvatarImage, EmptyState, PageHeader, PostCard, SectionHeader, TextInput } from "@/components";
import { getProfileByUsername, searchUsersByUsername, type UserSummaryResponse } from "@/services/profile";

const posts = [
  {
    id: "p1",
    author: "Fernanda Lima",
    authorHandle: "@fernandal",
    time: "2h",
    content: "Terminei hoje O Conto da Aia. Impactante e necessario.",
    likes: 24,
    comments: 6,
  },
  {
    id: "p2",
    author: "Lucas Oliveira",
    authorHandle: "@lucasbook",
    time: "5h",
    content: "Alguem recomenda um thriller curto para o fim de semana?",
    likes: 10,
    comments: 3,
  },
];

export default function FeedPage() {
  const [query, setQuery] = React.useState("");
  const [users, setUsers] = React.useState<UserSummaryResponse[]>([]);
  const [searchError, setSearchError] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  function toAvatarFallback(username: string): string {
    const cleaned = username.replace(/^@+/, "").trim();
    if (!cleaned) {
      return "U";
    }

    return cleaned.slice(0, 2).toUpperCase();
  }

  React.useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setUsers([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      async function runSearch() {
        setIsSearching(true);
        setSearchError("");

        try {
          const foundUsers = await searchUsersByUsername(normalizedQuery);

          if (foundUsers.length > 0) {
            setUsers(foundUsers);
            return;
          }

          // Fallback: if OpenSearch index is outdated, try direct profile lookup by username.
          const directProfile = await getProfileByUsername(normalizedQuery);
          setUsers([
            {
              id: directProfile.id,
              username: directProfile.username,
              avatarUrl: directProfile.avatarUrl ?? undefined,
              bannerUrl: directProfile.bannerUrl ?? undefined,
            },
          ]);
        } catch {
          setUsers([]);
          setSearchError("Nao foi possivel buscar usuarios agora.");
        } finally {
          setIsSearching(false);
        }
      }

      void runSearch();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  return (
    <AppShell>
      <PageHeader title="Feed" subtitle="Atualizacoes da comunidade" />
      <div className="space-y-3">
        <TextInput
          label="Buscar usuarios"
          placeholder="Digite @username ou nome"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {isSearching ? <p className="text-sm text-[var(--text-secondary)]">Buscando usuarios...</p> : null}
        {searchError ? <p className="text-sm text-red-600">{searchError}</p> : null}

        {query.trim().length >= 2 ? (
          users.length > 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-2">
              <ul className="space-y-1">
                {users.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/profile/${encodeURIComponent(user.username)}`}
                      className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition hover:bg-[var(--bg-soft)]"
                    >
                      <Avatar className="h-8 w-8 border border-[var(--border-soft)]">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={`Avatar de ${user.username}`} />
                        <AvatarFallback>{toAvatarFallback(user.username)}</AvatarFallback>
                      </Avatar>

                      <span className="font-semibold text-[var(--text-primary)]">{user.username}</span>
                      <span className="text-[var(--text-secondary)]">@{user.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : !isSearching ? (
            <p className="text-sm text-[var(--text-secondary)]">Nenhum usuario encontrado.</p>
          ) : null
        ) : null}
      </div>

      <SectionHeader title="Ultimos posts" />
      <div className="space-y-4">
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              author={post.author}
              authorHandle={post.authorHandle}
              time={post.time}
              content={post.content}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        ) : (
          <EmptyState title="Sem posts no momento" description="Siga mais pessoas para ver novidades." />
        )}
      </div>

      <EmptyState title="Sem mais posts" description="Volte mais tarde para ver novas leituras." />
    </AppShell>
  );
}
