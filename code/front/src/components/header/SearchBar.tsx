"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type SearchScope,
  type SearchSuggestion,
  SEARCH_SCOPE_OPTIONS,
  MIN_SEARCH_LENGTH,
  MAX_RESULTS_PER_TYPE,
  normalizeUsername,
  fetchSearchSuggestions,
} from "@/services/search";
import { searchUsersByUsername } from "@/services/profile";

type SearchDropdownProps = {
  searchScope: SearchScope;
  shouldSearch: boolean;
  isSearching: boolean;
  searchError: string;
  suggestions: SearchSuggestion[];
  onChangeScope: (scope: SearchScope) => void;
  onSelectSuggestion: (href?: string) => void;
};

function SearchDropdown({
  searchScope,
  shouldSearch,
  isSearching,
  searchError,
  suggestions,
  onChangeScope,
  onSelectSuggestion,
}: Readonly<SearchDropdownProps>) {
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

      {showPrompt ? (
        <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">Digite pelo menos 2 caracteres para buscar.</p>
      ) : null}
      {shouldSearch && isSearching ? (
        <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">Buscando...</p>
      ) : null}
      {shouldSearch && !isSearching && searchError ? (
        <p className="px-4 py-3 text-sm text-red-600">{searchError}</p>
      ) : null}
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

type SearchBarProps = {
  searchPlaceholder: string;
};

export function SearchBar({ searchPlaceholder }: Readonly<SearchBarProps>) {
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
            <SearchDropdown
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
