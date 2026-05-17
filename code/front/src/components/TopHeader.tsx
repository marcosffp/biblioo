"use client";

import Link from "next/link";
import React from "react";
import { Bell, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropdownClose } from "@/hooks/useDropdownClose";
import { useNotificationsPanel } from "@/hooks/useNotificationsPanel";
import { getNotificationText, formatNotificationDate } from "@/utils/notifications";
import { searchBooks, type BackendBookResponse } from "@/services/bookcase";
import { clearAuthSession, getAuthSession } from "@/services/auth";
import { type NotificationSummary } from "@/services/notifications";
import {
  getMyProfile,
  searchUsersByUsername,
  type UserSummaryResponse,
} from "@/services/profile";

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
  { value: "user", label: "Leitor" },
  { value: "book", label: "Livro" },
];

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS_PER_TYPE = 5;

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function userToSuggestion(user: UserSummaryResponse): SearchSuggestion {
  const username = user.username.trim();
  return {
    id: `user-${user.id}`,
    type: "user",
    title: username,
    subtitle: "Leitor",
    imageUrl: user.avatarUrl ?? undefined,
    href: `/profile/${encodeURIComponent(username)}`,
  };
}

function bookToSuggestion(book: BackendBookResponse): SearchSuggestion {
  const authorLabel = book.authors.length > 0 ? book.authors.join(", ") : "Autores não informados";
  return {
    id: `book-${book.id}`,
    type: "book",
    title: book.title,
    subtitle: `Livro • ${authorLabel}`,
    imageUrl: book.coverUrl ?? undefined,
    href: `/bookcase?search=${encodeURIComponent(book.title)}&bookId=${book.id}&openBookDetails=1`,
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
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const normalizedQuery = query.trim();
  const shouldSearch = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  const resolveSearchHref = React.useCallback((scope: SearchScope, term: string): string => {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) return "/feed";
    if (scope === "user") return `/profile/${encodeURIComponent(normalizeUsername(normalizedTerm))}`;
    return `/bookcase?search=${encodeURIComponent(normalizedTerm)}`;
  }, []);

  const executeSearchNavigation = React.useCallback(
    async (scope: SearchScope, term: string) => {
      const normalizedTerm = term.trim();

      if (!normalizedTerm) {
        setSearchError("Digite algo para buscar.");
        setIsDropdownOpen(true);
        return;
      }

      if (scope === "user") {
        const normalizedUsername = normalizeUsername(normalizedTerm);
        try {
          const users = await searchUsersByUsername(normalizedUsername, undefined, 0, MAX_RESULTS_PER_TYPE);
          const exactMatch = users.find(
            (user) => user.username.trim().toLowerCase() === normalizedUsername,
          );
          if (!exactMatch) {
            setSearchError("Usuario não encontrado.");
            setSuggestions([]);
            setIsDropdownOpen(true);
            return;
          }
          router.push(`/profile/${encodeURIComponent(exactMatch.username.trim())}`);
          setIsDropdownOpen(false);
          return;
        } catch {
          setSearchError("Não foi possível buscar usuários agora.");
          setIsDropdownOpen(true);
          return;
        }
      }

      const href = resolveSearchHref(scope, normalizedTerm);
      router.push(href);
      setIsDropdownOpen(false);
    },
    [resolveSearchHref, router],
  );

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!searchContainerRef.current) return;
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
          setSearchError("Não foi possível buscar agora. Tente novamente.");
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => globalThis.clearTimeout(timeoutId);
  }, [isDropdownOpen, normalizedQuery, searchScope, shouldSearch]);

  return (
    <div className="flex-1 flex justify-center px-1 sm:px-4">
      <div ref={searchContainerRef} className="w-full max-w-[640px]">
        <div className="relative w-full">
          <label htmlFor="global-search" className="relative block w-full" aria-label="Busca global">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="global-search"
              type="text"
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
                  void executeSearchNavigation(searchScope, normalizedQuery);
                }
              }}
              className="h-10 w-full rounded-full border border-gray-300 bg-white pl-11 pr-10 text-sm text-slate-700 placeholder:text-slate-500 transition-all duration-200 focus:border-gray-400 focus:bg-white"
            />
            {query ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setSearchError("");
                  setIsDropdownOpen(true);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            ) : null}
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
                if (!href) return;
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

type NotificationItemProps = {
  notification: NotificationSummary;
  communityNamesById: Record<number, string>;
  processingFollowRequestId: string | null;
  processingCommunityInviteId: string | null;
  processingCommunityJoinRequestId: string | null;
  onNotificationClick: (notification: NotificationSummary) => void;
  onFollowRequestAction: (notification: NotificationSummary, action: "accept" | "reject") => void;
  onJoinRequestAction: (notification: NotificationSummary, action: "approve" | "reject") => void;
};

function NotificationItem({
  notification,
  communityNamesById,
  processingFollowRequestId,
  processingCommunityInviteId,
  processingCommunityJoinRequestId,
  onNotificationClick,
  onFollowRequestAction,
  onJoinRequestAction,
}: Readonly<NotificationItemProps>) {
  const isFollowRequest = notification.type === "USER_FOLLOW_REQUESTED";
  const isProcessingFollowRequest = processingFollowRequestId === notification.id;
  const isCommunityInvite = notification.type === "COMMUNITY_INVITE";
  const isProcessingCommunityInvite = processingCommunityInviteId === notification.id;
  const isCommunityJoinRequest = notification.type === "COMMUNITY_JOIN_REQUEST";
  const hasJoinRequestAction = isCommunityJoinRequest && Boolean(notification.communityId || notification.entityId);
  const isProcessingCommunityJoinRequest = processingCommunityJoinRequestId === notification.id;
  const inviteCommunityName = notification.communityId ? communityNamesById[notification.communityId] : undefined;
  const inviteActorName = notification.actorUsername ?? "Alguem";

  return (
    <li className={notification.read ? "opacity-75" : ""}>
      <button
        type="button"
        onClick={() => void onNotificationClick(notification)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-100 bg-emerald-100">
          {notification.actorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.actorAvatarUrl}
              alt={`Avatar de ${notification.actorUsername ?? "usuario"}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
              {(notification.actorUsername ?? "U").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {isCommunityInvite ? (
            <div>
              <p className="text-sm text-[var(--deep-green)] break-words leading-5">
                <span className="font-semibold">{inviteActorName}</span> te convidou para a comunidade
              </p>
              <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Comunidade</p>
                <p className="text-sm font-semibold text-[var(--deep-green)] break-words">
                  {inviteCommunityName ?? "Comunidade"}
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {formatNotificationDate(notification.createdAt)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--deep-green)] break-words leading-5">
                {getNotificationText(
                  notification,
                  notification.communityId ? communityNamesById[notification.communityId] : undefined,
                )}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {formatNotificationDate(notification.createdAt)}
              </p>
            </>
          )}
        </div>
      </button>

      {isFollowRequest ? (
        <div className="px-4 pb-3 -mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onFollowRequestAction(notification, "reject")}
            disabled={isProcessingFollowRequest}
            className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => void onFollowRequestAction(notification, "accept")}
            disabled={isProcessingFollowRequest}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aceitar
          </button>
        </div>
      ) : null}

      {isCommunityInvite && isProcessingCommunityInvite ? (
        <p className="px-4 pb-3 text-xs text-[var(--text-secondary)]">Processando convite...</p>
      ) : null}

      {hasJoinRequestAction ? (
        <div className="px-4 pb-3 -mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onJoinRequestAction(notification, "reject")}
            disabled={isProcessingCommunityJoinRequest}
            className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => void onJoinRequestAction(notification, "approve")}
            disabled={isProcessingCommunityJoinRequest}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aceitar
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function TopHeader({
  title = "Biblioo",
  searchPlaceholder = "Buscar livros, leitores, clubes...",
  notificationsCount = 2,
  userInitial = "U",
  className,
}: Readonly<TopHeaderProps>) {
  const router = useRouter();
  const [resolvedInitial, setResolvedInitial] = React.useState(userInitial.toUpperCase().slice(0, 1));
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const profileMenuContainerRef = React.useRef<HTMLDivElement | null>(null);

  const {
    containerRef: notificationsContainerRef,
    isNotificationsOpen,
    visibleNotifications,
    visibleUnreadCount,
    isLoading,
    communityNamesById,
    processingFollowRequestId,
    processingCommunityInviteId,
    processingCommunityJoinRequestId,
    notificationActionFeedback,
    handleBellClick,
    handleNotificationClick,
    handleFollowRequestAction,
    handleJoinRequestAction,
  } = useNotificationsPanel(accessToken);

  const closeProfileMenu = React.useCallback(() => setIsProfileMenuOpen(false), []);
  useDropdownClose(profileMenuContainerRef, isProfileMenuOpen, closeProfileMenu);

  React.useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;

    setAccessToken(session.accessToken);

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
        if (cancelled) return;
        if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        if (profile.username) setResolvedInitial(profile.username.slice(0, 1).toUpperCase());
      } catch {
        // Keeps fallback data from auth session when profile request fails.
      }
    };
    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = React.useCallback(() => {
    clearAuthSession();
    setAccessToken(null);
    setIsProfileMenuOpen(false);
    router.push("/login");
  }, [router]);

  const shownNotificationsCount = accessToken ? visibleUnreadCount : notificationsCount;
  const hasAnyNotifications = shownNotificationsCount > 0;

  let notificationsContent: React.ReactNode;
  if (isLoading) {
    notificationsContent = (
      <p className="px-4 py-4 text-sm text-[var(--text-secondary)] break-words">Carregando Notificações...</p>
    );
  } else if (visibleNotifications.length === 0) {
    notificationsContent = (
      <p className="px-4 py-4 text-sm text-[var(--text-secondary)] break-words">
        Nenhuma notificação por enquanto.
      </p>
    );
  } else {
    notificationsContent = (
      <ul className="divide-y divide-emerald-50">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            communityNamesById={communityNamesById}
            processingFollowRequestId={processingFollowRequestId}
            processingCommunityInviteId={processingCommunityInviteId}
            processingCommunityJoinRequestId={processingCommunityJoinRequestId}
            onNotificationClick={(n) => void handleNotificationClick(n)}
            onFollowRequestAction={(n, action) => void handleFollowRequestAction(n, action)}
            onJoinRequestAction={(n, action) => void handleJoinRequestAction(n, action)}
          />
        ))}
      </ul>
    );
  }

  return (
    <header
      className={
        `fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#156b50]/60 bg-[#1a8162] shadow-[0_4px_16px_rgba(13,87,64,0.28)] ${className ?? ""}`.trim()
      }
    >
      <div className="h-full w-full px-2 sm:px-4 lg:px-6 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 min-w-fit">
          <img className="h-8 w-auto" src="/biblioo-logo-branca.png" alt="Biblioo" />
        </div>

        <TopHeaderSearchBar searchPlaceholder={searchPlaceholder} />

        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          <div ref={notificationsContainerRef} className="relative">
            <button
              type="button"
              onClick={handleBellClick}
              className="relative h-10 w-10 rounded-full text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30 transition-colors"
              aria-label="Notificações"
              aria-expanded={isNotificationsOpen}
              aria-haspopup="dialog"
            >
              <Bell size={18} className="mx-auto" aria-hidden="true" />
              {hasAnyNotifications ? (
                <span className="absolute right-1.5 top-1.5 h-4 min-w-4 px-1 rounded-full bg-white text-[#1a8162] text-[10px] font-semibold leading-4 text-center">
                  {shownNotificationsCount}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div
                aria-label="Notificações"
                className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-[var(--deep-green)]">Notificações</h3>
                </div>

                {notificationActionFeedback ? (
                  <p
                    className={`px-4 py-2 text-xs ${
                      notificationActionFeedback.type === "success"
                        ? "border-b border-emerald-100 bg-emerald-50 text-emerald-800"
                        : "border-b border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    {notificationActionFeedback.message}
                  </p>
                ) : null}

                <div className="max-h-80 overflow-y-auto">{notificationsContent}</div>
              </div>
            ) : null}
          </div>

          <div ref={profileMenuContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((previous) => !previous)}
              className="h-10 w-10 rounded-full bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors overflow-hidden flex items-center justify-center ring-2 ring-white/20"
              aria-label="Abrir menu do perfil"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Foto do perfil" className="h-full w-full object-cover" />
              ) : (
                <span>{resolvedInitial}</span>
              )}
            </button>

            {isProfileMenuOpen ? (
              <div
                role="menu"
                aria-label="Menu do perfil"
                className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-44 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-[var(--deep-green)] hover:bg-emerald-50"
                >
                  Meu perfil
                </Link>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-[var(--deep-green)] hover:bg-emerald-50"
                >
                  Configurações
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
