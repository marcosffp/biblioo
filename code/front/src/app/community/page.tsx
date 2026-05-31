"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Globe, Lock, Plus, Send, Users, X } from "lucide-react";
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
  acceptCommunityInvite,
  declineCommunityInvite,
  listPendingCommunityInvites,
  listPendingCommunityJoinRequests,
  approveCommunityJoinRequest,
  rejectCommunityJoinRequest,
  type PendingCommunityInviteResponse,
  type PendingCommunityJoinRequestResponse,
} from "@/services/community";
import { markNotificationAsRead } from "@/services/notifications";
import {
  type Community,
  useCommunity,
  type CommunityBookOption,
  type CommunityVisibility,
} from "@/hooks/useCommunity";
import { parseBookTitle } from "@/utils/book-utils";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

function normalizeCommunityName(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

function formatMembersLabel(total: number): string {
  return total.toLocaleString("pt-BR");
}

function formatJoinRequestDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Agora";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type InviteModalProps = {
  isOpen: boolean;
  invite: PendingCommunityInviteResponse | null;
  community: Community | null;
  isSubmitting: boolean;
  actionError: string;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
};

function CommunityInviteModal({
  isOpen,
  invite,
  community,
  isSubmitting,
  actionError,
  onClose,
  onAccept,
  onDecline,
}: Readonly<InviteModalProps>) {
  if (!isOpen || !invite) {
    return null;
  }

  const communityName = community?.name ?? invite.communityName;
  const communityDescription = community?.description ?? "Comunidade privada de leitura.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-[#f0faf6] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-900/60 transition-colors hover:bg-emerald-100"
          aria-label="Fechar convite"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-b from-[#c5ebe0] via-[#d6f3ea] to-[#eef9f5] px-8 pb-6 pt-10">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#def5ec]">
            <BookOpen className="h-10 w-10 text-emerald-500" />
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Convite especial
          </span>
          <h2 className="mt-3 text-balance text-5xl font-semibold leading-[1.02] text-[var(--deep-green)]">
            {communityName}
          </h2>
          <p className="mt-2 text-base text-emerald-900/75">
            <strong>{invite.inviterUsername ?? "Um administrador"}</strong> te convidou para participar.
          </p>
          <p className="mt-5 text-[1.65rem] leading-relaxed text-emerald-900/70">{communityDescription}</p>
        </div>

        <div className="space-y-4 bg-[#f5fcf9] px-8 pb-8 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-emerald-700/80">Membros</p>
              <p className="mt-2 text-4xl font-semibold text-[var(--deep-green)]">{formatMembersLabel(community?.members ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-emerald-700/80">Leitura atual</p>
              <p className="mt-2 text-xl font-semibold text-[var(--deep-green)]">{parseBookTitle(community?.bookTitle ?? "").title}</p>
              <p className="text-sm text-emerald-900/70">{parseBookTitle(community?.bookTitle ?? "").author || "Autor desconhecido"}</p>
            </div>
          </div>

          {actionError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onAccept}
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Processando..." : "Aceitar convite"}
            </button>
            <button
              type="button"
              onClick={onDecline}
              disabled={isSubmitting}
              className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-lg font-semibold text-emerald-900/70 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type JoinRequestsModalProps = {
  isOpen: boolean;
  community: Community | null;
  requests: PendingCommunityJoinRequestResponse[];
  isLoading: boolean;
  actionError: string;
  processingRequestId: number | null;
  onClose: () => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
};

function CommunityJoinRequestsModal({
  isOpen,
  community,
  requests,
  isLoading,
  actionError,
  processingRequestId,
  onClose,
  onApprove,
  onReject,
}: Readonly<JoinRequestsModalProps>) {
  if (!isOpen || !community) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-900/60 transition-colors hover:bg-emerald-100"
          aria-label="Fechar solicitações"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Solicitações pendentes</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--deep-green)]">{community.name}</h2>
          <p className="mt-1 text-sm text-emerald-900/70">Gerencie os pedidos para entrar na comunidade.</p>
        </div>

        <div className="px-6 py-5">
          {actionError ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {actionError}
            </p>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Carregando solicitações...</p>
          ) : null}

          {!isLoading && requests.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">Nenhuma solicitação pendente.</p>
          ) : null}

          {!isLoading && requests.length > 0 ? (
            <ul className="space-y-3">
              {requests.map((request) => {
                const displayName = request.username ?? "Usuario";
                const displayHandle = request.username ? `@${request.username}` : `#${request.userId}`;
                const isProcessing = processingRequestId === request.id;
                return (
                  <li
                    key={request.id}
                    className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full border border-emerald-100 bg-white">
                        {request.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={request.avatarUrl}
                            alt={`Avatar de ${displayName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
                            {displayName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--deep-green)]">{displayName}</p>
                        <p className="text-xs text-emerald-700">{displayHandle}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {formatJoinRequestDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onReject(request.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900/70 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(request.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Processando..." : "Aceitar"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ComunidadesPage() {
  const searchParams = useSearchParams();
  const {
    communities,
    isLoadingCommunities,
    communitiesError,
    isSubmittingCreate,
    refreshCommunities,
    createNewCommunity,
    searchBookOptions,
    joinPublicCommunity,
    requestPrivateCommunityJoin,
    joinPrivateCommunityByInviteCode,
    inviteUser,
    pendingJoinRequestIds,
    currentUserId,
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
  const [communityActionError, setCommunityActionError] = React.useState("");
  const [processingCommunityId, setProcessingCommunityId] = React.useState<string | null>(null);
  const [discoverSearchTerm, setDiscoverSearchTerm] = React.useState("");
  const [openedFromQuery, setOpenedFromQuery] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inviteCodeError, setInviteCodeError] = React.useState("");
  const [privateJoinFeedback, setPrivateJoinFeedback] = React.useState("");
  const [processingPrivateCodeJoin, setProcessingPrivateCodeJoin] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [modalActionError, setModalActionError] = React.useState("");
  const [isSubmittingInviteAction, setIsSubmittingInviteAction] = React.useState(false);
  const [pendingInvite, setPendingInvite] = React.useState<PendingCommunityInviteResponse | null>(null);
  const [consumedInviteToken, setConsumedInviteToken] = React.useState<string | null>(null);
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = React.useState(false);
  const [joinRequests, setJoinRequests] = React.useState<PendingCommunityJoinRequestResponse[]>([]);
  const [joinRequestsError, setJoinRequestsError] = React.useState("");
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = React.useState(false);
  const [processingJoinRequestId, setProcessingJoinRequestId] = React.useState<number | null>(null);
  const [joinRequestsNotificationId, setJoinRequestsNotificationId] = React.useState<string | null>(null);

  const normalizedCommunityName = normalizeCommunityName(communityName);
  const selectedCommunity = React.useMemo(
    () => communities.find((community) => community.id === selectedCommunityId) ?? null,
    [communities, selectedCommunityId],
  );

  const isSelectedCommunityOwner =
    Boolean(selectedCommunity && currentUserId) && selectedCommunity?.ownerId === currentUserId;

  const filteredCommunities = React.useMemo(() => {
    if (tab === "minhas") {
      return communities.filter((community) => community.isMember);
    }

    const discoverableCommunities = communities.filter((community) => !community.isMember);

    const normalizedSearch = discoverSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return discoverableCommunities;
    }

    return discoverableCommunities.filter((community) => {
      return (
        community.name.toLowerCase().includes(normalizedSearch) ||
        (community.description ?? "").toLowerCase().includes(normalizedSearch) ||
        community.bookTitle.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [communities, tab, discoverSearchTerm]);

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
          setBookSearchError("Não foi possivel buscar livros no momento.");
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

        setSubmitError("Não foi possivel criar a comunidade.");
      }
    })();
  };

  const handleOpenCommunity = React.useCallback((communityId: string) => {
    setCommunityActionError("");
    setInviteCode("");
    setInviteCodeError("");
    setPrivateJoinFeedback("");
    setSelectedCommunityId(communityId);
  }, []);

  const handleCloseNonMemberModal = React.useCallback(() => {
    setSelectedCommunityId(null);
    setCommunityActionError("");
    setInviteCode("");
    setInviteCodeError("");
    setPrivateJoinFeedback("");
  }, []);

  const handleCommunityPrimaryAction = React.useCallback(
    (communityId: string) => {
      const community = communities.find((item) => item.id === communityId);

      if (!community) {
        return;
      }

      handleOpenCommunity(communityId);
    },
    [communities, handleOpenCommunity],
  );

  const getCommunityActionLabel = React.useCallback(
    (communityId: string): string => {
      const community = communities.find((item) => item.id === communityId);

      if (!community) {
        return "Abrir";
      }

      if (community.isMember) {
        return "Abrir Chat";
      }

      return "Ver detalhes";
    },
    [communities],
  );

  const handleJoinPublicFromDetails = React.useCallback(async () => {
    if (!selectedCommunity || selectedCommunity.isMember || selectedCommunity.visibility !== "PUBLIC") {
      return;
    }

    setCommunityActionError("");
    setProcessingCommunityId(selectedCommunity.id);

    try {
      await joinPublicCommunity(selectedCommunity.id);
      setTab("minhas");
      setSelectedCommunityId(selectedCommunity.id);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setCommunityActionError(error.message);
      } else {
        setCommunityActionError("Não foi possivel entrar na comunidade.");
      }
    } finally {
      setProcessingCommunityId(null);
    }
  }, [joinPublicCommunity, selectedCommunity]);

  React.useEffect(() => {
    if (openedFromQuery) {
      return;
    }

    const communityIdFromQuery = searchParams.get("communityId");
    const shouldOpen = searchParams.get("open") === "1";
    const shouldOpenInviteModal = searchParams.get("openInviteModal") === "1";
    const shouldOpenJoinRequests = searchParams.get("openJoinRequests") === "1";
    const notificationIdFromQuery = searchParams.get("notificationId");

    if (!communityIdFromQuery && !shouldOpenInviteModal && !shouldOpenJoinRequests) {
      return;
    }

    if (!communityIdFromQuery && shouldOpenInviteModal) {
      const inviteIdFromQuery = searchParams.get("inviteId");
      const parsedInviteId = inviteIdFromQuery ? Number(inviteIdFromQuery) : null;

      if (!parsedInviteId || !Number.isFinite(parsedInviteId)) {
        return;
      }

      let cancelled = false;

      void (async () => {
        try {
          const pendingInvites = await listPendingCommunityInvites(0, 100);

          if (cancelled) {
            return;
          }

          const invite = pendingInvites.find((item) => item.id === parsedInviteId);
          if (!invite) {
            return;
          }

          const targetCommunity = communities.find(
            (community) => community.id === String(invite.communityId),
          );

          if (!targetCommunity) {
            return;
          }

          setTab(targetCommunity.isMember ? "minhas" : "descobrir");
          setSelectedCommunityId(targetCommunity.id);
          if (!targetCommunity.isMember) {
            setIsInviteModalOpen(true);
          }
          setOpenedFromQuery(true);
        } catch {
          // Mantem comportamento padrao quando nao for possivel resolver convite pela notificacao.
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    if (!communityIdFromQuery) {
      return;
    }

    const targetCommunity = communities.find((community) => community.id === communityIdFromQuery);

    if (!targetCommunity) {
      if (!shouldOpenInviteModal) return;

      // Community not in list (e.g. private community the user was invited to but hasn't joined yet).
      // Resolve via pending invites so the modal can open without the community being in the list.
      const inviteIdFromQuery = searchParams.get("inviteId");
      const parsedInviteId = inviteIdFromQuery ? Number(inviteIdFromQuery) : null;
      let cancelled = false;

      void (async () => {
        try {
          const pendingInvites = await listPendingCommunityInvites(0, 100);
          if (cancelled) return;

          const invite = parsedInviteId
            ? pendingInvites.find((i) => i.id === parsedInviteId)
            : pendingInvites.find((i) => i.communityId === Number(communityIdFromQuery));

          if (!invite) return;

          setPendingInvite(invite);
          setIsInviteModalOpen(true);
          setOpenedFromQuery(true);
        } catch {
          // keep default behavior when invite lookup fails
        }
      })();

      return () => { cancelled = true; };
    }

    if (shouldOpen && targetCommunity.isMember) {
      setTab("minhas");
    } else {
      setTab(targetCommunity.isMember ? "minhas" : "descobrir");
    }

    setSelectedCommunityId(targetCommunity.id);

    if (shouldOpenInviteModal && !targetCommunity.isMember) {
      setIsInviteModalOpen(true);
    }

    if (shouldOpenJoinRequests && targetCommunity.isMember) {
      setIsJoinRequestsModalOpen(true);
      setJoinRequestsNotificationId(notificationIdFromQuery);
    }

    setOpenedFromQuery(true);
  }, [communities, openedFromQuery, searchParams]);

  React.useEffect(() => {
    if (!isInviteModalOpen || !selectedCommunity || selectedCommunity.isMember) {
      return;
    }

    let cancelled = false;
    const inviteIdFromQuery = searchParams.get("inviteId");
    const parsedInviteId = inviteIdFromQuery ? Number(inviteIdFromQuery) : null;

    void (async () => {
      try {
        const pendingInvites = await listPendingCommunityInvites(0, 100);
        if (cancelled) {
          return;
        }

        const candidates = pendingInvites.filter((item) => item.communityId === Number(selectedCommunity.id));
        if (candidates.length === 0) {
          setPendingInvite(null);
          setModalActionError("Não ha convite pendente para esta comunidade.");
          return;
        }

        if (parsedInviteId && Number.isFinite(parsedInviteId)) {
          const byId = candidates.find((item) => item.id === parsedInviteId);
          setPendingInvite(byId ?? candidates[0]);
        } else {
          setPendingInvite(candidates[0]);
        }

        setModalActionError("");
      } catch {
        if (!cancelled) {
          setPendingInvite(null);
          setModalActionError("Não foi possivel carregar os detalhes do convite.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isInviteModalOpen, searchParams, selectedCommunity]);

  const handleRequestPrivateJoinFromDetails = React.useCallback(async () => {
    if (!selectedCommunity || selectedCommunity.visibility !== "PRIVATE") {
      return;
    }

    setCommunityActionError("");
    setProcessingCommunityId(selectedCommunity.id);

    try {
      await requestPrivateCommunityJoin(selectedCommunity.id);
      setPrivateJoinFeedback("Solicitação enviada aos administradores da comunidade.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setCommunityActionError(error.message);
      } else {
        setCommunityActionError("Não foi possível solicitar entrada nesta comunidade.");
      }
    } finally {
      setProcessingCommunityId(null);
    }
  }, [requestPrivateCommunityJoin, selectedCommunity]);

  const handleJoinPrivateWithCode = React.useCallback(async () => {
    if (!selectedCommunity || selectedCommunity.visibility !== "PRIVATE") {
      return;
    }

    const normalizedCode = inviteCode.trim();
    if (!normalizedCode) {
      setInviteCodeError("Digite um codigo de convite valido.");
      return;
    }

    setInviteCodeError("");
    setPrivateJoinFeedback("");
    setProcessingPrivateCodeJoin(true);

    try {
      await joinPrivateCommunityByInviteCode(selectedCommunity.id, normalizedCode);
      await refreshCommunities();
      setPrivateJoinFeedback("Entrada confirmada com codigo de convite.");
      setTab("minhas");
      setSelectedCommunityId(selectedCommunity.id);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setInviteCodeError(error.message);
      } else {
        setInviteCodeError("Não foi possivel usar o codigo de convite.");
      }
    } finally {
      setProcessingPrivateCodeJoin(false);
    }
  }, [inviteCode, joinPrivateCommunityByInviteCode, refreshCommunities, selectedCommunity]);

  const closeInviteModal = React.useCallback(() => {
    setIsInviteModalOpen(false);
    setPendingInvite(null);
    setModalActionError("");
  }, []);

  const closeJoinRequestsModal = React.useCallback(() => {
    setIsJoinRequestsModalOpen(false);
    setJoinRequests([]);
    setJoinRequestsError("");
    setJoinRequestsNotificationId(null);
  }, []);

  React.useEffect(() => {
    if (!isJoinRequestsModalOpen || !selectedCommunity) {
      return;
    }

    if (!isSelectedCommunityOwner) {
      setJoinRequestsError("Apenas o dono da comunidade pode gerenciar solicitações.");
      setJoinRequests([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingJoinRequests(true);
      setJoinRequestsError("");
      try {
        const requests = await listPendingCommunityJoinRequests(Number(selectedCommunity.id), 0, 100);
        if (cancelled) {
          return;
        }
        setJoinRequests(requests);
      } catch {
        if (!cancelled) {
          setJoinRequestsError("Não foi possivel carregar as solicitações pendentes.");
          setJoinRequests([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingJoinRequests(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isJoinRequestsModalOpen, isSelectedCommunityOwner, selectedCommunity]);

  const handleApproveJoinRequest = React.useCallback(
    async (requestId: number) => {
      if (processingJoinRequestId) {
        return;
      }
      setProcessingJoinRequestId(requestId);
      setJoinRequestsError("");

      try {
        await approveCommunityJoinRequest(requestId);
        if (joinRequestsNotificationId) {
          try {
            await markNotificationAsRead(joinRequestsNotificationId);
          } catch {
            // Mantem fluxo mesmo se nao conseguir marcar notificacao como lida.
          }
        }
        setJoinRequests((current) => current.filter((request) => request.id !== requestId));
        await refreshCommunities();
      } catch (error) {
        if (error instanceof Error && error.message) {
          setJoinRequestsError(error.message);
        } else {
          setJoinRequestsError("Não foi possivel aprovar a solicitação.");
        }
      } finally {
        setProcessingJoinRequestId(null);
      }
    },
    [joinRequestsNotificationId, processingJoinRequestId, refreshCommunities],
  );

  const handleRejectJoinRequest = React.useCallback(
    async (requestId: number) => {
      if (processingJoinRequestId) {
        return;
      }
      setProcessingJoinRequestId(requestId);
      setJoinRequestsError("");

      try {
        await rejectCommunityJoinRequest(requestId);
        if (joinRequestsNotificationId) {
          try {
            await markNotificationAsRead(joinRequestsNotificationId);
          } catch {
            // Mantem fluxo mesmo se nao conseguir marcar notificacao como lida.
          }
        }
        setJoinRequests((current) => current.filter((request) => request.id !== requestId));
        await refreshCommunities();
      } catch (error) {
        if (error instanceof Error && error.message) {
          setJoinRequestsError(error.message);
        } else {
          setJoinRequestsError("Não foi possivel recusar a solicitação.");
        }
      } finally {
        setProcessingJoinRequestId(null);
      }
    },
    [joinRequestsNotificationId, processingJoinRequestId, refreshCommunities],
  );

  React.useEffect(() => {
    if (!selectedCommunity || selectedCommunity.isMember || selectedCommunity.visibility !== "PRIVATE") {
      return;
    }

    const inviteTokenFromQuery = searchParams.get("inviteToken")?.trim();
    if (!inviteTokenFromQuery || inviteTokenFromQuery === consumedInviteToken) {
      return;
    }

    setConsumedInviteToken(inviteTokenFromQuery);
    setInviteCode(inviteTokenFromQuery);

    void (async () => {
      setProcessingPrivateCodeJoin(true);
      setInviteCodeError("");
      setPrivateJoinFeedback("");

      try {
        await joinPrivateCommunityByInviteCode(selectedCommunity.id, inviteTokenFromQuery);
        await refreshCommunities();
        setTab("minhas");
        setSelectedCommunityId(selectedCommunity.id);
        setPrivateJoinFeedback("Entrada confirmada via link de convite.");
      } catch (error) {
        if (error instanceof Error && error.message) {
          setInviteCodeError(error.message);
        } else {
          setInviteCodeError("Não foi possivel usar o link de convite.");
        }
      } finally {
        setProcessingPrivateCodeJoin(false);
      }
    })();
  }, [
    consumedInviteToken,
    joinPrivateCommunityByInviteCode,
    refreshCommunities,
    searchParams,
    selectedCommunity,
  ]);

  const handleInviteDecision = React.useCallback(
    async (decision: "accept" | "decline") => {
      if (!pendingInvite) {
        return;
      }

      setIsSubmittingInviteAction(true);
      setModalActionError("");

      try {
        if (decision === "accept") {
          await acceptCommunityInvite(pendingInvite.id);
          await refreshCommunities();
          setTab("minhas");
          setSelectedCommunityId(selectedCommunity?.id ?? String(pendingInvite.communityId));
        } else {
          await declineCommunityInvite(pendingInvite.id);
        }

        closeInviteModal();
      } catch (error) {
        if (error instanceof Error && error.message) {
          setModalActionError(error.message);
        } else {
          setModalActionError("Não foi possivel processar o convite.");
        }
      } finally {
        setIsSubmittingInviteAction(false);
      }
    },
    [closeInviteModal, pendingInvite, refreshCommunities, selectedCommunity],
  );

  if (selectedCommunity?.isMember) {
    return (
      <>
        <CommunityChatView
          community={selectedCommunity}
          onBack={() => {
            setSelectedCommunityId(null);
            void refreshCommunities();
          }}
          onUpdateCommunity={() => {
            // A atualizacao detalhada de comunidade sera sincronizada com backend nas proximas etapas.
          }}
          onInviteUser={inviteUser}
        />
        <CommunityJoinRequestsModal
          isOpen={isJoinRequestsModalOpen}
          community={selectedCommunity}
          requests={joinRequests}
          isLoading={isLoadingJoinRequests}
          actionError={joinRequestsError}
          processingRequestId={processingJoinRequestId}
          onClose={closeJoinRequestsModal}
          onApprove={(requestId) => void handleApproveJoinRequest(requestId)}
          onReject={(requestId) => void handleRejectJoinRequest(requestId)}
        />
      </>
    );
  }

  const nonMemberCommunityModal = selectedCommunity && !selectedCommunity.isMember ? (() => {
    const { title: bookName, author: bookAuthorRaw } = parseBookTitle(selectedCommunity.bookTitle);
    const bookAuthor = bookAuthorRaw || "Autor desconhecido";
    const hasPendingJoinRequest = pendingJoinRequestIds.has(selectedCommunity.id);
    const isPublic = selectedCommunity.visibility === "PUBLIC";
    const displayUrl = selectedCommunity.coverUrl ?? selectedCommunity.bookCoverUrl;

    return (
      <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]">
        <button
          type="button"
          onClick={handleCloseNonMemberModal}
          className="absolute inset-0 h-full w-full cursor-default"
          aria-label="Fechar detalhes da comunidade"
        />

        <div className="relative z-10 my-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Botão fechar */}
          <button
            type="button"
            onClick={handleCloseNonMemberModal}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header: avatar + info inline */}
          <div className="flex items-start gap-3 px-5 pb-4 pt-5 pr-12">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 shadow-sm ring-2 ring-emerald-100">
              {displayUrl ? (
                <img src={displayUrl} alt={selectedCommunity.name} className="h-full w-full object-cover" />
              ) : (
                <Users className="h-7 w-7 text-emerald-500" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-bold text-foreground">{selectedCommunity.name}</h2>
                {isPublic
                  ? <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  : <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
              </div>
              {selectedCommunity.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{selectedCommunity.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedCommunity.members}</span> membros
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Leitura atual */}
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Leitura atual</p>
              <p className="truncate text-sm font-semibold text-foreground">{bookName}</p>
              <p className="truncate text-xs text-emerald-700">{bookAuthor}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Ação */}
          <div className="px-5 pb-5 pt-4">
            {communityActionError && (
              <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{communityActionError}</p>
            )}

            {isPublic ? (
              <button
                type="button"
                onClick={() => void handleJoinPublicFromDetails()}
                disabled={processingCommunityId !== null}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processingCommunityId === selectedCommunity.id ? "Entrando..." : "Participar"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código de convite</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setInviteCodeError(""); }}
                    placeholder="Inserir código"
                    className="h-10 w-full rounded-xl border border-border bg-slate-50 px-3 text-sm outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200"
                  />
                  <button
                    type="button"
                    onClick={() => void handleJoinPrivateWithCode()}
                    disabled={processingPrivateCodeJoin}
                    className="inline-flex h-10 min-w-[72px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {processingPrivateCodeJoin ? "..." : "Entrar"}
                  </button>
                </div>
                {inviteCodeError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{inviteCodeError}</p>
                )}
                {privateJoinFeedback && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{privateJoinFeedback}</p>
                )}
                <div className="relative py-1 text-center text-xs uppercase tracking-widest text-muted-foreground">
                  <span className="absolute left-0 top-1/2 h-px w-[44%] -translate-y-1/2 bg-border" />
                  ou
                  <span className="absolute right-0 top-1/2 h-px w-[44%] -translate-y-1/2 bg-border" />
                </div>
                <button
                  type="button"
                  onClick={() => void handleRequestPrivateJoinFromDetails()}
                  disabled={processingCommunityId !== null || hasPendingJoinRequest}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {hasPendingJoinRequest ? "Solicitação enviada" : "Solicitar entrada"}
                </button>
                <p className="text-xs text-muted-foreground">A aprovação é feita pelos administradores.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })() : null;

  return (
    <AppShell>
      <PageHeader
        title="Comunidades"
        subtitle="Encontre comunidades de leitura"
        action={
          tab === "minhas" ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--brand-600)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-500)]"
            >
              <Plus className="h-4 w-4" />
              Criar comunidade
            </button>
          ) : null
        }
      />

      <div className="flex gap-2">
        <ChipToggle label="Minhas" active={tab === "minhas"} onClick={() => setTab("minhas")} />
        <ChipToggle label="Descobrir" active={tab === "descobrir"} onClick={() => setTab("descobrir")} />
      </div>

      {tab === "descobrir" ? (
        <div className="mt-3">
          <input
            type="text"
            value={discoverSearchTerm}
            onChange={(event) => setDiscoverSearchTerm(event.target.value)}
            placeholder="Pesquisar comunidade por nome, descricao ou livro"
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      ) : null}

      <SectionHeader title={tab === "minhas" ? "Minhas comunidades" : "Comunidades para descobrir"} />
      <div className="grid gap-4 lg:grid-cols-2">
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
              ? "Você ainda não participa de comunidades."
              : "Nenhuma comunidade encontrada no momento."}
          </p>
        ) : null}

        {filteredCommunities.map((community) => {
          const hasPending = !community.isMember && community.visibility === "PRIVATE" && pendingJoinRequestIds.has(community.id);
          return (
            <CommunityCard
              key={community.id}
              name={community.name}
              description={community.description}
              bookTitle={community.bookTitle}
              bookCoverUrl={community.bookCoverUrl}
              visibility={community.visibility}
              members={community.members}
              onClick={community.isMember ? () => handleOpenCommunity(community.id) : undefined}
              actionLabel={getCommunityActionLabel(community.id)}
              onActionClick={hasPending ? undefined : () => void handleCommunityPrimaryAction(community.id)}
              actionDisabled={processingCommunityId !== null}
              actionLoading={processingCommunityId === community.id}
              pendingJoinRequest={hasPending}
            />
          );
        })}
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

      {nonMemberCommunityModal}

      <CommunityInviteModal
        isOpen={isInviteModalOpen}
        invite={pendingInvite}
        community={selectedCommunity}
        isSubmitting={isSubmittingInviteAction}
        actionError={modalActionError}
        onClose={closeInviteModal}
        onAccept={() => void handleInviteDecision("accept")}
        onDecline={() => void handleInviteDecision("decline")}
      />

      <CommunityJoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        community={selectedCommunity}
        requests={joinRequests}
        isLoading={isLoadingJoinRequests}
        actionError={joinRequestsError}
        processingRequestId={processingJoinRequestId}
        onClose={closeJoinRequestsModal}
        onApprove={(requestId) => void handleApproveJoinRequest(requestId)}
        onReject={(requestId) => void handleRejectJoinRequest(requestId)}
      />
    </AppShell>
  );
}
