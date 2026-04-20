"use client";

import React from "react";
import { MessageCircle, Users } from "lucide-react";
import {
  AppShell,
  ChipToggle,
  CommunityCard,
  PageHeader,
  SectionHeader,
} from "@/components";
import { CommunityChatView } from "@/components/community/CommunityChatView";
import { CommunityCreateModal } from "@/components/community/CommunityCreateModal";
import {
  useCommunity,
  type CommunityBookOption,
  type CommunityVisibility,
} from "@/hooks/useCommunity";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

function normalizeCommunityName(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

export default function ComunidadesPage() {
  const {
    communities,
    isLoadingCommunities,
    communitiesError,
    isSubmittingCreate,
    createNewCommunity,
    searchBookOptions,
  } = useCommunity();

  const [tab, setTab] = React.useState<"minhas" | "descobrir">("minhas");
  const [selectedCommunityId, setSelectedCommunityId] = React.useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [communityName, setCommunityName] = React.useState("");
  const [communityDescription, setCommunityDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<CommunityVisibility>("PUBLIC");
  const [bookSearchTerm, setBookSearchTerm] = React.useState("");
  const [selectedBookId, setSelectedBookId] = React.useState("");
  const [bookOptions, setBookOptions] = React.useState<CommunityBookOption[]>([]);
  const [isSearchingBooks, setIsSearchingBooks] = React.useState(false);
  const [bookSearchError, setBookSearchError] = React.useState("");
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
    setBookSearchTerm("");
    setSelectedBookId("");
    setBookOptions([]);
    setBookSearchError("");
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
    if (!isCreateModalOpen) {
      return;
    }

    const normalizedSearch = bookSearchTerm.trim();

    if (normalizedSearch.length < 2) {
      setBookOptions([]);
      setBookSearchError("");
      setIsSearchingBooks(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = globalThis.setTimeout(async () => {
      setIsSearchingBooks(true);
      setBookSearchError("");

      try {
        const options = await searchBookOptions(normalizedSearch);

        if (isCancelled) {
          return;
        }

        setBookOptions(options);

        if (options.length === 0) {
          setBookSearchError("Nenhum livro encontrado para esta busca.");
        }
      } catch {
        if (!isCancelled) {
          setBookOptions([]);
          setBookSearchError("Nao foi possivel buscar livros no momento.");
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingBooks(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [bookSearchTerm, isCreateModalOpen, searchBookOptions]);

  const handleSubmitCreateCommunity = (event: FormSubmitEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (normalizedCommunityName.length < 3) {
      setSubmitError("Informe um nome para a comunidade com pelo menos 3 caracteres.");
      return;
    }

    const selectedBook = bookOptions.find((book) => String(book.id) === selectedBookId);

    if (!selectedBook) {
      setSubmitError("Selecione um livro da busca para criar a comunidade.");
      return;
    }

    const duplicatedName = communities.some(
      (community) => community.name.toLowerCase() === normalizedCommunityName.toLowerCase(),
    );

    if (duplicatedName) {
      setSubmitError("Ja existe uma comunidade com este nome.");
      return;
    }

    void (async () => {
      try {
        await createNewCommunity({
          name: normalizedCommunityName,
          description: communityDescription.trim(),
          visibility,
          bookId: selectedBook.id,
          selectedBook,
        });

        setTab("minhas");
        closeCreateModal();
      } catch (error) {
        if (error instanceof Error && error.message) {
          setSubmitError(error.message);
          return;
        }

        setSubmitError("Nao foi possivel criar a comunidade.");
      }
    })();
  };

  if (selectedCommunity) {
    return (
      <CommunityChatView
        community={selectedCommunity}
        onBack={() => setSelectedCommunityId(null)}
        onUpdateCommunity={() => {
          // A atualizacao detalhada de comunidade sera sincronizada com backend nas proximas etapas.
        }}
      />
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Comunidades"
        subtitle="Encontre comunidades de leitura"
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
        {isLoadingCommunities ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Carregando comunidades...
          </p>
        ) : null}

        {!isLoadingCommunities && communitiesError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {communitiesError}
          </p>
        ) : null}

        {!isLoadingCommunities && !communitiesError && filteredCommunities.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {tab === "minhas"
              ? "Voce ainda nao participa de comunidades."
              : "Nenhuma comunidade encontrada no momento."}
          </p>
        ) : null}

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
        bookSearchTerm={bookSearchTerm}
        onChangeBookSearchTerm={setBookSearchTerm}
        isSearchingBooks={isSearchingBooks}
        bookOptions={bookOptions}
        bookSearchError={bookSearchError}
        submitError={submitError}
        isSubmitting={isSubmittingCreate}
        canSubmit={normalizedCommunityName.length >= 3 && Boolean(selectedBookId) && !isSearchingBooks}
      />
    </AppShell>
  );
}
