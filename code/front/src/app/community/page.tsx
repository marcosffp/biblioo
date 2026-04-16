"use client";

import React from "react";
import { MessageCircle, Plus, Users } from "lucide-react";
import {
  AppShell,
  ChipToggle,
  CommunityCard,
  PageHeader,
  SectionHeader,
  SecondaryButton,
} from "@/components";
import { CommunityChatView } from "@/components/community/CommunityChatView";
import { CommunityCreateModal } from "@/components/community/CommunityCreateModal";
import type { Community, CommunityBookOption, CommunityVisibility } from "@/components/community/types";

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
    description: "Leitura conjunta de classicos distopicos com encontros semanais.",
    createdAtLabel: "marco de 2025",
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
    description: "Espaco para discutir Clarice com sensibilidade e sem pressa.",
    createdAtLabel: "abril de 2025",
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
    description: "Grupo fechado para leitores de fantasia epica.",
    createdAtLabel: "julho de 2025",
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
    description: "Debates mensais sobre distopias classicas e modernas.",
    createdAtLabel: "janeiro de 2026",
  },
];

const initialBookOptions: CommunityBookOption[] = initialCommunities.map((community) => {
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
  const [selectedCommunityId, setSelectedCommunityId] = React.useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [communityName, setCommunityName] = React.useState("");
  const [communityDescription, setCommunityDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<CommunityVisibility>("PUBLIC");
  const [selectedBookId, setSelectedBookId] = React.useState("");
  const [bookOptions] = React.useState<CommunityBookOption[]>(initialBookOptions);
  const [submitError, setSubmitError] = React.useState("");

  const normalizedCommunityName = normalizeCommunityName(communityName);
  const selectedCommunity = React.useMemo(
    () => communities.find((community) => community.id === selectedCommunityId) ?? null,
    [communities, selectedCommunityId],
  );

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
      description: communityDescription.trim() || "Comunidade criada para discutir a leitura atual em grupo.",
      createdAtLabel: "abril de 2026",
    };

    setCommunities((current) => [newCommunity, ...current]);
    setTab("minhas");
    closeCreateModal();
  };

  if (selectedCommunity) {
    return (
      <CommunityChatView
        community={selectedCommunity}
        onBack={() => setSelectedCommunityId(null)}
      />
    );
  }

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
            description={community.description}
            bookTitle={community.bookTitle}
            visibility={community.visibility}
            members={community.members}
            discussions={community.discussions}
            onClick={() => setSelectedCommunityId(community.id)}
          />
        ))}
      </div>

      <CommunityCreateModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleSubmitCreateCommunity}
        communityName={communityName}
        onChangeCommunityName={setCommunityName}
        communityDescription={communityDescription}
        onChangeCommunityDescription={setCommunityDescription}
        selectedBookId={selectedBookId}
        onChangeSelectedBookId={setSelectedBookId}
        visibility={visibility}
        onToggleVisibility={() => setVisibility((current) => (current === "PRIVATE" ? "PUBLIC" : "PRIVATE"))}
        bookOptions={bookOptions}
        submitError={submitError}
        canSubmit={normalizedCommunityName.length >= 3 && Boolean(selectedBookId)}
      />
    </AppShell>
  );
}
