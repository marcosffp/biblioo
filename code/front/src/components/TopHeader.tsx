"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Bell, BookOpen, Search } from "lucide-react";
import { searchBooks, type BackendBookResponse } from "@/services/bookcase";
import { getAuthSession } from "@/services/auth";
import { getMyProfile, listFollowersByUsername, searchUsersByUsername, type UserSummaryResponse } from "@/services/profile";

type SearchScope = "general" | "user" | "book";

type SearchSuggestion = {
  id: string;
  type: "user" | "book";
  title: string;
  subtitle: string;
  imageUrl?: string;
  href?: string;
};

const SEARCH_SCOPE_OPTIONS: Array<{ value: SearchScope; label: string }> = [
  { value: "general", label: "Geral" },
  { value: "user", label: "Usuario" },
  { value: "book", label: "Livro" },
];

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS_PER_TYPE = 5;
const FOLLOWER_NOTIFICATION_POLL_MS = 60_000;

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function userToSuggestion(user: UserSummaryResponse): SearchSuggestion {
  const username = user.username.trim();
  return {
    id: `user-${user.id}`,
    type: "user",
    title: username,
    subtitle: "Usuario",
    imageUrl: user.avatarUrl ?? undefined,
    href: `/profile/${encodeURIComponent(username)}`,
  };
}

function bookToSuggestion(book: BackendBookResponse): SearchSuggestion {
  const authorLabel = book.authors.length > 0 ? book.authors.join(", ") : "Autores nao informados";
  return {
    id: `book-${book.id}`,
    type: "book",
    title: book.title,
    subtitle: `Livro • ${authorLabel}`,
    imageUrl: book.coverUrl ?? undefined,
    href: `/bookcase?search=${encodeURIComponent(book.title)}`,
  };
}

async function fetchSearchSuggestions(scope: SearchScope, term: string): Promise<SearchSuggestion[]> {
  if (scope === "user") {
    const users = await searchUsersByUsername(term, undefined, 0, MAX_RESULTS_PER_TYPE);
    return users.map(userToSuggestion);
  }

  if (scope === "book") {
    const books = await searchBooks(term);
    return books.slice(0, MAX_RESULTS_PER_TYPE).map(bookToSuggestion);
  }

  const [usersResult, booksResult] = await Promise.allSettled([
    searchUsersByUsername(term, undefined, 0, MAX_RESULTS_PER_TYPE),
    searchBooks(term),
  ]);

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const books = booksResult.status === "fulfilled" ? booksResult.value.slice(0, MAX_RESULTS_PER_TYPE) : [];

  if (usersResult.status === "rejected" && booksResult.status === "rejected") {
    throw new Error("search_failed");
  }

  return [...users.map(userToSuggestion), ...books.map(bookToSuggestion)];
}

export interface TopHeaderProps {
  title?: string;
  searchPlaceholder?: string;
  notificationsCount?: number;
  userInitial?: string;
  className?: string;
}

type TopHeaderSearchBarProps = {
  searchPlaceholder: string;
};

function getFollowerNotificationSeenKey(username: string): string {
  return `biblioo.notifications.followers.seen.${username.toLowerCase()}`;
}

function loadSeenFollowerIds(username: string): Set<number> | null {
  if (globalThis.localStorage === undefined) {
    return null;
  }

  const raw = globalThis.localStorage.getItem(getFollowerNotificationSeenKey(username));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const ids = parsed
      .map(Number)
      .filter((value) => Number.isFinite(value));
    return new Set(ids);
  } catch {
    return null;
  }
}

function saveSeenFollowerIds(username: string, followerIds: number[]) {
  if (globalThis.localStorage === undefined) {
    return;
  }

  globalThis.localStorage.setItem(getFollowerNotificationSeenKey(username), JSON.stringify(followerIds));
}

type TopHeaderSearchDropdownProps = {
  searchScope: SearchScope;
  shouldSearch: boolean;
  isSearching: boolean;
  searchError: string;
  suggestions: SearchSuggestion[];
  onChangeScope: (scope: SearchScope) => void;
  onSelectSuggestion: (href?: string) => void;
};

function TopHeaderSearchDropdown({
  searchScope,
  shouldSearch,
  isSearching,
  searchError,
  suggestions,
  onChangeScope,
  onSelectSuggestion,
}: Readonly<TopHeaderSearchDropdownProps>) {
  const showPrompt = shouldSearch === false;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg">
      <div className="border-b border-emerald-100 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {SEARCH_SCOPE_OPTIONS.map((option) => {
            const isActive = searchScope === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onChangeScope(option.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-[var(--deep-green)] hover:bg-emerald-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {showPrompt ? <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">Digite pelo menos 2 caracteres para buscar.</p> : null}
      {shouldSearch && isSearching ? <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">Buscando...</p> : null}
      {shouldSearch && !isSearching && searchError ? <p className="px-4 py-3 text-sm text-red-600">{searchError}</p> : null}
      {shouldSearch && !isSearching && !searchError && suggestions.length === 0 ? (
        <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum resultado encontrado.</p>
      ) : null}

      {shouldSearch && !isSearching && !searchError && suggestions.length > 0 ? (
        <ul className="max-h-72 overflow-y-auto divide-y divide-emerald-50">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelectSuggestion(item.href)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  item.href ? "hover:bg-emerald-50" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-8 shrink-0 rounded-md border border-emerald-100 bg-emerald-50 bg-cover bg-center"
                    style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--deep-green)]">{item.title}</p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{item.subtitle}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TopHeaderSearchBar({ searchPlaceholder }: Readonly<TopHeaderSearchBarProps>) {
  const router = useRouter();
  const [searchScope, setSearchScope] = React.useState<SearchScope>("general");
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement | null>(null);

  const normalizedQuery = query.trim();
  const shouldSearch = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  const resolveSearchHref = React.useCallback(
    (scope: SearchScope, term: string): string => {
      const normalizedTerm = term.trim();
      if (!normalizedTerm) {
        return "/feed";
      }

      if (scope === "user") {
        return `/profile/${encodeURIComponent(normalizeUsername(normalizedTerm))}`;
      }

      return `/bookcase?search=${encodeURIComponent(normalizedTerm)}`;
    },
    [],
  );

  const executeSearchNavigation = React.useCallback(
    (scope: SearchScope, term: string) => {
      const href = resolveSearchHref(scope, term);
      router.push(href);
      setIsDropdownOpen(false);
    },
    [resolveSearchHref, router],
  );

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!searchContainerRef.current) {
        return;
      }

      if (!searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  React.useEffect(() => {
    if (!shouldSearch || !isDropdownOpen) {
      setSuggestions([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const timeoutId = globalThis.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        setSearchError("");

        try {
          const nextSuggestions = await fetchSearchSuggestions(searchScope, normalizedQuery);
          setSuggestions(nextSuggestions);
        } catch {
          setSuggestions([]);
          setSearchError("Nao foi possivel buscar agora. Tente novamente.");
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [isDropdownOpen, normalizedQuery, searchScope, shouldSearch]);

  return (
    <div className="flex-1 flex justify-center px-1 sm:px-4">
      <div ref={searchContainerRef} className="w-full max-w-[640px]">
        <div className="relative w-full">
          <label htmlFor="global-search" className="relative block w-full" aria-label="Busca global">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              onFocus={() => {
                setIsSearchFocused(true);
                setIsDropdownOpen(true);
              }}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  executeSearchNavigation(searchScope, normalizedQuery);
                }
              }}
              className="w-full h-10 rounded-xl border border-emerald-200 bg-emerald-50/40 pl-11 pr-4 text-sm text-[var(--deep-green)] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 focus:border-emerald-300 focus:bg-white"
            />
          </label>

          {isDropdownOpen && isSearchFocused ? (
            <TopHeaderSearchDropdown
              searchScope={searchScope}
              shouldSearch={shouldSearch}
              isSearching={isSearching}
              searchError={searchError}
              suggestions={suggestions}
              onChangeScope={(scope) => {
                setSearchScope(scope);
                setIsDropdownOpen(true);
              }}
              onSelectSuggestion={(href) => {
                if (!href) {
                  return;
                }

                router.push(href);
                setIsDropdownOpen(false);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TopHeader({
  title = "Biblioo",
  searchPlaceholder = "Buscar livros, leitores, clubes...",
  notificationsCount = 2,
  userInitial = "U",
  className,
}: Readonly<TopHeaderProps>) {
  const [resolvedInitial, setResolvedInitial] = React.useState(userInitial.toUpperCase().slice(0, 1));
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [myUsername, setMyUsername] = React.useState<string | null>(null);
  const [newFollowerNotifications, setNewFollowerNotifications] = React.useState<UserSummaryResponse[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const notificationsContainerRef = React.useRef<HTMLDivElement | null>(null);

  const dynamicNotificationsCount = newFollowerNotifications.length;
  const shownNotificationsCount = myUsername ? dynamicNotificationsCount : notificationsCount;
  const hasAnyNotifications = shownNotificationsCount > 0;

  React.useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationsContainerRef.current) {
        return;
      }

      if (!notificationsContainerRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isNotificationsOpen]);

  React.useEffect(() => {
    const session = getAuthSession();

    if (!session?.accessToken) {
      return;
    }

    if (session.user?.username) {
      setResolvedInitial(session.user.username.slice(0, 1).toUpperCase());
    }

    if (session.user?.avatarUrl) {
      setAvatarUrl(session.user.avatarUrl);
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const profile = await getMyProfile(session.accessToken);

        if (cancelled) {
          return;
        }

        if (profile.avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
        }

        if (profile.username) {
          setMyUsername(profile.username);
          setResolvedInitial(profile.username.slice(0, 1).toUpperCase());
        } else if (session.user?.username) {
          setMyUsername(session.user.username);
        }
      } catch {
        // Keeps fallback data from auth session when profile request fails.
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const session = getAuthSession();
    const token = session?.accessToken;
    if (!token || !myUsername) {
      return;
    }

    let cancelled = false;

    const refreshFollowerNotifications = async () => {
      try {
        const followers = await listFollowersByUsername(myUsername, token);

        if (cancelled) {
          return;
        }

        const followerIds = followers.map((follower) => follower.id);
        const seenIds = loadSeenFollowerIds(myUsername);

        if (!seenIds) {
          saveSeenFollowerIds(myUsername, followerIds);
          setNewFollowerNotifications([]);
          return;
        }

        const newFollowers = followers.filter((follower) => !seenIds.has(follower.id));
        setNewFollowerNotifications(newFollowers);
      } catch {
        if (!cancelled) {
          setNewFollowerNotifications([]);
        }
      }
    };

    void refreshFollowerNotifications();

    const intervalId = globalThis.setInterval(() => {
      void refreshFollowerNotifications();
    }, FOLLOWER_NOTIFICATION_POLL_MS);

    return () => {
      cancelled = true;
      globalThis.clearInterval(intervalId);
    };
  }, [myUsername]);

  const markFollowerNotificationsAsRead = React.useCallback(() => {
    if (!myUsername) {
      return;
    }

    const allKnownFollowerIds = newFollowerNotifications.map((follower) => follower.id);
    const existingSeen = loadSeenFollowerIds(myUsername) ?? new Set<number>();
    const nextSeenIds = [...existingSeen, ...allKnownFollowerIds];
    saveSeenFollowerIds(myUsername, nextSeenIds);
    setNewFollowerNotifications([]);
  }, [myUsername, newFollowerNotifications]);

  const handleBellClick = React.useCallback(() => {
    setIsNotificationsOpen((previous) => !previous);
  }, []);

  return (
    <header
      className={
        `fixed top-0 left-0 right-0 h-16 bg-white border-b border-emerald-100 z-50 ${className ?? ""}`.trim()
      }
    >
      <div className="h-full w-full px-2 sm:px-4 lg:px-6 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 min-w-fit text-[var(--deep-green)]">
          <BookOpen size={21} className="text-[hsl(var(--primary-dark))]" aria-hidden="true" />
          <span className="font-heading text-[1.85rem] leading-none tracking-tight">{title}</span>
        </div>

        <TopHeaderSearchBar searchPlaceholder={searchPlaceholder} />

        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          <div ref={notificationsContainerRef} className="relative">
            <button
              type="button"
              onClick={handleBellClick}
              className="relative h-10 w-10 rounded-full text-[var(--deep-green)] hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-200 transition-colors"
              aria-label="Notificacoes"
              aria-expanded={isNotificationsOpen}
              aria-haspopup="dialog"
            >
              <Bell size={18} className="mx-auto" aria-hidden="true" />
              {hasAnyNotifications ? (
                <span className="absolute right-1.5 top-1.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold leading-4 text-center">
                  {shownNotificationsCount}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div
                aria-label="Notificacoes"
                className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-[var(--deep-green)]">Notificacoes</h3>
                  {newFollowerNotifications.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        markFollowerNotificationsAsRead();
                        setIsNotificationsOpen(false);
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Marcar lidas
                    </button>
                  ) : null}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {newFollowerNotifications.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-[var(--text-secondary)] break-words">
                      Nenhuma notificacao nova por enquanto.
                    </p>
                  ) : (
                    <ul className="divide-y divide-emerald-50">
                      {newFollowerNotifications.map((follower) => (
                        <li key={follower.id}>
                          <Link
                            href={`/profile/${encodeURIComponent(follower.username)}`}
                            onClick={() => {
                              markFollowerNotificationsAsRead();
                              setIsNotificationsOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50"
                          >
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-100 bg-emerald-100">
                              {follower.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={follower.avatarUrl} alt={`Avatar de ${follower.username}`} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
                                  {follower.username.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm text-[var(--deep-green)] break-words">
                                <span className="font-semibold">{follower.username}</span> comecou a seguir voce.
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/profile"
            className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm hover:bg-emerald-200 transition-colors overflow-hidden flex items-center justify-center"
            aria-label="Ir para meu perfil"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Foto do perfil" className="h-full w-full object-cover" />
            ) : (
              <span>{resolvedInitial}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
