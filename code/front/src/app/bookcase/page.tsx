"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  computeBookSuggestions,
  filterBooksByStatusAndSearch,
  filterCollectionsBySearch,
  normalizeSearchTerm,
  type ReadingStatus,
  type RuleBook,
  type RuleCollection,
} from "./bookcase-rules";
import {
  addBookToShelf,
  BookcaseApiError,
  createShelf,
  getBookById,
  getShelfItemById,
  listCollections,
  listShelfItems,
  listShelves,
  searchBooks,
  type BackendBookResponse,
} from "@/services";
import { getAccessToken } from "@/services";

import {
  AppShell,
  BookDetailsCard,
  BookCard,
  ChipToggle,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SearchSuggestionsList,
  SectionHeader,
  TextInput,
} from "@/components";

type ViewMode = "livros" | "colecoes";

const readingStatusOptions: Array<{ value: ReadingStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "lendo", label: "Lendo" },
  { value: "quero-ler", label: "Quero Ler" },
  { value: "lido", label: "Lido" },
  { value: "relendo", label: "Relendo" },
  { value: "abandonei", label: "Abandonei" },
];

interface ShelfBook extends RuleBook {
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

interface ShelfCollection extends RuleCollection {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
}

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

export default function EstantePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("livros");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isCreateShelfModalOpen, setIsCreateShelfModalOpen] = useState(false);
  const [addBookSearchTerm, setAddBookSearchTerm] = useState("");
  const [addBookSuggestions, setAddBookSuggestions] = useState<BackendBookResponse[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [selectedSuggestionBook, setSelectedSuggestionBook] = useState<ShelfBook | null>(null);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [collections, setCollections] = useState<ShelfCollection[]>([]);
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [addToShelfError, setAddToShelfError] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [createShelfError, setCreateShelfError] = useState("");

  const normalizedTerm = normalizeSearchTerm(searchTerm);

  const filteredBooks = filterBooksByStatusAndSearch(shelfBooks, statusFilter, searchTerm);

  const filteredCollections = filterCollectionsBySearch(collections, searchTerm);

  const hasNoVisibleItems =
    viewMode === "livros" ? filteredBooks.length === 0 : filteredCollections.length === 0;

  const emptyStateTitle = normalizedTerm
    ? "Nenhum resultado encontrado"
    : viewMode === "livros"
      ? "Sua estante de livros esta vazia"
      : "Voce ainda nao possui colecoes";

  const emptyStateDescription = normalizedTerm
    ? `Nenhum item corresponde a busca por "${searchTerm.trim()}".`
    : viewMode === "livros"
      ? "Adicione livros para acompanhar seu progresso de leitura."
      : "Crie sua primeira colecao para organizar suas leituras.";

  const normalizedAddBookTerm = normalizeSearchTerm(addBookSearchTerm);

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

  useEffect(() => {
    async function loadBookcaseData() {
      setLoadError("");

      const accessToken = getAccessToken();
      if (!accessToken) {
        setShelfBooks([]);
        setCollections([]);
        return;
      }

      try {
        const shelfSummaries = await listShelves();
        if (shelfSummaries.length > 0) {
          const firstShelfId = shelfSummaries[0].id;
          setSelectedShelfId(firstShelfId);

          const items = await listShelfItems(firstShelfId);
          const mappedItems = await Promise.all(
            items.map(async (item) => {
              const [book, detailedItem] = await Promise.all([
                getBookById(item.bookId),
                getShelfItemById(firstShelfId, item.id),
              ]);

              return {
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
        } else {
          setSelectedShelfId(null);
          setShelfBooks([]);
        }

        const collectionSummaries = await listCollections();
        setCollections(
          collectionSummaries.map((collection) => ({
            id: collection.id.toString(),
            title: collection.name,
            author: `${collection.shelfCount} estantes`,
          })),
        );
      } catch (error) {
        if (error instanceof BookcaseApiError && error.status === 401) {
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

  const handleCloseAddBookModal = () => {
    setIsAddBookModalOpen(false);
    setAddBookSearchTerm("");
    setAddBookSuggestions([]);
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
        setSelectedShelfId(createdShelf.id);
        setShelfBooks([]);
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
    if (!selectedSuggestionBook) {
      return;
    }

    async function addSelectedBook() {
      setIsAddingToShelf(true);
      setAddToShelfError("");

      try {
        let shelfId = selectedShelfId;

        if (shelfId === null) {
          const createdShelf = await createShelf("Minha Estante", "Estante principal do usuario");
          shelfId = createdShelf.id;
          setSelectedShelfId(createdShelf.id);
        }

        const createdItem = await addBookToShelf(shelfId, Number(selectedSuggestionBook.id));
        const fullBook = await getBookById(createdItem.bookId);

        const createdShelfBook: ShelfBook = {
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

        setIsBookDetailsOpen(false);
      } catch (error) {
        if (error instanceof BookcaseApiError && error.status === 401) {
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
    setViewMode("livros");
    setIsAddBookModalOpen(true);
    setIsBookDetailsOpen(false);

    requestAnimationFrame(() => {
      const searchInput = document.getElementById("bookcase-add-search-input") as HTMLInputElement | null;
      searchInput?.focus();
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Minha Estante"
        action={
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={handleOpenCreateShelfModal} aria-label="Criar estante">
              Criar estante
            </SecondaryButton>

            <PrimaryButton onClick={handleAddBookClick} aria-label="Adicionar livro na estante">
              <span className="inline-flex items-center gap-2">
                <Plus size={16} />
                <span>Adicionar livro</span>
              </span>
            </PrimaryButton>
          </div>
        }
      />

      {isCreateShelfModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Criar estante</h3>
              <button
                type="button"
                onClick={handleCloseCreateShelfModal}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <TextInput
                id="bookcase-create-shelf-name"
                aria-label="Nome da estante"
                placeholder="Nome da estante"
                value={newShelfName}
                maxLength={100}
                onChange={(event) => setNewShelfName(event.target.value)}
              />

              <TextInput
                aria-label="Descricao da estante"
                placeholder="Descricao (opcional)"
                value={newShelfDescription}
                maxLength={300}
                onChange={(event) => setNewShelfDescription(event.target.value)}
              />

              {createShelfError ? <p className="text-sm text-red-600">{createShelfError}</p> : null}

              <div className="flex justify-end">
                <PrimaryButton onClick={handleCreateShelf} disabled={isCreatingShelf}>
                  {isCreatingShelf ? "Criando..." : "Salvar estante"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <TextInput
        id="bookcase-search-input"
        aria-label="Pesquisar na estante"
        placeholder="Buscar livros e colecoes"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {isAddBookModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Adicionar livro na estante</h3>
              <button
                type="button"
                onClick={handleCloseAddBookModal}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <TextInput
                id="bookcase-add-search-input"
                aria-label="Pesquisar livro para adicionar"
                placeholder="Digite para buscar livro na API"
                value={addBookSearchTerm}
                onChange={(event) => setAddBookSearchTerm(event.target.value)}
              />

              <SearchSuggestionsList
                items={visibleAddBookSuggestions.map((book) => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                }))}
                onSelect={handleSuggestionSelect}
              />
            </div>
          </div>
        </div>
      ) : null}

      <BookDetailsCard
        isOpen={isBookDetailsOpen && selectedSuggestionBook !== null}
        title={selectedSuggestionBook?.title ?? ""}
        author={selectedSuggestionBook?.author ?? ""}
        coverUrl={selectedSuggestionBook?.coverUrl}
        synopsis={selectedSuggestionBook?.synopsis}
        onClose={handleCloseBookDetails}
        onAddToShelf={handleAddSelectedBookToShelf}
        isAlreadyInShelf={isSelectedBookAlreadyInShelf}
        isAddingToShelf={isAddingToShelf}
        addToShelfError={addToShelfError}
      />

      <div className="flex gap-2">
        <ChipToggle label="Livros" active={viewMode === "livros"} onClick={() => setViewMode("livros")} />
        <ChipToggle label="Colecoes" active={viewMode === "colecoes"} onClick={() => setViewMode("colecoes")} />
      </div>

      {viewMode === "livros" ? (
        <div className="flex flex-wrap gap-2">
          {readingStatusOptions.map((statusOption) => (
            <ChipToggle
              key={statusOption.value}
              label={statusOption.label}
              active={statusFilter === statusOption.value}
              onClick={() => setStatusFilter(statusOption.value)}
            />
          ))}
        </div>
      ) : null}

      <SectionHeader title={viewMode === "livros" ? "Seus livros" : "Suas colecoes"} />
      <div className="space-y-4">
        {loadError ? <EmptyState title="Falha ao carregar estante" description={loadError} /> : null}

        {!loadError &&
          (viewMode === "livros"
            ? hasNoVisibleItems
              ? (
                <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
              )
              : filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                    rating={book.rating}
                    progress={book.progress}
                    currentPage={book.currentPage}
                    totalPages={book.totalPages}
                  />
                ))
            : hasNoVisibleItems
              ? (
                <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
              )
              : filteredCollections.map((collection) => (
                  <BookCard
                    key={collection.id}
                    title={collection.title}
                    author={collection.author}
                    coverUrl={collection.coverUrl}
                    variant="compact"
                  />
                )))}
      </div>
    </AppShell>
  );
}
