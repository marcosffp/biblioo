"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  addBookToShelfWithoutDuplicate,
  computeBookSuggestions,
  filterBooksByStatusAndSearch,
  filterCollectionsBySearch,
  isBookAlreadyInShelf,
  normalizeSearchTerm,
  type ReadingStatus,
  type RuleBook,
  type RuleCollection,
} from "./bookcase-rules";

import {
  AppShell,
  BookDetailsCard,
  BookCard,
  ChipToggle,
  EmptyState,
  PageHeader,
  SearchSuggestionsList,
  SectionHeader,
  TextInput,
} from "@/components";
import { IconButton } from "@/components";

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

const catalogBooks: ShelfBook[] = [
  {
    id: "b1",
    title: "A Menina que Roubava Livros",
    author: "Markus Zusak",
    rating: 4,
    progress: 65,
    readingStatus: "lendo",
    synopsis:
      "Durante a Segunda Guerra, uma jovem encontra nos livros um refugio para resistir ao horror ao seu redor.",
    currentPage: 213,
    totalPages: 328,
  },
  {
    id: "b2",
    title: "1984",
    author: "George Orwell",
    rating: 5,
    progress: 40,
    readingStatus: "quero-ler",
    synopsis:
      "Em uma sociedade totalitaria, vigilancia constante e controle da linguagem moldam a vida dos individuos.",
    currentPage: 129,
    totalPages: 328,
  },
  {
    id: "b3",
    title: "O Pequeno Principe",
    author: "Antoine de Saint-Exupery",
    rating: 4,
    progress: 30,
    readingStatus: "quero-ler",
    synopsis:
      "Um piloto encontra um jovem principe e aprende sobre amizade, afeto e o valor do essencial.",
    currentPage: 29,
    totalPages: 96,
  },
  {
    id: "b4",
    title: "A Metamorfose",
    author: "Franz Kafka",
    rating: 5,
    progress: 0,
    readingStatus: "lido",
    synopsis:
      "A vida de Gregor Samsa muda drasticamente e revela o isolamento e os conflitos familiares.",
    currentPage: 0,
    totalPages: 112,
  },
];

const initialShelfBooks: ShelfBook[] = catalogBooks.filter((book) => book.id === "b1" || book.id === "b2");

const collections: ShelfCollection[] = [
  { id: "c1", title: "Distopias favoritas", author: "8 livros" },
  { id: "c2", title: "Classicos brasileiros", author: "5 livros" },
];

export default function EstantePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("livros");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ShelfBook[]>([]);
  const [selectedSuggestionBook, setSelectedSuggestionBook] = useState<ShelfBook | null>(null);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>(initialShelfBooks);

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

  const computedSuggestions = computeBookSuggestions(catalogBooks, searchTerm);

  void suggestions;
  void setSuggestions;

  const visibleSuggestions = computedSuggestions;

  const handleSuggestionSelect = (suggestion: { id: string; title: string; author: string }) => {
    const selectedBook = catalogBooks.find((book) => book.id === suggestion.id) ?? null;
    setSelectedSuggestionBook(selectedBook);
    setSearchTerm(suggestion.title);
    setIsBookDetailsOpen(selectedBook !== null);
  };

  const handleCloseBookDetails = () => {
    setIsBookDetailsOpen(false);
  };

  const isSelectedBookAlreadyInShelf = selectedSuggestionBook
    ? isBookAlreadyInShelf(shelfBooks, selectedSuggestionBook.id)
    : false;

  const handleAddSelectedBookToShelf = () => {
    if (!selectedSuggestionBook) {
      return;
    }

    setShelfBooks((currentShelfBooks) => addBookToShelfWithoutDuplicate(currentShelfBooks, selectedSuggestionBook));

    setIsBookDetailsOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Minha Estante"
        action={<IconButton icon={<Plus size={18} />} label="Adicionar item" />}
      />

      <TextInput
        aria-label="Pesquisar na estante"
        placeholder="Buscar livros e colecoes"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <SearchSuggestionsList
        items={visibleSuggestions.map((book) => ({ id: book.id, title: book.title, author: book.author }))}
        onSelect={handleSuggestionSelect}
      />

      <BookDetailsCard
        isOpen={isBookDetailsOpen && selectedSuggestionBook !== null}
        title={selectedSuggestionBook?.title ?? ""}
        author={selectedSuggestionBook?.author ?? ""}
        coverUrl={selectedSuggestionBook?.coverUrl}
        synopsis={selectedSuggestionBook?.synopsis}
        onClose={handleCloseBookDetails}
        onAddToShelf={handleAddSelectedBookToShelf}
        isAlreadyInShelf={isSelectedBookAlreadyInShelf}
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
        {viewMode === "livros"
            ? hasNoVisibleItems
              ? (
                <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
              )
              : filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    title={book.title}
                    author={book.author}
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
                    variant="compact"
                  />
                ))}
      </div>
    </AppShell>
  );
}
