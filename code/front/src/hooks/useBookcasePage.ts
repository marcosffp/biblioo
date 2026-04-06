import { useEffect, useState } from "react";
import {
  computeBookSuggestions,
  filterBooksByStatusAndSearch,
  normalizeSearchTerm,
  type ReadingStatus,
  type RuleBook,
} from "@/utils/bookcase-filters";
import {
  addBookToShelf,
  addShelfToCollection,
  BookcaseApiError,
  changeShelfItemStatus,
  createCollection,
  createShelf,
  getAccessToken,
  getBookById,
  getShelfItemById,
  listCollections,
  listShelfItems,
  listShelves,
  searchBooks,
  updateShelfItemProgress,
  type BackendBookResponse,
  type BackendCollectionResponse,
  type BackendCollectionSummaryResponse,
  type BackendShelfSummaryResponse,
} from "@/services";

export const readingStatusOptions: Array<{ value: ReadingStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "lendo", label: "Lendo" },
  { value: "quero-ler", label: "Quero Ler" },
  { value: "lido", label: "Lido" },
  { value: "relendo", label: "Relendo" },
  { value: "abandonei", label: "Abandonei" },
];

export interface ShelfBook extends RuleBook {
  shelfItemId?: number;
  id: string;
  title: string;
  author: string;
  rating?: number;
  progress?: number;
  readingStatus: Exclude<ReadingStatus, "todos">;
  coverUrl?: string;
  synopsis?: string;
  currentPage?: number;
  totalPages?: number;
}

export type RootViewMode = "estantes" | "colecoes";

function mapBackendReadingStatus(status: string): Exclude<ReadingStatus, "todos"> {
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

function pickAuthor(authors: string[] | undefined): string {
  if (!authors || authors.length === 0) {
    return "Autor desconhecido";
  }

  return authors.join(", ");
}

function toCollectionSummary(
  collection: BackendCollectionSummaryResponse | BackendCollectionResponse,
): BackendCollectionSummaryResponse {
  return {
    id: collection.id,
    name: collection.name,
    shelfCount: collection.shelfCount,
    shelfPreviews: collection.shelfPreviews ?? [],
  };
}

function addSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.includes(nextId) ? currentIds : [...currentIds, nextId];
}

function removeSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.filter((id) => id !== nextId);
}

export function useBookcasePage() {
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>("estantes");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isCreateShelfModalOpen, setIsCreateShelfModalOpen] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [isManageCollectionShelvesModalOpen, setIsManageCollectionShelvesModalOpen] = useState(false);
  const [addBookSearchTerm, setAddBookSearchTerm] = useState("");
  const [addBookSuggestions, setAddBookSuggestions] = useState<BackendBookResponse[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCollectionShelfIds, setNewCollectionShelfIds] = useState<number[]>([]);
  const [createCollectionError, setCreateCollectionError] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [collectionToManage, setCollectionToManage] = useState<BackendCollectionSummaryResponse | null>(null);
  const [manageCollectionShelfIds, setManageCollectionShelfIds] = useState<number[]>([]);
  const [manageCollectionError, setManageCollectionError] = useState("");
  const [isSavingCollectionShelves, setIsSavingCollectionShelves] = useState(false);
  const [selectedSuggestionBook, setSelectedSuggestionBook] = useState<ShelfBook | null>(null);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [shelves, setShelves] = useState<BackendShelfSummaryResponse[]>([]);
  const [collections, setCollections] = useState<BackendCollectionSummaryResponse[]>([]);
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [selectedShelfName, setSelectedShelfName] = useState("");
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [addToShelfError, setAddToShelfError] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [createShelfError, setCreateShelfError] = useState("");
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressBook, setProgressBook] = useState<ShelfBook | null>(null);
  const [progressDraft, setProgressDraft] = useState("");
  const [progressError, setProgressError] = useState("");
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const isInsideShelf = selectedShelfId !== null;
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  const filteredShelves = shelves.filter((shelf) => normalizeSearchTerm(shelf.name).includes(normalizedTerm));
  const filteredCollections = collections.filter((collection) =>
    normalizeSearchTerm(collection.name).includes(normalizedTerm),
  );
  const availableShelvesForManagedCollection = collectionToManage
    ? shelves.filter((shelf) => !collectionToManage.shelfPreviews.some((previewShelf) => previewShelf.id === shelf.id))
    : [];

  const filteredBooks = filterBooksByStatusAndSearch(shelfBooks, statusFilter, searchTerm) as ShelfBook[];

  let hasNoVisibleItems = false;
  if (isInsideShelf) {
    hasNoVisibleItems = filteredBooks.length === 0;
  } else if (rootViewMode === "estantes") {
    hasNoVisibleItems = filteredShelves.length === 0;
  } else {
    hasNoVisibleItems = filteredCollections.length === 0;
  }

  let emptyStateTitle = "";
  let emptyStateDescription = "";
  const trimmedSearchTerm = searchTerm.trim();

  if (isInsideShelf) {
    emptyStateTitle = normalizedTerm ? "Nenhum livro encontrado" : "Esta estante ainda nao possui livros";
    emptyStateDescription = normalizedTerm
      ? `Nenhum livro corresponde a busca por "${trimmedSearchTerm}".`
      : "Use o botao de adicionar livro para preencher esta estante.";
  } else if (rootViewMode === "estantes") {
    emptyStateTitle = normalizedTerm ? "Nenhuma estante encontrada" : "Voce ainda nao possui estantes";
    emptyStateDescription = normalizedTerm
      ? `Nenhuma estante corresponde a busca por "${trimmedSearchTerm}".`
      : "Crie sua primeira estante para organizar seus livros.";
  } else {
    emptyStateTitle = normalizedTerm ? "Nenhuma colecao encontrada" : "Voce ainda nao possui colecoes";
    emptyStateDescription = normalizedTerm
      ? `Nenhuma colecao corresponde a busca por "${trimmedSearchTerm}".`
      : "Crie sua primeira colecao para agrupar suas estantes.";
  }

  const normalizedAddBookTerm = normalizeSearchTerm(addBookSearchTerm);
  const searchInputAriaLabel = isInsideShelf
    ? "Pesquisar livros nesta estante"
    : rootViewMode === "estantes"
      ? "Pesquisar estantes"
      : "Pesquisar colecoes";
  const searchInputPlaceholder = isInsideShelf
    ? "Buscar livros nesta estante"
    : rootViewMode === "estantes"
      ? "Buscar estantes"
      : "Buscar colecoes";

  const computedSuggestions = computeBookSuggestions(
    addBookSuggestions.map((suggestion) => ({
      id: suggestion.id.toString(),
      title: suggestion.title,
      author: pickAuthor(suggestion.authors),
      readingStatus: "quero-ler",
    })),
    addBookSearchTerm,
  );

  const visibleAddBookSuggestions = computedSuggestions.map((suggestion) => {
    const source = addBookSuggestions.find((item) => item.id.toString() === suggestion.id);
    return {
      id: suggestion.id,
      title: suggestion.title,
      author: pickAuthor(source?.authors),
    };
  });

  const loadShelfBooks = async (shelfId: number) => {
    const items = await listShelfItems(shelfId);
    const mappedItems = await Promise.all(
      items.map(async (item) => {
        const [book, detailedItem] = await Promise.all([getBookById(item.bookId), getShelfItemById(shelfId, item.id)]);

        return {
          shelfItemId: item.id,
          id: item.bookId.toString(),
          title: item.bookTitle,
          author: pickAuthor(book.authors),
          readingStatus: mapBackendReadingStatus(item.status),
          coverUrl: item.bookCoverUrl ?? book.coverUrl ?? undefined,
          synopsis: undefined,
          rating: book.averageRating ?? undefined,
          progress: item.progressPercent ?? undefined,
          currentPage: detailedItem.currentPage ?? undefined,
          totalPages: detailedItem.totalPages ?? book.pageCount ?? undefined,
        } as ShelfBook;
      }),
    );

    setShelfBooks(mappedItems);
  };

  useEffect(() => {
    async function loadBookcaseData() {
      setLoadError("");

      const accessToken = getAccessToken();
      if (!accessToken) {
        setShelves([]);
        setCollections([]);
        setShelfBooks([]);
        setSelectedShelfId(null);
        return;
      }

      try {
        const [shelfSummaries, collectionSummaries] = await Promise.all([listShelves(), listCollections()]);
        setShelves(shelfSummaries);
        setCollections(collectionSummaries);
        setSelectedShelfId(null);
        setSelectedShelfName("");
        setShelfBooks([]);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setLoadError("Faca login para carregar sua estante.");
        } else {
          setLoadError("Nao foi possivel carregar os dados da estante.");
        }
      }
    }

    void loadBookcaseData();
  }, []);

  useEffect(() => {
    async function loadAddBookSuggestions() {
      if (!isAddBookModalOpen || normalizedAddBookTerm.length < 2) {
        setAddBookSuggestions([]);
        return;
      }

      try {
        const searchResult = await searchBooks(addBookSearchTerm);
        setAddBookSuggestions(searchResult.slice(0, 8));
      } catch {
        setAddBookSuggestions([]);
      }
    }

    void loadAddBookSuggestions();
  }, [addBookSearchTerm, isAddBookModalOpen, normalizedAddBookTerm.length]);

  const handleSuggestionSelect = (suggestion: { id: string; title: string; author: string }) => {
    async function loadBookDetails() {
      const bookId = Number(suggestion.id);
      if (Number.isNaN(bookId)) {
        return;
      }

      try {
        const book = await getBookById(bookId);
        const nextSelectedBook: ShelfBook = {
          id: book.id.toString(),
          title: book.title,
          author: pickAuthor(book.authors),
          readingStatus: "quero-ler",
          coverUrl: book.coverUrl ?? undefined,
          synopsis: undefined,
          rating: book.averageRating ?? undefined,
          totalPages: book.pageCount ?? undefined,
        };

        setSelectedSuggestionBook(nextSelectedBook);
        setAddBookSearchTerm(book.title);
        setIsBookDetailsOpen(true);
        setIsAddBookModalOpen(false);
      } catch {
        setIsBookDetailsOpen(false);
      }
    }

    void loadBookDetails();
  };

  const handleCloseBookDetails = () => {
    setIsBookDetailsOpen(false);
    setAddToShelfError("");
  };

  const handleChangeRootViewMode = (mode: RootViewMode) => {
    setRootViewMode(mode);
    setSearchTerm("");
  };

  const handleCloseAddBookModal = () => {
    setIsAddBookModalOpen(false);
    setAddBookSearchTerm("");
    setAddBookSuggestions([]);
  };

  const handleOpenCreateCollectionModal = () => {
    setIsCreateCollectionModalOpen(true);
    setCreateCollectionError("");
  };

  const handleCloseCreateCollectionModal = () => {
    setIsCreateCollectionModalOpen(false);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setNewCollectionShelfIds([]);
    setCreateCollectionError("");
  };

  const handleCreateCollection = () => {
    const normalizedName = newCollectionName.trim();
    const normalizedDescription = newCollectionDescription.trim();

    if (!normalizedName) {
      setCreateCollectionError("Informe um nome para a colecao.");
      return;
    }

    if (normalizedName.length > 100) {
      setCreateCollectionError("O nome da colecao deve ter no maximo 100 caracteres.");
      return;
    }

    if (normalizedDescription.length > 500) {
      setCreateCollectionError("A descricao da colecao deve ter no maximo 500 caracteres.");
      return;
    }

    async function createCollectionAction() {
      setIsCreatingCollection(true);
      setCreateCollectionError("");

      try {
        const createdCollection = await createCollection(normalizedName, normalizedDescription, newCollectionShelfIds);
        setCollections((currentCollections) => [...currentCollections, toCollectionSummary(createdCollection)]);
        setRootViewMode("colecoes");
        setSearchTerm("");
        handleCloseCreateCollectionModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setCreateCollectionError("Faca login para criar colecoes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCreateCollectionError(error.message);
        } else {
          setCreateCollectionError("Nao foi possivel criar a colecao. Tente novamente.");
        }
      } finally {
        setIsCreatingCollection(false);
      }
    }

    void createCollectionAction();
  };

  const handleOpenManageCollectionShelvesModal = (collection: BackendCollectionSummaryResponse) => {
    setCollectionToManage(collection);
    setManageCollectionShelfIds([]);
    setManageCollectionError("");
    setIsManageCollectionShelvesModalOpen(true);
  };

  const handleCloseManageCollectionShelvesModal = () => {
    setCollectionToManage(null);
    setManageCollectionShelfIds([]);
    setManageCollectionError("");
    setIsManageCollectionShelvesModalOpen(false);
  };

  const handleSaveCollectionShelves = () => {
    if (!collectionToManage) {
      return;
    }
    const activeCollectionId = collectionToManage.id;

    if (manageCollectionShelfIds.length === 0) {
      setManageCollectionError("Selecione pelo menos uma estante para adicionar.");
      return;
    }

    async function saveCollectionShelvesAction() {
      setIsSavingCollectionShelves(true);
      setManageCollectionError("");

      try {
        let updatedCollection: BackendCollectionResponse | null = null;
        for (const shelfId of manageCollectionShelfIds) {
          updatedCollection = await addShelfToCollection(activeCollectionId, shelfId);
        }

        if (updatedCollection) {
          const nextSummary = toCollectionSummary(updatedCollection);
          setCollections((currentCollections) =>
            currentCollections.map((collection) => (collection.id === nextSummary.id ? nextSummary : collection)),
          );
        }

        handleCloseManageCollectionShelvesModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setManageCollectionError("Faca login para editar colecoes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setManageCollectionError(error.message);
        } else {
          setManageCollectionError("Nao foi possivel adicionar estantes na colecao.");
        }
      } finally {
        setIsSavingCollectionShelves(false);
      }
    }

    void saveCollectionShelvesAction();
  };

  const handleEnterShelf = (shelf: BackendShelfSummaryResponse) => {
    async function loadSelectedShelf() {
      setLoadError("");
      setSelectedShelfId(shelf.id);
      setSelectedShelfName(shelf.name);
      setStatusFilter("todos");
      setSearchTerm("");

      try {
        await loadShelfBooks(shelf.id);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setLoadError("Faca login para abrir esta estante.");
        } else {
          setLoadError("Nao foi possivel carregar os livros da estante.");
        }
      }
    }

    void loadSelectedShelf();
  };

  const handleBackToShelves = () => {
    setSelectedShelfId(null);
    setSelectedShelfName("");
    setShelfBooks([]);
    setStatusFilter("todos");
    setSearchTerm("");
    setIsBookDetailsOpen(false);
    setAddToShelfError("");
  };

  const handleOpenProgressModal = (book: ShelfBook) => {
    setProgressBook(book);
    setProgressDraft(`${book.currentPage ?? 0}`);
    setProgressError("");
    setIsProgressModalOpen(true);
  };

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    setProgressBook(null);
    setProgressDraft("");
    setProgressError("");
  };

  const handleSaveProgress = () => {
    if (!progressBook || selectedShelfId === null || typeof progressBook.shelfItemId !== "number") {
      setProgressError("Nao foi possivel identificar o item da estante.");
      return;
    }

    const activeProgressBook = progressBook;
    const activeShelfId: number = selectedShelfId;
    const activeItemId: number = Number(activeProgressBook.shelfItemId);

    const normalizedDraft = progressDraft.trim();
    const parsedPage = Number(normalizedDraft);

    if (!normalizedDraft || Number.isNaN(parsedPage) || !Number.isInteger(parsedPage)) {
      setProgressError("Informe um numero inteiro de pagina.");
      return;
    }

    if (parsedPage < 0) {
      setProgressError("A pagina atual nao pode ser negativa.");
      return;
    }

    if (typeof activeProgressBook.totalPages === "number" && parsedPage > activeProgressBook.totalPages) {
      setProgressError(`A pagina nao pode ser maior que ${activeProgressBook.totalPages}.`);
      return;
    }

    async function saveProgressAction() {
      setIsSavingProgress(true);
      setProgressError("");

      try {
        const requiresReadingStatus =
          activeProgressBook.readingStatus !== "lendo" && activeProgressBook.readingStatus !== "relendo";

        if (requiresReadingStatus) {
          await changeShelfItemStatus(activeShelfId, activeItemId, "READING");
        }

        const updatedItem = await updateShelfItemProgress(activeShelfId, activeItemId, parsedPage);

        setShelfBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.shelfItemId === updatedItem.id
              ? {
                  ...book,
                  readingStatus: mapBackendReadingStatus(updatedItem.status),
                  progress: updatedItem.progressPercent ?? undefined,
                  currentPage: updatedItem.currentPage ?? undefined,
                  totalPages: updatedItem.totalPages ?? book.totalPages,
                }
              : book,
          ),
        );

        handleCloseProgressModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setProgressError("Faca login para atualizar progresso.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setProgressError(error.message);
        } else {
          setProgressError("Nao foi possivel atualizar o progresso. Tente novamente.");
        }
      } finally {
        setIsSavingProgress(false);
      }
    }

    void saveProgressAction();
  };

  const handleOpenCreateShelfModal = () => {
    setIsCreateShelfModalOpen(true);
    setCreateShelfError("");

    requestAnimationFrame(() => {
      const nameInput = document.getElementById("bookcase-create-shelf-name") as HTMLInputElement | null;
      nameInput?.focus();
    });
  };

  const handleCloseCreateShelfModal = () => {
    setIsCreateShelfModalOpen(false);
    setCreateShelfError("");
    setNewShelfName("");
    setNewShelfDescription("");
  };

  const handleCreateShelf = () => {
    const normalizedName = newShelfName.trim();
    const normalizedDescription = newShelfDescription.trim();

    if (!normalizedName) {
      setCreateShelfError("Informe um nome para a estante.");
      return;
    }

    if (normalizedName.length > 100) {
      setCreateShelfError("O nome da estante deve ter no maximo 100 caracteres.");
      return;
    }

    if (normalizedDescription.length > 300) {
      setCreateShelfError("A descricao deve ter no maximo 300 caracteres.");
      return;
    }

    async function createShelfAction() {
      setIsCreatingShelf(true);
      setCreateShelfError("");

      try {
        const createdShelf = await createShelf(normalizedName, normalizedDescription);
        setShelves((currentShelves) => [
          ...currentShelves,
          {
            id: createdShelf.id,
            name: createdShelf.name,
            itemCount: createdShelf.itemCount,
            coverPreview: createdShelf.coverPreview,
          },
        ]);
        setSelectedShelfId(createdShelf.id);
        setSelectedShelfName(createdShelf.name);
        setShelfBooks([]);
        setStatusFilter("todos");
        setSearchTerm("");
        handleCloseCreateShelfModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setCreateShelfError("Faca login para criar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCreateShelfError(error.message);
        } else {
          setCreateShelfError("Nao foi possivel criar a estante. Verifique os campos e tente novamente.");
        }
      } finally {
        setIsCreatingShelf(false);
      }
    }

    void createShelfAction();
  };

  const isSelectedBookAlreadyInShelf = selectedSuggestionBook
    ? shelfBooks.some((book) => book.id === selectedSuggestionBook.id)
    : false;

  const handleAddSelectedBookToShelf = () => {
    const selectedBook = selectedSuggestionBook;
    if (!selectedBook) {
      return;
    }
    const selectedBookId = Number(selectedBook.id);

    async function addSelectedBook() {
      setIsAddingToShelf(true);
      setAddToShelfError("");

      try {
        if (selectedShelfId === null) {
          setAddToShelfError("Selecione uma estante para adicionar livros.");
          return;
        }

        const createdItem = await addBookToShelf(selectedShelfId, selectedBookId);
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

        setShelfBooks((currentShelfBooks) => {
          if (currentShelfBooks.some((book) => book.id === createdShelfBook.id)) {
            return currentShelfBooks;
          }

          return [...currentShelfBooks, createdShelfBook];
        });

        setShelves((currentShelves) =>
          currentShelves.map((shelf) =>
            shelf.id === selectedShelfId ? { ...shelf, itemCount: shelf.itemCount + 1 } : shelf,
          ),
        );

        setIsBookDetailsOpen(false);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setAddToShelfError("Faca login para adicionar livros na estante.");
        } else {
          setAddToShelfError("Nao foi possivel adicionar o livro. Tente novamente.");
        }
      } finally {
        setIsAddingToShelf(false);
      }
    }

    void addSelectedBook();
  };

  const handleAddBookClick = () => {
    if (!isInsideShelf) {
      return;
    }

    setIsAddBookModalOpen(true);
    setIsBookDetailsOpen(false);

    requestAnimationFrame(() => {
      const searchInput = document.getElementById("bookcase-add-search-input") as HTMLInputElement | null;
      searchInput?.focus();
    });
  };

  return {
    addBookSearchTerm,
    addToShelfError,
    availableShelvesForManagedCollection,
    createCollectionError,
    createShelfError,
    emptyStateDescription,
    emptyStateTitle,
    filteredBooks,
    filteredCollections,
    filteredShelves,
    hasNoVisibleItems,
    isAddBookModalOpen,
    isAddingToShelf,
    isBookDetailsOpen,
    isCreateCollectionModalOpen,
    isCreateShelfModalOpen,
    isCreatingCollection,
    isCreatingShelf,
    isInsideShelf,
    isManageCollectionShelvesModalOpen,
    isProgressModalOpen,
    isSavingCollectionShelves,
    isSavingProgress,
    isSelectedBookAlreadyInShelf,
    loadError,
    manageCollectionError,
    manageCollectionShelfIds,
    newCollectionDescription,
    newCollectionName,
    newCollectionShelfIds,
    newShelfDescription,
    newShelfName,
    progressBook,
    progressDraft,
    progressError,
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    searchTerm,
    selectedShelfName,
    selectedSuggestionBook,
    shelves,
    statusFilter,
    visibleAddBookSuggestions,
    collectionToManage,
    handleAddBookClick,
    handleAddSelectedBookToShelf,
    handleBackToShelves,
    handleChangeRootViewMode,
    handleCloseAddBookModal,
    handleCloseBookDetails,
    handleCloseCreateCollectionModal,
    handleCloseCreateShelfModal,
    handleCloseManageCollectionShelvesModal,
    handleCloseProgressModal,
    handleCreateCollection,
    handleCreateShelf,
    handleEnterShelf,
    handleOpenCreateCollectionModal,
    handleOpenCreateShelfModal,
    handleOpenManageCollectionShelvesModal,
    handleOpenProgressModal,
    handleSaveCollectionShelves,
    handleSaveProgress,
    handleSuggestionSelect,
    setAddBookSearchTerm,
    setManageCollectionShelfIds,
    setNewCollectionDescription,
    setNewCollectionName,
    setNewCollectionShelfIds: (updater: (currentIds: number[]) => number[]) => {
      setNewCollectionShelfIds((currentIds) => updater(currentIds));
    },
    setNewShelfDescription,
    setNewShelfName,
    setProgressDraft,
    setSearchTerm,
    setStatusFilter,
    toggleCollectionShelfSelection: (shelfId: number, checked: boolean) => {
      setNewCollectionShelfIds((currentIds) =>
        checked ? addSelectedId(currentIds, shelfId) : removeSelectedId(currentIds, shelfId),
      );
    },
    toggleManageShelfSelection: (shelfId: number, checked: boolean) => {
      setManageCollectionShelfIds((currentIds) =>
        checked ? addSelectedId(currentIds, shelfId) : removeSelectedId(currentIds, shelfId),
      );
    },
  };
}
