import { useEffect, useState } from "react";
import {
  filterBooksByStatusAndSearch,
  mapBackendReadingStatus,
  normalizeSearchTerm,
  type ReadingStatus,
  type RuleBook,
} from "@/utils/bookcase-filters";
import {
  BookcaseApiError,
  getAccessToken,
  getBookById,
  getShelfById,
  getShelfItemById,
  listCollections,
  listShelves,
  listShelfItems,
} from "@/services";
import type { BackendCollectionSummaryResponse, BackendShelfResponse, BackendShelfSummaryResponse } from "@/types/api";
import { useShelfForm } from "./useShelfForm";
import { useCollectionForm } from "./useCollectionForm";
import { useAddBook } from "./useAddBook";
import { useShelfBookDetails } from "./useShelfBookDetails";

export const readingStatusOptions: Array<{ value: ReadingStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "lendo", label: "Lendo" },
  { value: "quero-ler", label: "Quero Ler" },
  { value: "lido", label: "Lidos" },
  { value: "relendo", label: "Relendo" },
  { value: "abandonei", label: "Abandonados" },
];

export interface ShelfBook extends RuleBook {
  shelfItemId?: number;
  id: string;
  title: string;
  author: string;
  rating?: number;
  readerCount?: number;
  progress?: number;
  readingStatus: Exclude<ReadingStatus, "todos">;
  coverUrl?: string;
  synopsis?: string;
  description?: string;
  currentPage?: number;
  totalPages?: number;
}

export type RootViewMode = "estantes" | "colecoes";

function pickAuthor(authors: string[] | undefined): string {
  if (!authors || authors.length === 0) return "Autor desconhecido";
  return authors.join(", ");
}

export function useBookcasePage() {
  // Core data
  const [shelves, setShelves] = useState<BackendShelfSummaryResponse[]>([]);
  const [collections, setCollections] = useState<BackendCollectionSummaryResponse[]>([]);
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [loadError, setLoadError] = useState("");

  // Navigation
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>("estantes");
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [selectedShelfName, setSelectedShelfName] = useState("");
  const [selectedShelfDescription, setSelectedShelfDescription] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReadingStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Sub-hooks
  const shelfForm = useShelfForm({
    setShelves,
    setCollections,
    selectedShelfId,
    onShelfCreated: (createdShelf: BackendShelfResponse) => {
      setSelectedShelfId(createdShelf.id);
      setSelectedShelfName(createdShelf.name);
      setShelfBooks([]);
      setStatusFilter("todos");
      setSearchTerm("");
    },
    onDeleteActiveShelf: () => handleBackToShelves(),
    onUpdateActiveShelf: (name: string, description: string) => {
      setSelectedShelfName(name);
      setSelectedShelfDescription(description);
    },
  });

  const collectionForm = useCollectionForm({
    shelves,
    collections,
    setCollections,
    selectedCollectionId,
    setSelectedCollectionId,
    setRootViewMode,
    setSearchTerm,
  });

  const shelfBookDetails = useShelfBookDetails({
    selectedShelfId,
    setShelfBooks,
    setShelves,
  });

  const addBook = useAddBook({
    shelves,
    setShelves,
    shelfBooks,
    setShelfBooks,
    selectedShelfId,
    onNavigateToShelfBook: async (shelf: BackendShelfSummaryResponse, bookId: number) => {
      const loadedBooks = await enterShelf(shelf);
      const existingBook = loadedBooks.find((b) => Number(b.id) === bookId) ?? null;
      if (existingBook) shelfBookDetails.handleOpenShelfBookDetails(existingBook);
    },
    onOpenShelfBookDetails: shelfBookDetails.handleOpenShelfBookDetails,
  });

  // Load shelf books (shared helper used by navigation and add book flow)
  const loadShelfBooks = async (shelfId: number): Promise<ShelfBook[]> => {
    const items = await listShelfItems(shelfId);
    const mappedItems = await Promise.all(
      items.map(async (item) => {
        const [book, detailedItem] = await Promise.all([
          getBookById(item.bookId),
          getShelfItemById(shelfId, item.id),
        ]);
        return {
          shelfItemId: item.id,
          id: item.bookId.toString(),
          title: item.bookTitle,
          author: pickAuthor(book.authors),
          readingStatus: mapBackendReadingStatus(item.status),
          coverUrl: item.bookCoverUrl ?? book.coverUrl ?? undefined,
          synopsis: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
          description: book.description ?? (book as { synopsis?: string | null }).synopsis ?? undefined,
          rating: book.averageRating ?? undefined,
          readerCount: book.readerCount ?? undefined,
          progress: item.progressPercent ?? undefined,
          currentPage: detailedItem.currentPage ?? undefined,
          totalPages: detailedItem.totalPages ?? book.pageCount ?? undefined,
        } as ShelfBook;
      }),
    );
    setShelfBooks(mappedItems);
    return mappedItems;
  };

  // Internal async helper for shelf navigation (returns loaded books for callbacks)
  const enterShelf = async (shelf: BackendShelfSummaryResponse): Promise<ShelfBook[]> => {
    setLoadError("");
    setSelectedCollectionId(null);
    setSelectedShelfId(shelf.id);
    setSelectedShelfName(shelf.name);
    setSelectedShelfDescription("");
    setStatusFilter("todos");
    setSearchTerm("");
    try {
      const [shelfDetails, loadedBooks] = await Promise.all([getShelfById(shelf.id), loadShelfBooks(shelf.id)]);
      setSelectedShelfDescription(shelfDetails.description?.trim() ?? "");
      return loadedBooks;
    } catch (error) {
      if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
        setLoadError("Faça login para abrir esta estante.");
      } else {
        setLoadError("Não foi possível carregar os livros da estante.");
      }
      return [];
    }
  };

  // Initial data load
  useEffect(() => {
    async function loadBookcaseData() {
      setLoadError("");
      const accessToken = getAccessToken();
      if (!accessToken) {
        setShelves([]);
        setCollections([]);
        setShelfBooks([]);
        setSelectedCollectionId(null);
        setSelectedShelfId(null);
        setSelectedShelfDescription("");
        return;
      }
      try {
        const [shelfSummaries, collectionSummaries] = await Promise.all([listShelves(), listCollections()]);
        setShelves(shelfSummaries);
        setCollections(collectionSummaries);
        setSelectedCollectionId(null);
        setSelectedShelfId(null);
        setSelectedShelfName("");
        setSelectedShelfDescription("");
        setShelfBooks([]);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setLoadError("Faça login para carregar sua estante.");
        } else {
          setLoadError("Não foi possível carregar os dados da estante.");
        }
      }
    }
    void loadBookcaseData();
  }, []);

  // Navigation handlers
  const handleEnterShelf = (shelf: BackendShelfSummaryResponse) => {
    void enterShelf(shelf);
  };

  const handleBackToShelves = () => {
    if (selectedShelfId === null) {
      setSelectedCollectionId(null);
      collectionForm.resetStats();
      setSearchTerm("");
      return;
    }
    setSelectedShelfId(null);
    setSelectedShelfName("");
    setSelectedShelfDescription("");
    setShelfBooks([]);
    setStatusFilter("todos");
    setSearchTerm("");
    addBook.resetPanel();
    shelfBookDetails.resetPanel();
  };

  const handleChangeRootViewMode = (mode: RootViewMode) => {
    setRootViewMode(mode);
    setSelectedCollectionId(null);
    setSearchTerm("");
  };

  // Derived state
  const isInsideCollection = selectedCollectionId !== null;
  const isInsideShelf = selectedShelfId !== null;

  const selectedCollection =
    selectedCollectionId === null ? null : (collections.find((c) => c.id === selectedCollectionId) ?? null);
  const selectedCollectionName = selectedCollection?.name ?? "";
  const selectedCollectionShelves: BackendShelfSummaryResponse[] = selectedCollection
    ? selectedCollection.shelfPreviews.map((p) => ({
        id: p.id,
        name: p.name,
        itemCount: p.itemCount,
        coverPreview: p.firstBookCoverUrl ? [p.firstBookCoverUrl] : [],
      }))
    : [];

  const normalizedTerm = normalizeSearchTerm(searchTerm);
  const filteredShelves = isInsideCollection ? selectedCollectionShelves : shelves;
  const filteredCollections = collections;
  const filteredBooks = filterBooksByStatusAndSearch(shelfBooks, statusFilter, searchTerm) as ShelfBook[];

  let hasNoVisibleItems = false;
  if (isInsideShelf) hasNoVisibleItems = filteredBooks.length === 0;
  else if (isInsideCollection) hasNoVisibleItems = filteredShelves.length === 0;
  else if (rootViewMode === "estantes") hasNoVisibleItems = filteredShelves.length === 0;
  else hasNoVisibleItems = filteredCollections.length === 0;

  const trimmedSearchTerm = searchTerm.trim();
  let emptyStateTitle = "";
  let emptyStateDescription = "";
  if (isInsideShelf) {
    emptyStateTitle = normalizedTerm ? "Nenhum livro encontrado" : "Esta estante ainda não possui livros";
    emptyStateDescription = normalizedTerm
      ? `Nenhum livro corresponde à busca por "${trimmedSearchTerm}".`
      : "Use o botão de adicionar livro para preencher esta estante.";
  } else if (isInsideCollection) {
    emptyStateTitle = "Esta coleção ainda não possui estantes";
    emptyStateDescription = "Use o botão de adicionar estante para organizar esta coleção.";
  } else if (rootViewMode === "estantes") {
    emptyStateTitle = "Você ainda não possui estantes";
    emptyStateDescription = "Crie sua primeira estante para organizar seus livros.";
  } else {
    emptyStateTitle = "Você ainda não possui coleções";
    emptyStateDescription = "Crie sua primeira coleção para agrupar suas estantes.";
  }

  return {
    // Core data
    shelves,
    shelfBooks,
    loadError,
    rootViewMode,
    searchTerm,
    statusFilter,
    selectedShelfId,
    selectedShelfName,
    selectedShelfDescription,
    selectedCollectionName,
    isInsideCollection,
    isInsideShelf,
    filteredBooks,
    filteredShelves,
    filteredCollections,
    hasNoVisibleItems,
    emptyStateTitle,
    emptyStateDescription,
    searchInputAriaLabel: "Pesquisar livros nesta estante",
    searchInputPlaceholder: "Buscar livros nesta estante",
    setSearchTerm,
    setStatusFilter,

    // Navigation
    handleEnterShelf,
    handleBackToShelves,
    handleChangeRootViewMode,

    // Shelf form
    ...shelfForm,

    // Collection form
    ...collectionForm,

    // Add book
    ...addBook,
    handleAddBookClick: () => addBook.handleAddBookClick(isInsideShelf),

    // Shelf book details + progress + review
    ...shelfBookDetails,
  };
}
