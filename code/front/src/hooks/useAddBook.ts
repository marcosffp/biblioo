import { useEffect, useState } from "react";
import {
  addBookToShelf,
  BookcaseApiError,
  getBookById,
  listShelfItems,
  listShelves,
  searchBooks,
} from "@/services";
import type { BackendBookResponse, BackendShelfSummaryResponse } from "@/types/api";
import { computeBookSuggestions, mapBackendReadingStatus, normalizeSearchTerm } from "@/utils/bookcase-filters";
import type { ShelfBook } from "./useBookcasePage";

const MIN_ADD_BOOK_SEARCH_LENGTH = 2;
const ADD_BOOK_SEARCH_DEBOUNCE_MS = 300;

function pickAuthor(authors: string[] | undefined): string {
  if (!authors || authors.length === 0) return "Autor desconhecido";
  return authors.join(", ");
}

interface UseAddBookProps {
  shelves: BackendShelfSummaryResponse[];
  setShelves: React.Dispatch<React.SetStateAction<BackendShelfSummaryResponse[]>>;
  shelfBooks: ShelfBook[];
  setShelfBooks: React.Dispatch<React.SetStateAction<ShelfBook[]>>;
  selectedShelfId: number | null;
  onNavigateToShelfBook: (shelf: BackendShelfSummaryResponse, bookId: number) => Promise<void>;
  onOpenShelfBookDetails: (book: ShelfBook) => void;
}

export function useAddBook({
  shelves,
  setShelves,
  shelfBooks,
  setShelfBooks,
  selectedShelfId,
  onNavigateToShelfBook,
  onOpenShelfBookDetails,
}: UseAddBookProps) {
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [addBookSearchTerm, setAddBookSearchTerm] = useState("");
  const [addBookSuggestions, setAddBookSuggestions] = useState<BackendBookResponse[]>([]);
  const [isSearchingAddBook, setIsSearchingAddBook] = useState(false);
  const [addBookSearchError, setAddBookSearchError] = useState("");

  const [selectedSuggestionBook, setSelectedSuggestionBook] = useState<ShelfBook | null>(null);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [addToShelfError, setAddToShelfError] = useState("");

  const normalizedAddBookTerm = normalizeSearchTerm(addBookSearchTerm);
  const shouldSearchAddBook = normalizedAddBookTerm.length >= MIN_ADD_BOOK_SEARCH_LENGTH;

  const validAddBookSuggestions = addBookSuggestions.filter(
    (s): s is BackendBookResponse & { id: number } => typeof s.id === "number" && Number.isFinite(s.id),
  );

  const computedSuggestions = computeBookSuggestions(
    validAddBookSuggestions.map((s) => ({
      id: String(s.id),
      title: s.title,
      author: pickAuthor(s.authors),
      readingStatus: "quero-ler" as const,
    })),
    addBookSearchTerm,
  );

  const visibleAddBookSuggestions = computedSuggestions.map((suggestion) => {
    const source = validAddBookSuggestions.find((item) => String(item.id) === suggestion.id);
    return {
      id: suggestion.id,
      title: suggestion.title,
      author: pickAuthor(source?.authors),
      coverUrl: source?.coverUrl ?? undefined,
    };
  });

  const isSelectedBookAlreadyInShelf = selectedSuggestionBook
    ? shelfBooks.some((book) => book.id === selectedSuggestionBook.id)
    : false;

  useEffect(() => {
    async function loadAddBookSuggestions() {
      if (!isAddBookModalOpen || !shouldSearchAddBook) {
        setAddBookSuggestions([]);
        setAddBookSearchError("");
        setIsSearchingAddBook(false);
        return;
      }
      try {
        setIsSearchingAddBook(true);
        setAddBookSearchError("");
        const result = await searchBooks(addBookSearchTerm);
        setAddBookSuggestions(result.slice(0, 8));
      } catch {
        setAddBookSuggestions([]);
        setAddBookSearchError("Não foi possível buscar livros agora. Tente novamente.");
      } finally {
        setIsSearchingAddBook(false);
      }
    }

    const timeoutId = globalThis.setTimeout(() => void loadAddBookSuggestions(), ADD_BOOK_SEARCH_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(timeoutId);
  }, [addBookSearchTerm, isAddBookModalOpen, shouldSearchAddBook]);

  const handleOpenSuggestionBookById = (bookId: number) => {
    async function loadBookDetails() {
      if (Number.isNaN(bookId)) return;
      try {
        const availableShelves = shelves.length > 0 ? shelves : await listShelves();

        let shelfWithBook: BackendShelfSummaryResponse | null = null;
        for (const shelf of availableShelves) {
          const shelfItems = await listShelfItems(shelf.id);
          if (shelfItems.some((item) => item.bookId === bookId)) {
            shelfWithBook = shelf;
            break;
          }
        }

        if (shelfWithBook) {
          setIsBookDetailsOpen(false);
          setSelectedSuggestionBook(null);
          setAddToShelfError("");
          setIsAddBookModalOpen(false);
          await onNavigateToShelfBook(shelfWithBook, bookId);
          return;
        }

        const book = await getBookById(bookId);
        setSelectedSuggestionBook({
          id: book.id.toString(),
          title: book.title,
          author: pickAuthor(book.authors),
          readingStatus: "quero-ler",
          coverUrl: book.coverUrl ?? undefined,
          synopsis: book.description ?? undefined,
          rating: book.averageRating ?? undefined,
          readerCount: book.readerCount ?? undefined,
          totalPages: book.pageCount ?? undefined,
        });
        setAddBookSearchTerm(book.title);
        setIsBookDetailsOpen(true);
        setIsAddBookModalOpen(false);
      } catch {
        setIsBookDetailsOpen(false);
      }
    }
    void loadBookDetails();
  };

  const handleSuggestionSelect = (suggestion: { id: string; title: string; author: string; coverUrl?: string }) => {
    handleOpenSuggestionBookById(Number(suggestion.id));
  };

  const handleCloseBookDetails = () => {
    setIsBookDetailsOpen(false);
    setAddToShelfError("");
  };

  const handleCloseAddBookModal = () => {
    setIsAddBookModalOpen(false);
    setAddBookSearchTerm("");
    setAddBookSuggestions([]);
    setAddBookSearchError("");
    setIsSearchingAddBook(false);
  };

  const handleAddBookClick = (isInsideShelf: boolean) => {
    if (!isInsideShelf) return;
    setIsAddBookModalOpen(true);
    setIsBookDetailsOpen(false);
    requestAnimationFrame(() => {
      (document.getElementById("bookcase-add-search-input") as HTMLInputElement | null)?.focus();
    });
  };

  const handleAddSelectedBookToShelf = (targetShelfId: number) => {
    const selectedBook = selectedSuggestionBook;
    if (!selectedBook) return;
    const selectedBookId = Number(selectedBook.id);

    async function addSelectedBook() {
      setIsAddingToShelf(true);
      setAddToShelfError("");
      try {
        const createdItem = await addBookToShelf(targetShelfId, selectedBookId);
        const fullBook = await getBookById(createdItem.bookId);
        const createdShelfBook: ShelfBook = {
          shelfItemId: createdItem.id,
          id: createdItem.bookId.toString(),
          title: createdItem.bookTitle,
          author: pickAuthor(fullBook.authors),
          readingStatus: mapBackendReadingStatus(createdItem.status),
          coverUrl: createdItem.bookCoverUrl ?? fullBook.coverUrl ?? undefined,
          synopsis: undefined,
          rating: fullBook.averageRating ?? undefined,
          progress: createdItem.progressPercent ?? undefined,
          currentPage: createdItem.currentPage ?? undefined,
          totalPages: createdItem.totalPages ?? fullBook.pageCount ?? undefined,
        };

        if (selectedShelfId !== null && selectedShelfId === targetShelfId) {
          setShelfBooks((books) =>
            books.some((b) => b.id === createdShelfBook.id) ? books : [...books, createdShelfBook],
          );
        }

        setShelves((ss) =>
          ss.map((shelf) =>
            shelf.id === targetShelfId
              ? {
                  ...shelf,
                  itemCount: shelf.itemCount + 1,
                  coverPreview: createdShelfBook.coverUrl
                    ? [createdShelfBook.coverUrl, ...shelf.coverPreview].slice(0, 4)
                    : shelf.coverPreview,
                }
              : shelf,
          ),
        );

        setIsBookDetailsOpen(false);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setAddToShelfError("Faça login para adicionar livros na estante.");
        } else {
          setAddToShelfError("Não foi possível adicionar o livro. Tente novamente.");
        }
      } finally {
        setIsAddingToShelf(false);
      }
    }
    void addSelectedBook();
  };

  const resetPanel = () => {
    setIsBookDetailsOpen(false);
    setSelectedSuggestionBook(null);
    setAddToShelfError("");
  };

  return {
    addBookSearchTerm,
    addBookSearchError,
    isAddBookModalOpen,
    isSearchingAddBook,
    selectedSuggestionBook,
    isBookDetailsOpen,
    isAddingToShelf,
    addToShelfError,
    shouldSearchAddBook,
    visibleAddBookSuggestions,
    isSelectedBookAlreadyInShelf,
    setAddBookSearchTerm,
    handleOpenSuggestionBookById,
    handleSuggestionSelect,
    handleCloseBookDetails,
    handleCloseAddBookModal,
    handleAddBookClick,
    handleAddSelectedBookToShelf,
    resetPanel,
  };
}
