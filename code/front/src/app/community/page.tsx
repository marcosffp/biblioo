"use client";

import { Plus } from "lucide-react";
import { AppShell, ChipToggle, CommunityCard, PageHeader, SectionHeader } from "@/components";
import { CommunityChatView } from "@/components/community/CommunityChatView";
import { CommunityCreateModal } from "@/components/community/CommunityCreateModal";
import { CommunityInviteModal } from "@/components/community/CommunityInviteModal";
import { CommunityJoinRequestsModal } from "@/components/community/CommunityJoinRequestsModal";
import { NonMemberCommunityModal } from "@/components/community/NonMemberCommunityModal";
import { useCommunityPage } from "@/hooks/useCommunityPage";

export default function ComunidadesPage() {
  const {
    isLoadingCommunities,
    communitiesError,
    isSubmittingCreate,
    inviteUser,
    pendingJoinRequestIds,
    filteredCommunities,
    selectedCommunity,
    normalizedCommunityName,
    tab,
    setTab,
    discoverSearchTerm,
    setDiscoverSearchTerm,
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
    isInviteModalOpen,
    pendingInvite,
    modalActionError,
    isSubmittingInviteAction,
    closeInviteModal,
    handleInviteDecision,
    isJoinRequestsModalOpen,
    joinRequests,
    joinRequestsError,
    isLoadingJoinRequests,
    processingJoinRequestId,
    closeJoinRequestsModal,
    handleApproveJoinRequest,
    handleRejectJoinRequest,
  } = useCommunityPage();

  if (selectedCommunity?.isMember) {
    return (
      <>
        <CommunityChatView
          community={selectedCommunity}
          onBack={handleCloseChatView}
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
          const hasPending =
            !community.isMember &&
            community.visibility === "PRIVATE" &&
            pendingJoinRequestIds.has(community.id);
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
              onActionClick={hasPending ? undefined : () => handleCommunityPrimaryAction(community.id)}
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

      {selectedCommunity && !selectedCommunity.isMember ? (
        <NonMemberCommunityModal
          community={selectedCommunity}
          communityActionError={communityActionError}
          processingCommunityId={processingCommunityId}
          inviteCode={inviteCode}
          inviteCodeError={inviteCodeError}
          privateJoinFeedback={privateJoinFeedback}
          processingPrivateCodeJoin={processingPrivateCodeJoin}
          hasPendingJoinRequest={pendingJoinRequestIds.has(selectedCommunity.id)}
          onClose={handleCloseNonMemberModal}
          onJoinPublic={() => void handleJoinPublicFromDetails()}
          onJoinPrivateWithCode={() => void handleJoinPrivateWithCode()}
          onRequestPrivateJoin={() => void handleRequestPrivateJoinFromDetails()}
          onChangeInviteCode={(value) => { setInviteCode(value); }}
        />
      ) : null}

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
