"use client";

import React from "react";
import { Plus } from "lucide-react";
import {
  AppShell,
  BookcaseModal,
  Button,
  ChipToggle,
  CommunityCard,
  PageHeader,
  SearchSuggestionsList,
  SectionHeader,
  SecondaryButton,
  TextInput,
} from "@/components";
import { searchBooks, type BackendBookResponse } from "@/services/bookcase";

type CommunityVisibility = "PUBLIC" | "PRIVATE";

type Community = {
  id: string;
  name: string;
  bookId: number;
  bookTitle: string;
  visibility: CommunityVisibility;
  members: number;
  discussions: number;
  isMember: boolean;
};

type BookSuggestion = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  bookId: number;
};

const MIN_BOOK_QUERY_LENGTH = 2;

const initialCommunities: Community[] = [
  {
    id: "c1",
    name: "Clube do Livro: 1984",
    bookId: 1,
    bookTitle: "1984 - George Orwell",
    visibility: "PUBLIC",
    members: 156,
    discussions: 342,
    isMember: true,
  },
  {
    id: "c2",
    name: "Fas de Clarice",
    bookId: 2,
    bookTitle: "A Hora da Estrela",
    visibility: "PUBLIC",
    members: 89,
    discussions: 127,
    isMember: true,
  },
  {
    id: "c3",
    name: "Leitores de Fantasia",
    bookId: 3,
    bookTitle: "O Nome do Vento",
    visibility: "PRIVATE",
    members: 234,
    discussions: 891,
    isMember: true,
  },
  {
    id: "c4",
    name: "Debates Distopicos",
    bookId: 4,
    bookTitle: "Admiravel Mundo Novo",
    visibility: "PUBLIC",
    members: 72,
    discussions: 95,
    isMember: false,
  },
];

function mapBookToSuggestion(book: BackendBookResponse): BookSuggestion {
  return {
    id: `book-${book.id}`,
    bookId: book.id,
    title: book.title,
    author: book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido",
    coverUrl: book.coverUrl ?? undefined,
  };
}

function normalizeCommunityName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildCommunityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `community-${Date.now()}`;
}

export default function ComunidadesPage() {
  const [tab, setTab] = React.useState<"minhas" | "descobrir">("minhas");
  const [communities, setCommunities] = React.useState<Community[]>(initialCommunities);

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [communityName, setCommunityName] = React.useState("");
  const [visibility, setVisibility] = React.useState<CommunityVisibility>("PUBLIC");
  const [bookQuery, setBookQuery] = React.useState("");
  const [bookSuggestions, setBookSuggestions] = React.useState<BookSuggestion[]>([]);
  const [selectedBook, setSelectedBook] = React.useState<BookSuggestion | null>(null);
  const [isSearchingBooks, setIsSearchingBooks] = React.useState(false);
  const [searchError, setSearchError] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");

  const normalizedCommunityName = normalizeCommunityName(communityName);
  const shouldSearchBooks = selectedBook === null && bookQuery.trim().length >= MIN_BOOK_QUERY_LENGTH;

  const filteredCommunities = React.useMemo(() => {
    if (tab === "minhas") {
      return communities.filter((community) => community.isMember);
    }

    return communities;
  }, [communities, tab]);

  const resetCreateForm = React.useCallback(() => {
    setCommunityName("");
    setVisibility("PUBLIC");
    setBookQuery("");
    setBookSuggestions([]);
    setSelectedBook(null);
    setSearchError("");
    setSubmitError("");
  }, []);

  const openCreateModal = React.useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  }, [resetCreateForm]);

  const closeCreateModal = React.useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  React.useEffect(() => {
    if (!shouldSearchBooks) {
      setBookSuggestions([]);
      setSearchError("");
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingBooks(true);
      setSearchError("");

      try {
        const books = await searchBooks(bookQuery);
        if (cancelled) {
          return;
        }

        setBookSuggestions(books.slice(0, 8).map(mapBookToSuggestion));
      } catch {
        if (!cancelled) {
          setBookSuggestions([]);
          setSearchError("Nao foi possivel buscar livros agora.");
        }
      } finally {
        if (!cancelled) {
          setIsSearchingBooks(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [bookQuery, shouldSearchBooks]);

  const handleSelectBook = (item: { id: string; title: string; author: string; coverUrl?: string }) => {
    const selected = bookSuggestions.find((suggestion) => suggestion.id === item.id);
    if (!selected) {
      return;
    }

    setSelectedBook(selected);
    setBookQuery("");
    setBookSuggestions([]);
    setSearchError("");
  };

  const handleClearSelectedBook = () => {
    setSelectedBook(null);
    setBookQuery("");
    setBookSuggestions([]);
    setSearchError("");
  };

  const handleSubmitCreateCommunity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (normalizedCommunityName.length < 3) {
      setSubmitError("Informe um nome para a comunidade com pelo menos 3 caracteres.");
      return;
    }

    if (!selectedBook) {
      setSubmitError("Selecione um livro existente do catalogo para criar a comunidade.");
      return;
    }

    const duplicatedName = communities.some(
      (community) => community.name.toLowerCase() === normalizedCommunityName.toLowerCase(),
    );

    if (duplicatedName) {
      setSubmitError("Ja existe uma comunidade com este nome.");
      return;
    }

    const newCommunity: Community = {
      id: buildCommunityId(),
      name: normalizedCommunityName,
      bookId: selectedBook.bookId,
      bookTitle: `${selectedBook.title} - ${selectedBook.author}`,
      visibility,
      members: 1,
      discussions: 0,
      isMember: true,
    };

    setCommunities((current) => [newCommunity, ...current]);
    setTab("minhas");
    closeCreateModal();
  };

  return (
    <AppShell>
      <PageHeader
        title="Comunidades"
        subtitle="Encontre comunidades de leitura"
        action={
          <SecondaryButton
            type="button"
            onClick={openCreateModal}
            className="h-10 w-10 p-0 text-xl leading-none"
            aria-label="Criar comunidade"
            title="Criar comunidade"
          >
            <Plus size={18} />
          </SecondaryButton>
        }
      />

      <div className="flex gap-2">
        <ChipToggle label="Minhas" active={tab === "minhas"} onClick={() => setTab("minhas")} />
        <ChipToggle label="Descobrir" active={tab === "descobrir"} onClick={() => setTab("descobrir")} />
      </div>

      <button
        type="button"
        onClick={openCreateModal}
        className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-4 text-left transition-colors hover:bg-emerald-100/40"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-[var(--brand-700)]">
          <Plus size={24} />
        </span>
        <span>
          <strong className="block text-lg text-[var(--text-primary)]">Criar Comunidade</strong>
          <span className="text-base text-[var(--text-secondary)]">Inicie uma discussao sobre um livro</span>
        </span>
      </button>

      <SectionHeader title={tab === "minhas" ? "Minhas comunidades" : "Comunidades para descobrir"} />
      <div className="grid gap-3">
        {filteredCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            name={community.name}
            bookTitle={community.bookTitle}
            visibility={community.visibility}
            members={community.members}
            discussions={community.discussions}
          />
        ))}
      </div>

      {isCreateModalOpen ? (
        <BookcaseModal title="Criar comunidade" onClose={closeCreateModal} maxWidthClassName="max-w-3xl">
          <form className="mt-5 space-y-5" onSubmit={handleSubmitCreateCommunity}>
            <TextInput
              label="Nome da comunidade"
              placeholder="Ex: Clube do Livro: 1984"
              value={communityName}
              onChange={(event) => setCommunityName(event.target.value)}
              maxLength={80}
              autoFocus
            />

            <div className="space-y-2">
              <p className="text-sm font-bold text-[var(--text-primary)]">Visibilidade</p>
              <div className="flex flex-wrap gap-2">
                <ChipToggle
                  label="Publica"
                  active={visibility === "PUBLIC"}
                  onClick={() => setVisibility("PUBLIC")}
                />
                <ChipToggle
                  label="Privada"
                  active={visibility === "PRIVATE"}
                  onClick={() => setVisibility("PRIVATE")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <TextInput
                label="Livro da comunidade"
                placeholder="Busque um livro do catalogo"
                value={bookQuery}
                onChange={(event) => {
                  setBookQuery(event.target.value);
                  setSearchError("");
                }}
                disabled={Boolean(selectedBook)}
              />

              {selectedBook ? (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedBook.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{selectedBook.author}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelectedBook}
                    className="text-sm font-semibold text-[var(--brand-700)] hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : null}

              {isSearchingBooks ? <p className="text-sm text-[var(--text-secondary)]">Buscando livros...</p> : null}
              {searchError ? <p className="text-sm text-red-600">{searchError}</p> : null}

              {!selectedBook ? (
                <SearchSuggestionsList
                  items={bookSuggestions}
                  onSelect={handleSelectBook}
                />
              ) : null}

              {!isSearchingBooks && !searchError && shouldSearchBooks && bookSuggestions.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">Nenhum livro encontrado.</p>
              ) : null}
            </div>

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-soft)] pt-4">
              <SecondaryButton type="button" onClick={closeCreateModal}>
                Cancelar
              </SecondaryButton>
              <Button type="submit">Criar comunidade</Button>
            </div>
          </form>
        </BookcaseModal>
      ) : null}
    </AppShell>
  );
}
