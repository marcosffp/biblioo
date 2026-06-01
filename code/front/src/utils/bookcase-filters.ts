export type ReadingStatus = "todos" | "lendo" | "quero-ler" | "lido" | "relendo" | "abandonei";

export type BackendStatusKey = "READING" | "REREADING" | "COMPLETED" | "ABANDONED" | "WANT_TO_READ";

export function mapBackendReadingStatus(status: string): Exclude<ReadingStatus, "todos"> {
  switch (status) {
    case "READING":
      return "lendo";
    case "REREADING":
      return "relendo";
    case "COMPLETED":
      return "lido";
    case "ABANDONED":
      return "abandonei";
    case "WANT_TO_READ":
    default:
      return "quero-ler";
  }
}

export function mapFrontendReadingStatus(status: Exclude<ReadingStatus, "todos">): BackendStatusKey {
  switch (status) {
    case "lendo":
      return "READING";
    case "relendo":
      return "REREADING";
    case "lido":
      return "COMPLETED";
    case "abandonei":
      return "ABANDONED";
    case "quero-ler":
    default:
      return "WANT_TO_READ";
  }
}

export function isDuplicateReviewError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("ja fez uma review") || normalized.includes("já fez uma review");
}

export interface RuleBook {
  id: string;
  title: string;
  author: string;
  readingStatus: Exclude<ReadingStatus, "todos">;
}

export interface RuleCollection {
  id: string;
  title: string;
}

export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

export function filterBooksByStatusAndSearch(
  books: RuleBook[],
  statusFilter: ReadingStatus,
  rawSearchTerm: string,
): RuleBook[] {
  const normalizedTerm = normalizeSearchTerm(rawSearchTerm);

  const booksByStatus =
    statusFilter === "todos" ? books : books.filter((book) => book.readingStatus === statusFilter);

  if (!normalizedTerm) {
    return booksByStatus;
  }

  return booksByStatus.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(normalizedTerm);
    const authorMatch = book.author.toLowerCase().includes(normalizedTerm);
    return titleMatch || authorMatch;
  });
}

export function filterCollectionsBySearch(
  collections: RuleCollection[],
  rawSearchTerm: string,
): RuleCollection[] {
  const normalizedTerm = normalizeSearchTerm(rawSearchTerm);

  if (!normalizedTerm) {
    return collections;
  }

  return collections.filter((collection) => collection.title.toLowerCase().includes(normalizedTerm));
}

export function computeBookSuggestions(books: RuleBook[], rawSearchTerm: string): RuleBook[] {
  const normalizedTerm = normalizeSearchTerm(rawSearchTerm);

  if (normalizedTerm.length < 2) {
    return [];
  }

  return books.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(normalizedTerm);
    const authorMatch = book.author.toLowerCase().includes(normalizedTerm);
    return titleMatch || authorMatch;
  });
}

export function isBookAlreadyInShelf(shelfBooks: RuleBook[], bookId: string): boolean {
  return shelfBooks.some((book) => book.id === bookId);
}

export function addBookToShelfWithoutDuplicate(shelfBooks: RuleBook[], selectedBook: RuleBook): RuleBook[] {
  if (isBookAlreadyInShelf(shelfBooks, selectedBook.id)) {
    return shelfBooks;
  }

  return [...shelfBooks, selectedBook];
}
