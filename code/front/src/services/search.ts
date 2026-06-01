import { searchBooks } from "@/services/bookcase";
import { searchUsersByUsername } from "@/services/profile";
import type { BackendBookResponse, UserSummaryResponse } from "@/types/api";

export type SearchScope = "general" | "user" | "book";

export type SearchSuggestion = {
  id: string;
  type: "user" | "book";
  title: string;
  subtitle: string;
  imageUrl?: string;
  href?: string;
};

export const SEARCH_SCOPE_OPTIONS: Array<{ value: SearchScope; label: string }> = [
  { value: "general", label: "Geral" },
  { value: "user", label: "Leitor" },
  { value: "book", label: "Livro" },
];

export const MIN_SEARCH_LENGTH = 2;
export const MAX_RESULTS_PER_TYPE = 5;

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function userToSuggestion(user: UserSummaryResponse): SearchSuggestion {
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

export function bookToSuggestion(book: BackendBookResponse): SearchSuggestion {
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

export async function fetchSearchSuggestions(scope: SearchScope, term: string): Promise<SearchSuggestion[]> {
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
