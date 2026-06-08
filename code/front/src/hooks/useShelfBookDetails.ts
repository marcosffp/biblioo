import { useState } from "react";
import {
  BookcaseApiError,
  changeShelfItemStatus,
  createBookReview,
  getMyBookReview,
  removeBookFromShelf,
  updateBookReview,
  updateShelfItemProgress,
} from "@/services";
import type { BackendShelfItemResponse, BackendShelfSummaryResponse } from "@/types/api";
import {
  isDuplicateReviewError,
  mapBackendReadingStatus,
  mapFrontendReadingStatus,
  type ReadingStatus,
} from "@/utils/bookcase-filters";
import type { ShelfBook } from "./useBookcasePage";

function mapReviewText(review: { text?: string | null } | null): string {
  return review?.text ?? "";
}

interface UseShelfBookDetailsProps {
  selectedShelfId: number | null;
  setShelfBooks: React.Dispatch<React.SetStateAction<ShelfBook[]>>;
  setShelves: React.Dispatch<React.SetStateAction<BackendShelfSummaryResponse[]>>;
}

export function useShelfBookDetails({ selectedShelfId, setShelfBooks, setShelves }: UseShelfBookDetailsProps) {
  const [isShelfBookDetailsOpen, setIsShelfBookDetailsOpen] = useState(false);
  const [selectedShelfBook, setSelectedShelfBook] = useState<ShelfBook | null>(null);
  const [bookDetailsError, setBookDetailsError] = useState("");
  const [isSavingShelfBookDetails, setIsSavingShelfBookDetails] = useState(false);
  const [isRemovingBookFromShelf, setIsRemovingBookFromShelf] = useState(false);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressBook, setProgressBook] = useState<ShelfBook | null>(null);
  const [progressDraft, setProgressDraft] = useState("");
  const [progressError, setProgressError] = useState("");
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [reviewRatingDraft, setReviewRatingDraft] = useState(0);
  const [reviewCommentDraft, setReviewCommentDraft] = useState("");
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  const resetPanel = () => {
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
    setBookDetailsError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewSuccessMessage("");
    setReviewError("");
  };

  const applyShelfItemUpdate = (updatedItem: BackendShelfItemResponse) => {
    setShelfBooks((books) =>
      books.map((book) =>
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
    setSelectedShelfBook((current) => {
      if (!current || current.shelfItemId !== updatedItem.id) return current;
      return {
        ...current,
        readingStatus: mapBackendReadingStatus(updatedItem.status),
        progress: updatedItem.progressPercent ?? undefined,
        currentPage: updatedItem.currentPage ?? undefined,
        totalPages: updatedItem.totalPages ?? current.totalPages,
      };
    });
  };

  const removeShelfBookFromState = (shelfId: number, itemId: number) => {
    setShelfBooks((currentBooks) => {
      const nextBooks = currentBooks.filter((b) => b.shelfItemId !== itemId);
      setShelves((ss) =>
        ss.map((shelf) =>
          shelf.id === shelfId
            ? {
                ...shelf,
                itemCount: Math.max(0, shelf.itemCount - 1),
                coverPreview: nextBooks
                  .map((b) => b.coverUrl)
                  .filter((url): url is string => typeof url === "string" && url.length > 0)
                  .slice(0, 4),
              }
            : shelf,
        ),
      );
      return nextBooks;
    });
  };

  const handleOpenShelfBookDetails = (book: ShelfBook) => {
    setSelectedShelfBook(book);
    setBookDetailsError("");
    setReviewError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewSuccessMessage("");
    setIsShelfBookDetailsOpen(true);

    async function loadExistingReview() {
      const bookId = Number(book.id);
      if (Number.isNaN(bookId)) return;
      try {
        const existingReview = await getMyBookReview(bookId);
        if (!existingReview) return;
        setActiveReviewId(existingReview.id);
        setReviewRatingDraft(existingReview.rating);
        setReviewCommentDraft(mapReviewText(existingReview));
      } catch {
        // noop: if loading existing review fails, user can still write a new one
      }
    }
    void loadExistingReview();
  };

  const handleCloseShelfBookDetails = () => {
    setIsShelfBookDetailsOpen(false);
    setSelectedShelfBook(null);
    setBookDetailsError("");
    setActiveReviewId(null);
    setReviewRatingDraft(0);
    setReviewCommentDraft("");
    setReviewSuccessMessage("");
    setReviewError("");
  };

  const handleRemoveSelectedShelfBook = () => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(selectedShelfBook.shelfItemId);

    async function removeSelectedShelfBookAction() {
      setIsRemovingBookFromShelf(true);
      setBookDetailsError("");
      try {
        await removeBookFromShelf(activeShelfId, activeItemId);
        removeShelfBookFromState(activeShelfId, activeItemId);
        handleCloseShelfBookDetails();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para remover livros da estante.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível remover o livro da estante.");
        }
      } finally {
        setIsRemovingBookFromShelf(false);
      }
    }
    void removeSelectedShelfBookAction();
  };

  const handleRemoveShelfBook = (book: ShelfBook) => {
    if (selectedShelfId === null || typeof book.shelfItemId !== "number") {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(book.shelfItemId);

    async function removeShelfBookAction() {
      setIsRemovingBookFromShelf(true);
      setBookDetailsError("");
      try {
        await removeBookFromShelf(activeShelfId, activeItemId);
        removeShelfBookFromState(activeShelfId, activeItemId);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para remover livros da estante.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível remover o livro da estante.");
        }
      } finally {
        setIsRemovingBookFromShelf(false);
      }
    }
    void removeShelfBookAction();
  };

  const handleSelectShelfBookStatus = (nextStatus: Exclude<ReadingStatus, "todos">) => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(selectedShelfBook.shelfItemId);

    async function updateStatusAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");
      try {
        const updatedItem = await changeShelfItemStatus(
          activeShelfId,
          activeItemId,
          mapFrontendReadingStatus(nextStatus),
        );
        applyShelfItemUpdate(updatedItem);
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setBookDetailsError("Faça login para atualizar o status do livro.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setBookDetailsError(error.message);
        } else {
          setBookDetailsError("Não foi possível atualizar o status do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }
    void updateStatusAction();
  };

  const updatePageProgress = (
    shelfId: number,
    itemId: number,
    book: ShelfBook,
    page: number,
    onError: (msg: string) => void,
    onDone: () => void,
  ) => {
    async function updateProgressAction() {
      setIsSavingShelfBookDetails(true);
      setBookDetailsError("");
      try {
        if (book.readingStatus !== "lendo" && book.readingStatus !== "relendo") {
          await changeShelfItemStatus(shelfId, itemId, "READING");
        }
        const updatedItem = await updateShelfItemProgress(shelfId, itemId, page);
        applyShelfItemUpdate(updatedItem);
        onDone();
      } catch (error) {
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          onError("Faça login para atualizar o progresso.");
        } else if (error instanceof BookcaseApiError && error.message) {
          onError(error.message);
        } else {
          onError("Não foi possível atualizar o progresso do livro.");
        }
      } finally {
        setIsSavingShelfBookDetails(false);
      }
    }
    void updateProgressAction();
  };

  const handleStepShelfBookPage = (delta: number) => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    const currentPage = selectedShelfBook.currentPage ?? 0;
    const nextPage = currentPage + delta;
    if (nextPage < 0) return;
    if (typeof selectedShelfBook.totalPages === "number" && nextPage > selectedShelfBook.totalPages) return;
    updatePageProgress(
      selectedShelfId,
      Number(selectedShelfBook.shelfItemId),
      selectedShelfBook,
      nextPage,
      setBookDetailsError,
      () => {},
    );
  };

  const handleSetShelfBookPage = (page: number) => {
    if (!selectedShelfBook || selectedShelfId === null || typeof selectedShelfBook.shelfItemId !== "number") {
      setBookDetailsError("Não foi possível identificar o item da estante.");
      return;
    }
    if (!Number.isInteger(page) || page < 0) return;
    if (typeof selectedShelfBook.totalPages === "number" && page > selectedShelfBook.totalPages) return;
    updatePageProgress(
      selectedShelfId,
      Number(selectedShelfBook.shelfItemId),
      selectedShelfBook,
      page,
      setBookDetailsError,
      () => {},
    );
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
    const activeShelfId = selectedShelfId;
    const activeItemId = Number(progressBook.shelfItemId);
    const activeProgressBook = progressBook;
    const normalizedDraft = progressDraft.trim();
    const parsedPage = Number(normalizedDraft);

    if (!normalizedDraft || Number.isNaN(parsedPage) || !Number.isInteger(parsedPage)) {
      setProgressError("Informe um número inteiro de página.");
      return;
    }
    if (parsedPage < 0) { setProgressError("A página atual não pode ser negativa."); return; }
    if (typeof activeProgressBook.totalPages === "number" && parsedPage > activeProgressBook.totalPages) {
      setProgressError(`A página não pode ser maior que ${activeProgressBook.totalPages}.`);
      return;
    }

    async function saveProgressAction() {
      setIsSavingProgress(true);
      setProgressError("");
      try {
        if (activeProgressBook.readingStatus !== "lendo" && activeProgressBook.readingStatus !== "relendo") {
          await changeShelfItemStatus(activeShelfId, activeItemId, "READING");
        }
        const updatedItem = await updateShelfItemProgress(activeShelfId, activeItemId, parsedPage);
        setShelfBooks((books) =>
          books.map((book) =>
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

  const handleSetReviewRating = (value: number) => {
    setReviewSuccessMessage("");
    setReviewError("");
    setReviewRatingDraft(value);
  };

  const handleSetReviewComment = (value: string) => {
    setReviewSuccessMessage("");
    setReviewError("");
    setReviewCommentDraft(value);
  };

  const handleSaveBookReview = () => {
    if (!selectedShelfBook) { setReviewError("Não foi possível identificar o livro para avaliar."); return; }
    const bookId = Number(selectedShelfBook.id);
    if (Number.isNaN(bookId)) { setReviewError("Não foi possível identificar o livro para avaliar."); return; }
    if (!Number.isInteger(reviewRatingDraft) || reviewRatingDraft < 1 || reviewRatingDraft > 5) {
      setReviewError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    const normalizedComment = reviewCommentDraft.trim();
    if (normalizedComment.length > 2000) { setReviewError("O comentário deve ter no máximo 2000 caracteres."); return; }
    if (activeReviewId && normalizedComment.length === 0) {
      setReviewError("Para editar a avaliação com as rotas atuais, informe um comentário.");
      return;
    }

    async function saveBookReviewAction() {
      setIsSavingReview(true);
      setReviewSuccessMessage("");
      setReviewError("");
      try {
        const savedReview = activeReviewId
          ? await updateBookReview(activeReviewId, reviewRatingDraft, normalizedComment)
          : await createBookReview(bookId, reviewRatingDraft, normalizedComment);
        setActiveReviewId(savedReview.id);
        setReviewRatingDraft(savedReview.rating);
        setReviewCommentDraft(mapReviewText(savedReview));
        setReviewSuccessMessage("Avaliação publicada no feed dos seus seguidores!");
      } catch (error) {
        if (error instanceof BookcaseApiError && isDuplicateReviewError(error.message)) {
          try {
            const existingReview = await getMyBookReview(bookId);
            if (existingReview) {
              setActiveReviewId(existingReview.id);
              setReviewRatingDraft(existingReview.rating);
              setReviewCommentDraft(mapReviewText(existingReview));
              setReviewError("");
              return;
            }
          } catch {
            // fallback to generic error handling below
          }
        }
        if (error instanceof BookcaseApiError && (error.status === 401 || error.status === 403)) {
          setReviewError("Faça login para salvar sua avaliação.");
        } else if (error instanceof BookcaseApiError && error.message) {
          setReviewError(error.message);
        } else {
          setReviewError("Não foi possível salvar sua avaliação. Tente novamente.");
        }
      } finally {
        setIsSavingReview(false);
      }
    }
    void saveBookReviewAction();
  };

  return {
    isShelfBookDetailsOpen,
    selectedShelfBook,
    bookDetailsError,
    isSavingShelfBookDetails,
    isRemovingBookFromShelf,
    resetPanel,
    handleOpenShelfBookDetails,
    handleCloseShelfBookDetails,
    handleRemoveSelectedShelfBook,
    handleRemoveShelfBook,
    handleSelectShelfBookStatus,
    handleStepShelfBookPage,
    handleSetShelfBookPage,

    isProgressModalOpen,
    progressBook,
    progressDraft,
    progressError,
    isSavingProgress,
    setProgressDraft,
    handleOpenProgressModal,
    handleCloseProgressModal,
    handleSaveProgress,

    activeReviewId,
    reviewRatingDraft,
    reviewCommentDraft,
    reviewSuccessMessage,
    reviewError,
    isSavingReview,
    handleSetReviewRating,
    handleSetReviewComment,
    handleSaveBookReview,
  };
}
