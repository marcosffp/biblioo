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
  createBookReview,
  type BackendReadingStatus,
  type BackendReviewResponse,
  BookcaseApiError,
  changeShelfItemStatus,
  createCollection,
  createShelf,
  deleteShelf,
  getAccessToken,
  getBookById,
  getShelfById,
  getShelfItemById,
  listCollections,
  listShelfItems,
  listShelves,
  removeBookFromShelf,
  searchBooks,
  updateBookReview,
  updateShelf,
  updateShelfItemProgress,
  type BackendBookResponse,
  type BackendCollectionResponse,
  type BackendCollectionSummaryResponse,
  type BackendShelfResponse,
  type BackendShelfSummaryResponse,
} from "@/services";

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

function mapFrontendReadingStatus(status: Exclude<ReadingStatus, "todos">): BackendReadingStatus {
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

function toShelfSummary(shelf: BackendShelfResponse): BackendShelfSummaryResponse {
  return {
    id: shelf.id,
    name: shelf.name,
    itemCount: shelf.itemCount,
    coverPreview: shelf.coverPreview,
  };
}

function removeShelfFromCollectionPreview(
  collection: BackendCollectionSummaryResponse,
  shelfId: number,
): BackendCollectionSummaryResponse {
  const nextShelfPreviews = collection.shelfPreviews.filter((shelfPreview) => shelfPreview.id !== shelfId);
  return {
    ...collection,
    shelfCount: Math.max(0, collection.shelfCount - (collection.shelfPreviews.length - nextShelfPreviews.length)),
    shelfPreviews: nextShelfPreviews,
  };
}

function addSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.includes(nextId) ? currentIds : [...currentIds, nextId];
}

function removeSelectedId(currentIds: number[], nextId: number): number[] {
  return currentIds.filter((id) => id !== nextId);
}

function mapReviewText(review: BackendReviewResponse | null): string {
  if (!review?.text) {
    return "";
  }

  return review.text;
}

export function useBookcasePage() {
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>("estantes");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isCreateShelfModalOpen, setIsCreateShelfModalOpen] = useState(false);
  const [isEditShelfModalOpen, setIsEditShelfModalOpen] = useState(false);
  const [isDeleteShelfModalOpen, setIsDeleteShelfModalOpen] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [isManageCollectionShelvesModalOpen, setIsManageCollectionShelvesModalOpen] = useState(false);
  const [addBookSearchTerm, setAddBookSearchTerm] = useState("");
  const [addBookSuggestions, setAddBookSuggestions] = useState<BackendBookResponse[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [editShelfName, setEditShelfName] = useState("");
  const [editShelfDescription, setEditShelfDescription] = useState("");
  const [shelfToEdit, setShelfToEdit] = useState<BackendShelfSummaryResponse | null>(null);
  const [shelfToDelete, setShelfToDelete] = useState<BackendShelfSummaryResponse | null>(null);
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
  const [selectedShelfDescription, setSelectedShelfDescription] = useState("");
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [addToShelfError, setAddToShelfError] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [createShelfError, setCreateShelfError] = useState("");
  const [editShelfError, setEditShelfError] = useState("");
  const [deleteShelfError, setDeleteShelfError] = useState("");
  const [isSavingShelfEdit, setIsSavingShelfEdit] = useState(false);
  const [isDeletingShelf, setIsDeletingShelf] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressBook, setProgressBook] = useState<ShelfBook | null>(null);
  const [progressDraft, setProgressDraft] = useState("");
  const [progressError, setProgressError] = useState("");
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isShelfBookDetailsOpen, setIsShelfBookDetailsOpen] = useState(false);
  const [selectedShelfBook, setSelectedShelfBook] = useState<ShelfBook | null>(null);
  const [bookDetailsError, setBookDetailsError] = useState("");
  const [isSavingShelfBookDetails, setIsSavingShelfBookDetails] = useState(false);
  const [isRemovingBookFromShelf, setIsRemovingBookFromShelf] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [reviewRatingDraft, setReviewRatingDraft] = useState(0);
  const [reviewCommentDraft, setReviewCommentDraft] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  const isInsideShelf = selectedShelfId !== null;
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  const filteredShelves = shelves;
  const filteredCollections = collections;
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
    emptyStateTitle = normalizedTerm ? "Nenhum livro encontrado" : "Esta estante ainda não possui livros";
    emptyStateDescription = normalizedTerm
      ? `Nenhum livro corresponde à busca por "${trimmedSearchTerm}".`
      : "Use o botão de adicionar livro para preencher esta estante.";
  } else if (rootViewMode === "estantes") {
    emptyStateTitle = "Você ainda não possui estantes";
    emptyStateDescription = "Crie sua primeira estante para organizar seus livros.";
  } else {
    emptyStateTitle = "Você ainda não possui coleções";
    emptyStateDescription = "Crie sua primeira coleção para agrupar suas estantes.";
  }

  const normalizedAddBookTerm = normalizeSearchTerm(addBookSearchTerm);
  const searchInputAriaLabel = "Pesquisar livros nesta estante";
  const searchInputPlaceholder = "Buscar livros nesta estante";

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
      coverUrl: source?.coverUrl ?? undefined,
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
        setSelectedShelfDescription("");
        return;
      }

      try {
        const [shelfSummaries, collectionSummaries] = await Promise.all([listShelves(), listCollections()]);
        setShelves(shelfSummaries);
        setCollections(collectionSummaries);
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

  const handleSuggestionSelect = (suggestion: { id: string; title: string; author: string; coverUrl?: string }) => {
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
      setCreateCollectionError("Informe um nome para a coleção.");
      return;
    }

    if (normalizedName.length > 100) {
      setCreateCollectionError("O nome da coleção deve ter no máximo 100 caracteres.");
      return;
    }

    if (normalizedDescription.length > 500) {
      setCreateCollectionError("A descrição da coleção deve ter no máximo 500 caracteres.");
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
          setCreateCollectionError("Faça login para criar coleções.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setCreateCollectionError(error.message);
        } else {
          setCreateCollectionError("Não foi possível criar a coleção. Tente novamente.");
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
          setManageCollectionError("Faça login para editar coleções.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setManageCollectionError(error.message);
        } else {
          setManageCollectionError("Não foi possível adicionar estantes na coleção.");
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
      setSelectedShelfDescription("");
      setStatusFilter("todos");
      setSearchTerm("");

      try {
        const [shelfDetails] = await Promise.all([getShelfById(shelf.id), loadShelfBooks(shelf.id)]);
        setSelectedShelfDescription(shelfDetails.description?.trim() ?? "");
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setLoadError("Faça login para abrir esta estante.");
        } else {
          setLoadError("Não foi possível carregar os livros da estante.");
        }
      }
    }

    void loadSelectedShelf();
  };

  const handleBackToShelves = () => {
    setSelectedShelfId(null);
    setSelectedShelfName("");
    setSelectedShelfDescription("");
    setShelfBooks([]);
    setStatusFilter("todos");
    setSearchTerm("");
    setIsBookDetailsOpen(false);
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
    setBookDetailsError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewError("");
    setAddToShelfError("");
  };

  const handleOpenShelfBookDetails = (book: ShelfBook) => {
    setSelectedShelfBook(book);
    setBookDetailsError("");
    setReviewError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setIsShelfBookDetailsOpen(true);
  };

  const handleCloseShelfBookDetails = () => {
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
    setBookDetailsError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewError("");
  };

  const handleRemoveSelectedShelfBook = () => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Nao foi possivel identificar o item da estante.");
      return;
    }

    const activeShelfId = selectedShelfId;
    const activeItemId = Number(selectedShelfBook.shelfItemId);

    async function removeSelectedShelfBookAction() {
      setIsRemovingBookFromShelf(true);
      setBookDetailsError("");

      try {
        await removeBookFromShelf(activeShelfId, activeItemId);

        setShelfBooks((currentBooks) => {
          const nextBooks = currentBooks.filter((book) => book.shelfItemId !== activeItemId);

          setShelves((currentShelves) =>
            currentShelves.map((shelf) =>
              shelf.id === activeShelfId
                ? {
                    ...shelf,
                    itemCount: Math.max(0, shelf.itemCount - 1),
                    coverPreview: nextBooks
                      .map((book) => book.coverUrl)
                      .filter((coverUrl): coverUrl is string => typeof coverUrl === "string" && coverUrl.length > 0)
                      .slice(0, 4),
                  }
                : shelf,
            ),
          );

          return nextBooks;
        });

        handleCloseShelfBookDetails();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faca login para remover livros da estante.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Nao foi possivel remover o livro da estante.");
        }
      } finally {
        setIsRemovingBookFromShelf(false);
      }
    }

    void removeSelectedShelfBookAction();
  };

  const handleSelectShelfBookStatus = (nextStatus: Exclude<ReadingStatus, "todos">) => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Nao foi possivel identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(activeBook.shelfItemId);

    async function updateShelfBookStatusAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");

      try {
        const updatedItem = await changeShelfItemStatus(activeShelfId, activeItemId, mapFrontendReadingStatus(nextStatus));

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

        setSelectedShelfBook((currentBook) => {
          if (!currentBook || currentBook.shelfItemId !== updatedItem.id) {
            return currentBook;
          }

          return {
            ...currentBook,
            readingStatus: mapBackendReadingStatus(updatedItem.status),
            progress: updatedItem.progressPercent ?? undefined,
            currentPage: updatedItem.currentPage ?? undefined,
            totalPages: updatedItem.totalPages ?? currentBook.totalPages,
          };
        });
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faca login para atualizar o status do livro.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Nao foi possivel atualizar o status do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }

    void updateShelfBookStatusAction();
  };

  const handleStepShelfBookPage = (delta: number) => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Nao foi possivel identificar o item da estante.");
      return;
    }

    const activeBook = selectedShelfBook;
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(activeBook.shelfItemId);
    const currentPage = activeBook.currentPage ?? 0;
    const totalPages = activeBook.totalPages;
    const nextPage = currentPage + delta;

    if (nextPage < 0) {
      return;
    }

    if (typeof totalPages === "number" && nextPage > totalPages) {
      return;
    }

    async function updateShelfBookProgressAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");

      try {
        const requiresReadingStatus = activeBook.readingStatus !== "lendo" && activeBook.readingStatus !== "relendo";

        if (requiresReadingStatus) {
          await changeShelfItemStatus(activeShelfId, activeItemId, "READING");
        }

        const updatedItem = await updateShelfItemProgress(activeShelfId, activeItemId, nextPage);

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

        setSelectedShelfBook((currentBook) => {
          if (!currentBook || currentBook.shelfItemId !== updatedItem.id) {
            return currentBook;
          }

          return {
            ...currentBook,
            readingStatus: mapBackendReadingStatus(updatedItem.status),
            progress: updatedItem.progressPercent ?? undefined,
            currentPage: updatedItem.currentPage ?? undefined,
            totalPages: updatedItem.totalPages ?? currentBook.totalPages,
          };
        });
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faca login para atualizar o progresso.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Nao foi possivel atualizar o progresso do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }

    void updateShelfBookProgressAction();
  };

  const handleSetReviewRating = (value: number) => {
    setReviewError("");
    setReviewRatingDraft(value);
  };

  const handleSetReviewComment = (value: string) => {
    setReviewError("");
    setReviewCommentDraft(value);
  };

  const handleSaveBookReview = () => {
    if (!selectedShelfBook) {
      setReviewError("Nao foi possivel identificar o livro para avaliar.");
      return;
    }

    const bookId = Number(selectedShelfBook.id);
    if (Number.isNaN(bookId)) {
      setReviewError("Nao foi possivel identificar o livro para avaliar.");
      return;
    }

    if (!Number.isInteger(reviewRatingDraft) || reviewRatingDraft < 1 || reviewRatingDraft > 5) {
      setReviewError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    const normalizedComment = reviewCommentDraft.trim();
    if (normalizedComment.length > 2000) {
      setReviewError("O comentario deve ter no maximo 2000 caracteres.");
      return;
    }

    if (activeReviewId && normalizedComment.length === 0) {
      setReviewError("Para editar a avaliacao com as rotas atuais, informe um comentario.");
      return;
    }

    async function saveBookReviewAction() {
      setIsSavingReview(true);
      setReviewError("");

      try {
        const savedReview = activeReviewId
          ? await updateBookReview(activeReviewId, reviewRatingDraft, normalizedComment)
          : await createBookReview(bookId, reviewRatingDraft, normalizedComment);

        setActiveReviewId(savedReview.id);
        setReviewRatingDraft(savedReview.rating);
        setReviewCommentDraft(mapReviewText(savedReview));
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setReviewError("Faca login para salvar sua avaliacao.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setReviewError(error.message);
        } else {
          setReviewError("Nao foi possivel salvar sua avaliacao. Tente novamente.");
        }
      } finally {
        setIsSavingReview(false);
      }
    }

    void saveBookReviewAction();
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
      setProgressError("Não foi possível identificar o item da estante.");
      return;
    }

    const activeProgressBook = progressBook;
    const activeShelfId: number = selectedShelfId;
    const activeItemId: number = Number(activeProgressBook.shelfItemId);

    const normalizedDraft = progressDraft.trim();
    const parsedPage = Number(normalizedDraft);

    if (!normalizedDraft || Number.isNaN(parsedPage) || !Number.isInteger(parsedPage)) {
      setProgressError("Informe um número inteiro de página.");
      return;
    }

    if (parsedPage < 0) {
      setProgressError("A página atual não pode ser negativa.");
      return;
    }

    if (typeof activeProgressBook.totalPages === "number" && parsedPage > activeProgressBook.totalPages) {
      setProgressError(`A página não pode ser maior que ${activeProgressBook.totalPages}.`);
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
          setProgressError("Faça login para atualizar progresso.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setProgressError(error.message);
        } else {
          setProgressError("Não foi possível atualizar o progresso. Tente novamente.");
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

  const handleOpenEditShelfModal = (shelf: BackendShelfSummaryResponse) => {
    setShelfToEdit(shelf);
    setEditShelfName(shelf.name);
    setEditShelfDescription("");
    setEditShelfError("");
    setIsEditShelfModalOpen(true);

    async function loadShelfDetails() {
      try {
        const shelfDetails = await getShelfById(shelf.id);
        setEditShelfDescription(shelfDetails.description ?? "");
      } catch {
        setEditShelfDescription("");
      }
    }

    void loadShelfDetails();
  };

  const handleCloseEditShelfModal = () => {
    setIsEditShelfModalOpen(false);
    setShelfToEdit(null);
    setEditShelfName("");
    setEditShelfDescription("");
    setEditShelfError("");
  };

  const handleSaveShelfEdit = () => {
    if (!shelfToEdit) {
      return;
    }

    const normalizedName = editShelfName.trim();
    const normalizedDescription = editShelfDescription.trim();
    const activeShelfId = shelfToEdit.id;

    if (!normalizedName) {
      setEditShelfError("Informe um nome para a estante.");
      return;
    }

    if (normalizedName.length > 100) {
      setEditShelfError("O nome da estante deve ter no maximo 100 caracteres.");
      return;
    }

    if (normalizedDescription.length > 300) {
      setEditShelfError("A descricao deve ter no maximo 300 caracteres.");
      return;
    }

    async function saveShelfEditAction() {
      setIsSavingShelfEdit(true);
      setEditShelfError("");

      try {
        const updatedShelf = await updateShelf(activeShelfId, normalizedName, normalizedDescription);
        const nextSummary = toShelfSummary(updatedShelf);

        setShelves((currentShelves) =>
          currentShelves.map((shelf) => (shelf.id === nextSummary.id ? nextSummary : shelf)),
        );

        if (selectedShelfId === nextSummary.id) {
          setSelectedShelfName(nextSummary.name);
          setSelectedShelfDescription(updatedShelf.description?.trim() ?? "");
        }

        handleCloseEditShelfModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setEditShelfError("Faca login para editar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setEditShelfError(error.message);
        } else {
          setEditShelfError("Nao foi possivel editar a estante. Tente novamente.");
        }
      } finally {
        setIsSavingShelfEdit(false);
      }
    }

    void saveShelfEditAction();
  };

  const handleOpenDeleteShelfModal = (shelf: BackendShelfSummaryResponse) => {
    setShelfToDelete(shelf);
    setDeleteShelfError("");
    setIsDeleteShelfModalOpen(true);
  };

  const handleCloseDeleteShelfModal = () => {
    setIsDeleteShelfModalOpen(false);
    setShelfToDelete(null);
    setDeleteShelfError("");
  };

  const handleDeleteShelf = () => {
    if (!shelfToDelete) {
      return;
    }

    const activeShelfId = shelfToDelete.id;

    async function deleteShelfAction() {
      setIsDeletingShelf(true);
      setDeleteShelfError("");

      try {
        await deleteShelf(activeShelfId);

        setShelves((currentShelves) => currentShelves.filter((shelf) => shelf.id !== activeShelfId));
        setCollections((currentCollections) =>
          currentCollections.map((collection) => removeShelfFromCollectionPreview(collection, activeShelfId)),
        );

        if (selectedShelfId === activeShelfId) {
          handleBackToShelves();
        }

        if (shelfToEdit?.id === activeShelfId) {
          handleCloseEditShelfModal();
        }

        handleCloseDeleteShelfModal();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setDeleteShelfError("Faca login para apagar estantes.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setDeleteShelfError(error.message);
        } else {
          setDeleteShelfError("Nao foi possivel apagar a estante. Tente novamente.");
        }
      } finally {
        setIsDeletingShelf(false);
      }
    }

    void deleteShelfAction();
  };

  const handleCreateShelf = () => {
    const normalizedName = newShelfName.trim();
    const normalizedDescription = newShelfDescription.trim();

    if (!normalizedName) {
      setCreateShelfError("Informe um nome para a estante.");
      return;
    }

    if (normalizedName.length > 100) {
      setCreateShelfError("O nome da estante deve ter no máximo 100 caracteres.");
      return;
    }

    if (normalizedDescription.length > 300) {
      setCreateShelfError("A descrição deve ter no máximo 300 caracteres.");
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
            shelf.id === selectedShelfId
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
    activeReviewId,
    availableShelvesForManagedCollection,
    bookDetailsError,
    deleteShelfError,
    editShelfDescription,
    editShelfError,
    editShelfName,
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
    isDeleteShelfModalOpen,
    isDeletingShelf,
    isEditShelfModalOpen,
    isCreatingCollection,
    isCreatingShelf,
    isInsideShelf,
    isManageCollectionShelvesModalOpen,
    isProgressModalOpen,
    isSavingReview,
    isSavingShelfEdit,
    isSavingCollectionShelves,
    isSavingShelfBookDetails,
    isRemovingBookFromShelf,
    isSavingProgress,
    isShelfBookDetailsOpen,
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
    reviewCommentDraft,
    reviewError,
    reviewRatingDraft,
    rootViewMode,
    searchInputAriaLabel,
    searchInputPlaceholder,
    searchTerm,
    selectedShelfId,
    selectedShelfDescription,
    selectedShelfName,
    selectedShelfBook,
    selectedSuggestionBook,
    shelfToDelete,
    shelfToEdit,
    shelfBooks,
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
    handleCloseDeleteShelfModal,
    handleCloseEditShelfModal,
    handleCloseShelfBookDetails,
    handleCloseCreateCollectionModal,
    handleCloseCreateShelfModal,
    handleCloseManageCollectionShelvesModal,
    handleCloseProgressModal,
    handleCreateCollection,
    handleCreateShelf,
    handleDeleteShelf,
    handleEnterShelf,
    handleOpenCreateCollectionModal,
    handleOpenCreateShelfModal,
    handleOpenDeleteShelfModal,
    handleOpenEditShelfModal,
    handleOpenManageCollectionShelvesModal,
    handleOpenShelfBookDetails,
    handleOpenProgressModal,
    handleSelectShelfBookStatus,
    handleSetReviewComment,
    handleSetReviewRating,
    handleSaveBookReview,
    handleSaveCollectionShelves,
    handleSaveShelfEdit,
    handleSaveProgress,
    handleRemoveSelectedShelfBook,
    handleStepShelfBookPage,
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
    setEditShelfDescription,
    setEditShelfName,
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
