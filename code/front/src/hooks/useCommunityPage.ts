"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  acceptCommunityInvite,
  declineCommunityInvite,
  listPendingCommunityInvites,
  listPendingCommunityJoinRequests,
  approveCommunityJoinRequest,
  rejectCommunityJoinRequest,
} from "@/services/community";
import type { PendingCommunityInviteResponse, PendingCommunityJoinRequestResponse } from "@/types/api";
import { markNotificationAsRead } from "@/services/notifications";
import {
  useCommunity,
  type Community,
  type CommunityBookOption,
  type CommunityVisibility,
} from "@/hooks/useCommunity";

type FormSubmitEvent = Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0];

function normalizeCommunityName(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

export function useCommunityPage() {
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
    updateExistingCommunity,
    inviteUser,
    pendingJoinRequestIds,
    currentUserId,
  } = useCommunity();

  const [tab, setTab] = React.useState<"minhas" | "descobrir">("minhas");
  const [selectedCommunityId, setSelectedCommunityId] = React.useState<string | null>(null);

  // Create modal
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

  // Non-member modal
  const [communityActionError, setCommunityActionError] = React.useState("");
  const [processingCommunityId, setProcessingCommunityId] = React.useState<string | null>(null);
  const [discoverSearchTerm, setDiscoverSearchTerm] = React.useState("");
  const [openedFromQuery, setOpenedFromQuery] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inviteCodeError, setInviteCodeError] = React.useState("");
  const [privateJoinFeedback, setPrivateJoinFeedback] = React.useState("");
  const [processingPrivateCodeJoin, setProcessingPrivateCodeJoin] = React.useState(false);
  const [consumedInviteToken, setConsumedInviteToken] = React.useState<string | null>(null);

  // Invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [modalActionError, setModalActionError] = React.useState("");
  const [isSubmittingInviteAction, setIsSubmittingInviteAction] = React.useState(false);
  const [pendingInvite, setPendingInvite] = React.useState<PendingCommunityInviteResponse | null>(null);

  // Join requests modal
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

    return discoverableCommunities.filter(
      (community) =>
        community.name.toLowerCase().includes(normalizedSearch) ||
        (community.description ?? "").toLowerCase().includes(normalizedSearch) ||
        community.bookTitle.toLowerCase().includes(normalizedSearch),
    );
  }, [communities, tab, discoverSearchTerm]);

  // Book search debounce for create modal
  React.useEffect(() => {
    if (!isCreateModalOpen) return;

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

        if (isCancelled) return;

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
        if (!isCancelled) setIsSearchingBooks(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [bookSearchTerm, isCreateModalOpen, searchBookOptions]);

  // Query param resolution
  React.useEffect(() => {
    if (openedFromQuery) return;

    const communityIdFromQuery = searchParams.get("communityId");
    const shouldOpen = searchParams.get("open") === "1";
    const shouldOpenInviteModal = searchParams.get("openInviteModal") === "1";
    const shouldOpenJoinRequests = searchParams.get("openJoinRequests") === "1";
    const notificationIdFromQuery = searchParams.get("notificationId");

    if (!communityIdFromQuery && !shouldOpenInviteModal && !shouldOpenJoinRequests) return;

    if (!communityIdFromQuery && shouldOpenInviteModal) {
      const inviteIdFromQuery = searchParams.get("inviteId");
      const parsedInviteId = inviteIdFromQuery ? Number(inviteIdFromQuery) : null;

      if (!parsedInviteId || !Number.isFinite(parsedInviteId)) return;

      let cancelled = false;

      void (async () => {
        try {
          const pendingInvites = await listPendingCommunityInvites(0, 100);
          if (cancelled) return;

          const invite = pendingInvites.find((item) => item.id === parsedInviteId);
          if (!invite) return;

          const targetCommunity = communities.find(
            (community) => community.id === String(invite.communityId),
          );
          if (!targetCommunity) return;

          setTab(targetCommunity.isMember ? "minhas" : "descobrir");
          setSelectedCommunityId(targetCommunity.id);
          if (!targetCommunity.isMember) setIsInviteModalOpen(true);
          setOpenedFromQuery(true);
        } catch {
          // Mantem comportamento padrao quando nao for possivel resolver convite pela notificacao.
        }
      })();

      return () => { cancelled = true; };
    }

    if (!communityIdFromQuery) return;

    const targetCommunity = communities.find((community) => community.id === communityIdFromQuery);

    if (!targetCommunity) {
      if (!shouldOpenInviteModal) return;

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

    if (shouldOpenInviteModal && !targetCommunity.isMember) setIsInviteModalOpen(true);

    if (shouldOpenJoinRequests && targetCommunity.isMember) {
      setIsJoinRequestsModalOpen(true);
      setJoinRequestsNotificationId(notificationIdFromQuery);
    }

    setOpenedFromQuery(true);
  }, [communities, openedFromQuery, searchParams]);

  // Load pending invite when invite modal opens
  React.useEffect(() => {
    if (!isInviteModalOpen || !selectedCommunity || selectedCommunity.isMember) return;

    let cancelled = false;
    const inviteIdFromQuery = searchParams.get("inviteId");
    const parsedInviteId = inviteIdFromQuery ? Number(inviteIdFromQuery) : null;

    void (async () => {
      try {
        const pendingInvites = await listPendingCommunityInvites(0, 100);
        if (cancelled) return;

        const candidates = pendingInvites.filter(
          (item) => item.communityId === Number(selectedCommunity.id),
        );

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

    return () => { cancelled = true; };
  }, [isInviteModalOpen, searchParams, selectedCommunity]);

  // Load join requests when modal opens
  React.useEffect(() => {
    if (!isJoinRequestsModalOpen || !selectedCommunity) return;

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
        if (cancelled) return;
        setJoinRequests(requests);
      } catch {
        if (!cancelled) {
          setJoinRequestsError("Não foi possivel carregar as solicitações pendentes.");
          setJoinRequests([]);
        }
      } finally {
        if (!cancelled) setIsLoadingJoinRequests(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isJoinRequestsModalOpen, isSelectedCommunityOwner, selectedCommunity]);

  // Auto-join from inviteToken query param
  React.useEffect(() => {
    if (!selectedCommunity || selectedCommunity.isMember || selectedCommunity.visibility !== "PRIVATE") return;

    const inviteTokenFromQuery = searchParams.get("inviteToken")?.trim();
    if (!inviteTokenFromQuery || inviteTokenFromQuery === consumedInviteToken) return;

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
  }, [consumedInviteToken, joinPrivateCommunityByInviteCode, refreshCommunities, searchParams, selectedCommunity]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const handleSubmitCreateCommunity = React.useCallback(
    (event: FormSubmitEvent) => {
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
          } else {
            setSubmitError("Não foi possivel criar a comunidade.");
          }
        }
      })();
    },
    [
      bookOptions,
      closeCreateModal,
      communities,
      communityDescription,
      createNewCommunity,
      normalizedCommunityName,
      selectedBookId,
      visibility,
    ],
  );

  const handleOpenCommunity = React.useCallback((communityId: string) => {
    setCommunityActionError("");
    setInviteCode("");
    setInviteCodeError("");
    setPrivateJoinFeedback("");
    setSelectedCommunityId(communityId);
  }, []);

  const handleCloseChatView = React.useCallback(() => {
    setSelectedCommunityId(null);
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
      if (!community) return;
      handleOpenCommunity(communityId);
    },
    [communities, handleOpenCommunity],
  );

  const getCommunityActionLabel = React.useCallback(
    (communityId: string): string => {
      const community = communities.find((item) => item.id === communityId);
      if (!community) return "Abrir";
      return community.isMember ? "Abrir Chat" : "Ver detalhes";
    },
    [communities],
  );

  const handleJoinPublicFromDetails = React.useCallback(async () => {
    if (!selectedCommunity || selectedCommunity.isMember || selectedCommunity.visibility !== "PUBLIC") return;

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

  const handleRequestPrivateJoinFromDetails = React.useCallback(async () => {
    if (!selectedCommunity || selectedCommunity.visibility !== "PRIVATE") return;

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
    if (!selectedCommunity || selectedCommunity.visibility !== "PRIVATE") return;

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

  const handleInviteDecision = React.useCallback(
    async (decision: "accept" | "decline") => {
      if (!pendingInvite) return;

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

  const handleUpdateCommunity = React.useCallback(
    async (community: Community) => {
      await updateExistingCommunity(community.id, community.name, community.description ?? "");
    },
    [updateExistingCommunity],
  );

  const closeJoinRequestsModal = React.useCallback(() => {
    setIsJoinRequestsModalOpen(false);
    setJoinRequests([]);
    setJoinRequestsError("");
    setJoinRequestsNotificationId(null);
  }, []);

  const handleApproveJoinRequest = React.useCallback(
    async (requestId: number) => {
      if (processingJoinRequestId) return;

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
      if (processingJoinRequestId) return;

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

  return {
    // useCommunity passthrough
    communities,
    isLoadingCommunities,
    communitiesError,
    isSubmittingCreate,
    inviteUser,
    pendingJoinRequestIds,

    // Derived
    filteredCommunities,
    selectedCommunity,
    normalizedCommunityName,

    // Tab
    tab,
    setTab,
    discoverSearchTerm,
    setDiscoverSearchTerm,

    // Create modal
    isCreateModalOpen,
    communityName,
    setCommunityName,
    communityDescription,
    setCommunityDescription,
    visibility,
    setVisibility,
    bookSearchTerm,
    setBookSearchTerm,
    selectedBookId,
    setSelectedBookId,
    bookOptions,
    isSearchingBooks,
    bookSearchError,
    submitError,
    openCreateModal,
    closeCreateModal,
    handleSubmitCreateCommunity,

    // Non-member modal
    communityActionError,
    processingCommunityId,
    inviteCode,
    setInviteCode,
    inviteCodeError,
    privateJoinFeedback,
    processingPrivateCodeJoin,
    handleOpenCommunity,
    handleCloseChatView,
    handleCloseNonMemberModal,
    handleCommunityPrimaryAction,
    getCommunityActionLabel,
    handleJoinPublicFromDetails,
    handleRequestPrivateJoinFromDetails,
    handleJoinPrivateWithCode,
    handleUpdateCommunity,

    // Invite modal
    isInviteModalOpen,
    pendingInvite,
    modalActionError,
    isSubmittingInviteAction,
    closeInviteModal,
    handleInviteDecision,

    // Join requests modal
    isJoinRequestsModalOpen,
    joinRequests,
    joinRequestsError,
    isLoadingJoinRequests,
    processingJoinRequestId,
    closeJoinRequestsModal,
    handleApproveJoinRequest,
    handleRejectJoinRequest,
  } satisfies Record<string, unknown>;
}

export type { Community, CommunityVisibility } from "@/hooks/useCommunity";
export type { PendingCommunityInviteResponse, PendingCommunityJoinRequestResponse } from "@/types/api";
