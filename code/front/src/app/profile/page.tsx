"use client";

import Link from "next/link";
import React from "react";
import { BookOpen, BookOpenCheck, MessageSquare, Sparkles, Tag, Users } from "lucide-react";
import {
  AppShell,
  BookCard,
  Button,
  EmptyState,
  ProgressBar,
  SectionHeader,
  StatHighlight,
  TagList,
} from "@/components";
import { getAccessToken } from "@/services/auth";
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

type DisplayShelfBook = {
  id: number;
  title: string;
  coverUrl?: string;
  progress?: number;
};

type GenreDistribution = {
  label: string;
  value: number;
};

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
  const [authorItems, setAuthorItems] = React.useState<GenreDistribution[]>([]);
  const [favoriteAuthors, setFavoriteAuthors] = React.useState<string[]>([]);
  const [preferences, setPreferences] = React.useState<ProfilePreferences>({
    displayName: null,
    showReadingGoal: true,
    showDnaLiterario: true,
  });

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
        const shelfItemGroups = await Promise.all(shelves.map((shelf) => listShelfItems(shelf.id, accessToken)));

        const flatItems = shelfItemGroups.flat();
        const uniqueItems = Array.from(new Map(flatItems.map((item) => [item.id, item])).values());
        const completedCount = uniqueItems.filter((item) => item.status === "COMPLETED").length;

        const pageCountEntries = await Promise.all(
          uniqueItems.map(async (item) => {
            try {
              const book = await getBookById(item.bookId, accessToken);
              return {
                progressPercent: item.progressPercent ?? 0,
                pageCount: book.pageCount ?? 0,
                authors: book.authors ?? [],
              };
            } catch {
              return { progressPercent: 0, pageCount: 0, authors: [] };
            }
          }),
        );

        const computedPagesRead = pageCountEntries.reduce((total, entry) => {
          return total + Math.round((entry.pageCount * entry.progressPercent) / 100);
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
        setAuthorItems(computedAuthorItems);
        setFavoriteAuthors(computedFavoriteAuthors);
        setShelfBooks(
          uniqueItems.slice(0, 8).map((item: ShelfItemSummaryResponse) => ({
            id: item.id,
            title: item.bookTitle,
            coverUrl: item.bookCoverUrl ?? undefined,
            progress: item.progressPercent ?? undefined,
          })),
        );
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

  const profileName = preferences.displayName?.trim() ? preferences.displayName : profile?.username ?? "Usuário";
  const profileBio = profile?.bio ?? "Sem bio cadastrada.";
  const profileHandle = profile ? `@${profile.username}` : "@usuario";
  const favoriteGenre = "Indisponível";

  const initial = (profileName[0] ?? "U").toUpperCase();

  return (
    <AppShell>
      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      <section className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div
          className="relative h-36 md:h-44 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white"
          style={
            profile?.bannerUrl
              ? {
                  backgroundImage: `url(${profile.bannerUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          <div className="absolute -bottom-8 left-6 md:left-10">
            <div className="h-20 w-20 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center shadow-lg overflow-hidden">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="Foto do usuario" className="h-full w-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 pt-12 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">{profileName}</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1">
                  {isPublicProfile ? "Perfil Público" : "Perfil Privado"}
                </span>
              </div>
              <p className="text-md text-gray-400">{profileHandle}</p>
              <p className="mt-3 max-w-xl text-sm text-gray-600">{profileBio}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-emerald-900">
                <Link href="/profile/followers" className="hover:text-emerald-700">
                  <strong>{followersCount}</strong> seguidores
                </Link>
                <Link href="/profile/following" className="hover:text-emerald-700">
                  <strong>{followingCount}</strong> seguindo
                </Link>
              </div>
            </div>
            <div className="w-full md:w-auto md:ml-auto">
              {isOwner ? (
                <Link
                  href="/profile/edit"
                  className="mt-0 inline-flex items-center gap-2 rounded-md border 
                  border-gray-300 bg-transparent px-4 py-2 text-sm
                  text-black shadow-sm hover:border-emerald-500 hover:bg-emerald-50 
                  hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 
                  focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
                  className="mt-0 inline-flex items-center gap-2 rounded-md border 
                  border-gray-300 bg-transparent px-4 py-2 text-sm
                  text-black shadow-sm hover:border-emerald-500 hover:bg-emerald-50 
                  hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 
                  focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Seguir
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StatHighlight label="Livros lidos" value={booksRead} icon={<BookOpen size={16} />} />
            <StatHighlight
              label="Páginas lidas"
              value={pagesRead.toLocaleString("pt-BR")}
              icon={<BookOpenCheck size={16} />}
            />
            <StatHighlight
              label="Status"
              value={booksRead > 0 ? "Leitor assíduo" : isLoading ? "Carregando" : "Começando agora"}
              icon={<Sparkles size={16} />}
            />
            <StatHighlight label="Gênero favorito" value={favoriteGenre} icon={<Tag size={16} />} />
          </div>
        </div>
      </section>

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

      <section className="rounded-xl border border-gray-200 bg-gray-100 p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab;

            const Icon = tab === "Estante" ? BookOpen : tab === "Comunidades" ? Users : MessageSquare;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-700 hover:bg-white/60"
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
        <section>
          {shelfBooks.length > 0 ? (
            shelfBooks.map((book) => (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BookCard
                key={book.id}
                title={book.title}
                author="Da sua estante"
                coverUrl={book.coverUrl}
                progress={book.progress}
                variant="compact"
              />
              </section>
            ))
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

    </AppShell>
  );

  
}
