"use client";

import React from "react";
import { MessageCircle, Plus, Users, X } from "lucide-react";
import {
  AppShell,
  ChipToggle,
  CommunityCard,
  PageHeader,
  SectionHeader,
  SecondaryButton,
} from "@/components";

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

type BookOption = {
  id: number;
  title: string;
  author: string;
};

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

const initialBookOptions: BookOption[] = initialCommunities.map((community) => {
  const [title, ...authorParts] = community.bookTitle.split(" - ");
  return {
    id: community.bookId,
    title,
    author: authorParts.join(" - ") || "Autor desconhecido",
  };
});

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
  const [communityDescription, setCommunityDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<CommunityVisibility>("PUBLIC");
  const [selectedBookId, setSelectedBookId] = React.useState("");
  const [bookOptions] = React.useState<BookOption[]>(initialBookOptions);
  const [submitError, setSubmitError] = React.useState("");

  const normalizedCommunityName = normalizeCommunityName(communityName);

  const filteredCommunities = React.useMemo(() => {
    if (tab === "minhas") {
      return communities.filter((community) => community.isMember);
    }

    return communities;
  }, [communities, tab]);

  const resetCreateForm = React.useCallback(() => {
    setCommunityName("");
    setCommunityDescription("");
    setVisibility("PUBLIC");
    setSelectedBookId("");
    setSubmitError("");
  }, []);

  const openCreateModal = React.useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  }, [resetCreateForm]);

  const closeCreateModal = React.useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleSubmitCreateCommunity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (normalizedCommunityName.length < 3) {
      setSubmitError("Informe um nome para a comunidade com pelo menos 3 caracteres.");
      return;
    }

    const selectedBook = bookOptions.find((book) => String(book.id) === selectedBookId);

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
      bookId: selectedBook.id,
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
        className="mt-4 w-full rounded-lg border border-border bg-card p-5 text-left transition-shadow hover:shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <strong className="block text-sm font-semibold text-foreground">Criar Comunidade</strong>
            <p className="text-xs text-muted-foreground">Convide leitores para discutir sua leitura atual</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">Personalize nome, visibilidade e livro do grupo</p>
          <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50">
            <MessageCircle className="h-4 w-4" />
            Criar agora
          </span>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-[34px] leading-none font-semibold text-foreground">Criar Clube do Livro</h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4 p-5" onSubmit={handleSubmitCreateCommunity}>
              <div>
                <label htmlFor="community-name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Nome do clube
                </label>
                <input
                  id="community-name"
                  type="text"
                  value={communityName}
                  onChange={(event) => setCommunityName(event.target.value)}
                  placeholder="Ex: Clube Machado de Assis"
                  maxLength={80}
                  autoFocus
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label htmlFor="community-description" className="mb-1.5 block text-sm font-medium text-foreground">
                  Descricao <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  id="community-description"
                  value={communityDescription}
                  onChange={(event) => setCommunityDescription(event.target.value)}
                  placeholder="Descreva o objetivo da comunidade..."
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label htmlFor="community-book" className="mb-1.5 block text-sm font-medium text-foreground">
                  Livro atual da leitura
                </label>
                <select
                  id="community-book"
                  value={selectedBookId}
                  onChange={(event) => setSelectedBookId(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selecione um livro...</option>
                  {bookOptions.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setVisibility((current) => (current === "PRIVATE" ? "PUBLIC" : "PRIVATE"))}
                  className={`relative h-6 w-10 rounded-full transition-colors ${visibility === "PRIVATE" ? "bg-primary" : "bg-muted"}`}
                  aria-label="Alternar privacidade do clube"
                  aria-pressed={visibility === "PRIVATE"}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${visibility === "PRIVATE" ? "translate-x-5" : "translate-x-1"}`}
                  />
                </button>
                <span>
                  <span className="block text-sm font-medium text-foreground">Clube privado</span>
                  <span className="block text-xs text-muted-foreground">Apenas membros convidados podem participar</span>
                </span>
              </label>

              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

              <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={normalizedCommunityName.length < 3 || !selectedBookId}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Criar Clube
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
