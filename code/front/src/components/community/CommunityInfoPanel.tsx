"use client";

import React from "react";
import { BookOpen, Calendar, Check, Copy, Globe, Inbox, Link, Loader2, Lock, Star, Trash2, UserPlus, Users, X } from "lucide-react";
import { searchUsersByUsername, type UserSummaryResponse } from "@/services/profile";
import { approveCommunityJoinRequest, generateCommunityInviteLink, getCommunityInviteLink, listPendingCommunityJoinRequests, rejectCommunityJoinRequest, revokeCommunityInviteLink, type PendingCommunityJoinRequestResponse } from "@/services/community";
import { getBookById, type BackendBookResponse } from "@/services/bookcase";
import type { Community, CommunityMember } from "../../hooks/useCommunity";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { parseBookTitle } from "@/utils/book-utils";

function JoinRequestsModal({
  isOpen,
  isLoading,
  error,
  requests,
  processingId,
  onClose,
  onApprove,
  onReject,
}: {
  isOpen: boolean;
  isLoading: boolean;
  error: string;
  requests: PendingCommunityJoinRequestResponse[];
  processingId: number | null;
  onClose: () => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-emerald-900/60 transition-colors hover:bg-emerald-100"
          aria-label="Fechar solicitacoes"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Solicitações pendentes</p>
          <p className="mt-1 text-sm text-emerald-900/70">Aprove ou recuse entradas no grupo.</p>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando solicitacoes...
            </div>
          ) : null}

          {!isLoading && requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
          ) : null}

          {!isLoading && requests.length > 0 ? (
            <ul className="space-y-3">
              {requests.map((req) => {
                const displayName = req.username ?? `usuario-${req.userId}`;
                const displayHandle = req.username ? `@${req.username}` : `#${req.userId}`;
                const isProcessing = processingId === req.id;
                return (
                  <li
                    key={req.id}
                    className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full border border-emerald-100 bg-white">
                        {req.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={req.avatarUrl}
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
                        <p className="text-sm font-semibold text-foreground">{displayName}</p>
                        <p className="text-xs text-emerald-700">{displayHandle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onReject(req.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900/70 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(req.id)}
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

export interface CommunityInfoPanelProps {
  community: Community;
  members: CommunityMember[];
  canEdit: boolean;
  currentUserId?: string | null;
  onSaveCommunity: (community: Community) => void;
  onInviteUser: (communityId: string, inviteeId: number) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onLeaveGroup?: () => Promise<void>;
  onChangeMemberRole?: (memberId: string, role: "MODERATOR" | "MEMBER") => Promise<void>;
  onDeleteCommunity?: () => Promise<void>;
  onRefreshMembers?: () => Promise<void>;
  onClose: () => void;
}

function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
      {initials}
    </div>
  );
}

function InviteCodeSection({ communityId }: { communityId: string }) {
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    getCommunityInviteLink(Number(communityId))
      .then(setInviteLink)
      .catch(() => setInviteLink(null))
      .finally(() => setIsLoading(false));
  }, [communityId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const link = await generateCommunityInviteLink(Number(communityId));
      setInviteLink(link);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Não foi possível gerar o código.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    setError("");
    try {
      await revokeCommunityInviteLink(Number(communityId));
      setInviteLink(null);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Não foi possível revogar o código.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <div className="border-t border-border px-4 py-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Link className="h-3 w-3 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground">Código de convite</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Compartilhe este código para que outros usuários entrem no grupo privado.
      </p>

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : inviteLink ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-slate-50 px-2 py-1.5 text-xs font-mono text-foreground">
              {inviteLink}
            </code>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating || isRevoking}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {isGenerating ? "Gerando..." : "Gerar novo"}
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => void handleRevoke()}
              disabled={isGenerating || isRevoking}
              className="inline-flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
            >
              {isRevoking ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {isRevoking ? "Revogando..." : "Revogar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {isGenerating ? "Gerando..." : "Gerar código"}
        </button>
      )}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}


export function CommunityInfoPanel({
  community,
  members,
  canEdit,
  currentUserId,
  onSaveCommunity,
  onInviteUser,
  onRemoveMember,
  onLeaveGroup,
  onChangeMemberRole,
  onDeleteCommunity,
  onRefreshMembers,
  onClose,
}: Readonly<CommunityInfoPanelProps>) {
  const { title, author: authorRaw } = parseBookTitle(community.bookTitle);
  const author = authorRaw || "Autor desconhecido";
  const isPrivate = community.visibility === "PRIVATE";
  const visibilityLabel = isPrivate ? "Grupo privado" : "Grupo público";

  const [isEditing, setIsEditing] = React.useState(false);
  const [editableName, setEditableName] = React.useState(community.name);
  const [editableDescription, setEditableDescription] = React.useState(community.description ?? "");
  const [editableCoverUrl, setEditableCoverUrl] = React.useState(community.coverUrl ?? "");
  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(null);
  const [memberToRemoveId, setMemberToRemoveId] = React.useState<string | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  // Invite inline
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = React.useState("");
  const [inviteSearchResults, setInviteSearchResults] = React.useState<UserSummaryResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = React.useState(false);
  const [isInvitingUserId, setIsInvitingUserId] = React.useState<number | null>(null);
  const [inviteError, setInviteError] = React.useState("");
  const [inviteSuccess, setInviteSuccess] = React.useState("");
  const [isJoinRequestsOpen, setIsJoinRequestsOpen] = React.useState(false);
  const [joinRequests, setJoinRequests] = React.useState<PendingCommunityJoinRequestResponse[]>([]);
  const [joinRequestsCount, setJoinRequestsCount] = React.useState(0);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = React.useState(false);
  const [processingJoinRequestId, setProcessingJoinRequestId] = React.useState<number | null>(null);
  const [joinRequestsError, setJoinRequestsError] = React.useState("");

  const [bookDetails, setBookDetails] = React.useState<BackendBookResponse | null>(null);
  const [bookLoading, setBookLoading] = React.useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setBookLoading(true);
    setBookDetails(null);
    setIsSynopsisExpanded(false);
    getBookById(community.bookId)
      .then((book) => { if (!cancelled) setBookDetails(book); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBookLoading(false); });
    return () => { cancelled = true; };
  }, [community.bookId]);

  React.useEffect(() => {
    if (!isInviteOpen) {
      setInviteSearchTerm("");
      setInviteSearchResults([]);
      setInviteError("");
      setInviteSuccess("");
      return;
    }

    const normalized = inviteSearchTerm.trim();
    if (normalized.length < 2) {
      setInviteSearchResults([]);
      setInviteError("");
      setIsSearchingUsers(false);
      return;
    }

    let cancelled = false;
    const timeoutId = globalThis.setTimeout(async () => {
      setIsSearchingUsers(true);
      setInviteError("");
      try {
        const users = await searchUsersByUsername(normalized, undefined, 0, 8);
        if (cancelled) return;
        const memberUsernames = new Set(members.map((m) => m.username.toLowerCase()));
        const filtered = users.filter((u) => !memberUsernames.has(u.username.toLowerCase()));
        setInviteSearchResults(filtered);
        if (filtered.length === 0) setInviteError("Nenhum usuário disponível para convite.");
      } catch {
        if (!cancelled) { setInviteSearchResults([]); setInviteError("Não foi possível buscar usuários."); }
      } finally {
        if (!cancelled) setIsSearchingUsers(false);
      }
    }, 300);

    return () => { cancelled = true; globalThis.clearTimeout(timeoutId); };
  }, [inviteSearchTerm, isInviteOpen, members]);

  const handleInviteUser = async (user: UserSummaryResponse) => {
    setInviteError("");
    setInviteSuccess("");
    setIsInvitingUserId(user.id);
    try {
      await onInviteUser(community.id, user.id);
      setInviteSuccess(`Convite enviado para ${user.username}.`);
      setInviteSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      setInviteError(error instanceof Error && error.message ? error.message : "Não foi possível enviar o convite.");
    } finally {
      setIsInvitingUserId(null);
    }
  };

  React.useEffect(() => {
    setEditableName(community.name);
    setEditableDescription(community.description ?? "");
    setEditableCoverUrl(community.coverUrl ?? "");
    setIsEditing(false);
  }, [community]);

  const loadJoinRequests = React.useCallback(
    async (shouldUpdateList: boolean) => {
      if (!canEdit || !isPrivate) {
        setJoinRequestsCount(0);
        return;
      }
      setIsLoadingJoinRequests(true);
      setJoinRequestsError("");
      try {
        const loaded = await listPendingCommunityJoinRequests(Number(community.id));
        setJoinRequestsCount(loaded.length);
        if (shouldUpdateList) {
          setJoinRequests(loaded);
        }
      } catch {
        if (shouldUpdateList) {
          setJoinRequestsError("Não foi possível carregar solicitações.");
          setJoinRequests([]);
        }
      } finally {
        setIsLoadingJoinRequests(false);
      }
    },
    [canEdit, community.id, isPrivate],
  );

  React.useEffect(() => {
    void loadJoinRequests(false);
  }, [loadJoinRequests]);

  const handleOpenJoinRequests = () => {
    setIsJoinRequestsOpen(true);
    void loadJoinRequests(true);
  };

  const handleApproveJoinRequest = async (requestId: number) => {
    setProcessingJoinRequestId(requestId);
    setJoinRequestsError("");
    try {
      await approveCommunityJoinRequest(requestId);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      setJoinRequestsCount((prev) => Math.max(0, prev - 1));
      await onRefreshMembers?.();
    } catch (err) {
      setJoinRequestsError(err instanceof Error && err.message ? err.message : "Erro ao aprovar.");
    } finally {
      setProcessingJoinRequestId(null);
    }
  };

  const handleRejectJoinRequest = async (requestId: number) => {
    setProcessingJoinRequestId(requestId);
    setJoinRequestsError("");
    try {
      await rejectCommunityJoinRequest(requestId);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      setJoinRequestsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setJoinRequestsError(err instanceof Error && err.message ? err.message : "Erro ao rejeitar.");
    } finally {
      setProcessingJoinRequestId(null);
    }
  };


  const handleSave = () => {
    if (editableName.trim().length < 3) return;
    onSaveCommunity({
      ...community,
      name: editableName.trim(),
      description: editableDescription.trim(),
      coverUrl: editableCoverUrl || undefined,
    });
    setIsEditing(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return;
    setRemovingMemberId(memberId);
    try {
      await onRemoveMember(memberId);
      setMemberToRemoveId(null);
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-border bg-card animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Informações do grupo</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Fechar painel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Avatar + nome */}
      <div className="flex flex-col items-center px-4 pb-4 pt-6">
        {(() => {
          const displayUrl = editableCoverUrl || community.bookCoverUrl;
          if (displayUrl) {
            return (
              <img
                src={displayUrl}
                alt={community.name}
                className="mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-emerald-100"
              />
            );
          }
          return (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-100">
              <BookOpen className="h-9 w-9 text-emerald-500" />
            </div>
          );
        })()}
        <h2 className="text-center text-2xl font-bold leading-tight text-foreground">{community.name}</h2>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {visibilityLabel} · {community.members} membros
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {isEditing ? "Cancelar edição" : "Editar grupo"}
          </button>
        ) : null}
      </div>

      {/* Formulário de edição */}
      {canEdit && isEditing ? (
        <div className="border-b border-border px-4 pb-4">
          <div className="space-y-3 rounded-xl border border-border bg-slate-50/60 p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="group-name-input">
                Nome
              </label>
              <input
                id="group-name-input"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="group-bio-input">
                Descrição
              </label>
              <textarea
                id="group-bio-input"
                rows={3}
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-white px-2.5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditableName(community.name);
                  setEditableDescription(community.description ?? "");
                  setEditableCoverUrl(community.coverUrl ?? "");
                  setIsEditing(false);
                }}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Descrição */}
      <div className="border-b border-border px-4 py-4">
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Descrição</p>
        <p className="text-sm leading-relaxed text-foreground">
          {community.description ?? "Sem descrição."}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Criado em {community.createdAtLabel ?? "janeiro de 2025"}
        </div>
      </div>

      {/* Leitura atual */}
      <div className="border-b border-border px-4 py-4">
        <p className="mb-3 text-xs font-semibold text-muted-foreground">Leitura atual</p>

        {bookLoading ? (
          <div className="h-28 animate-pulse rounded-xl bg-muted/60" />
        ) : bookDetails ? (
          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/40">
            {/* capa + metadados */}
            <div className="flex gap-3 p-3">
              {bookDetails.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bookDetails.coverUrl}
                  alt={bookDetails.title}
                  className="h-24 w-16 shrink-0 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <BookOpen className="h-7 w-7 text-emerald-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                  {bookDetails.title}
                </p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  {bookDetails.authors?.join(", ") || author}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {bookDetails.averageRating ? (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {bookDetails.averageRating.toFixed(1)}
                    </span>
                  ) : null}
                  {bookDetails.pageCount ? (
                    <span className="text-xs text-muted-foreground">
                      {bookDetails.pageCount} pág.
                    </span>
                  ) : null}
                  {bookDetails.readerCount ? (
                    <span className="text-xs text-muted-foreground">
                      {bookDetails.readerCount.toLocaleString("pt-BR")} leitores
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* sinopse */}
            {(bookDetails.synopsis ?? bookDetails.description) ? (() => {
              const synopsisText = bookDetails.synopsis ?? bookDetails.description ?? "";
              const isLong = synopsisText.length > 200;
              return (
                <div className="border-t border-emerald-100 px-3 pb-3 pt-2">
                  <p className={`text-xs leading-relaxed text-muted-foreground ${isSynopsisExpanded ? "" : "line-clamp-3"}`}>
                    {synopsisText}
                  </p>
                  {isLong ? (
                    <button
                      type="button"
                      onClick={() => setIsSynopsisExpanded((v) => !v)}
                      className="mt-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {isSynopsisExpanded ? "Ler menos" : "Ler mais"}
                    </button>
                  ) : null}
                </div>
              );
            })() : null}
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-50/70 p-3">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-emerald-600">{author}</p>
          </div>
        )}
      </div>

      {/* Membros */}
      <div className="border-b border-border px-4 py-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="flex-1 text-xs font-semibold text-muted-foreground">Membros · {community.members}</span>
          {canEdit && isPrivate ? (
            <button
              type="button"
              onClick={handleOpenJoinRequests}
              aria-label="Ver solicitacoes"
              className="relative flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Inbox className="h-3 w-3" />
              {joinRequestsCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-semibold text-white">
                  {joinRequestsCount}
                </span>
              ) : null}
            </button>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => setIsInviteOpen((v) => !v)}
              aria-label="Convidar usuário"
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                isInviteOpen
                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                  : "border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <UserPlus className="h-3 w-3" />
            </button>
          ) : null}
        </div>

        {/* Busca de convite inline */}
        {canEdit && isInviteOpen ? (
          <div className="mb-3">
            <input
              type="text"
              value={inviteSearchTerm}
              onChange={(e) => { setInviteSearchTerm(e.target.value); setInviteSuccess(""); setInviteError(""); }}
              placeholder="Buscar por username..."
              autoFocus
              className="h-8 w-full rounded-md border border-border bg-white px-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {isSearchingUsers ? (
              <p className="mt-1.5 text-xs text-muted-foreground">Buscando...</p>
            ) : null}
            {inviteError ? (
              <p className="mt-1.5 text-xs text-red-600">{inviteError}</p>
            ) : null}
            {inviteSuccess ? (
              <p className="mt-1.5 text-xs text-emerald-600">{inviteSuccess}</p>
            ) : null}
            {inviteSearchResults.length > 0 ? (
              <div className="mt-1.5 space-y-1">
                {inviteSearchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
                    <p className="truncate text-xs font-medium text-foreground">{user.username}</p>
                    <button
                      type="button"
                      onClick={() => void handleInviteUser(user)}
                      disabled={isInvitingUserId !== null}
                      className="flex-shrink-0 rounded-md border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
                    >
                      {isInvitingUserId === user.id ? "Enviando..." : "Convidar"}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1">
          {members.map((member) => {
            const isRemoving = removingMemberId === member.id;
            const canRemove = canEdit && member.id !== currentUserId && !!onRemoveMember && member.role !== "OWNER";
            const canChangeRole = !!onChangeMemberRole && member.role !== "OWNER" && member.id !== currentUserId;

            return (
              <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {member.role === "OWNER" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Dono</span>
                  ) : member.role === "MODERATOR" ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">Admin</span>
                  ) : null}
                  {canChangeRole ? (
                    <button
                      type="button"
                      onClick={() => void onChangeMemberRole!(member.id, member.role === "MODERATOR" ? "MEMBER" : "MODERATOR")}
                      title={member.role === "MODERATOR" ? "Remover admin" : "Tornar admin"}
                      className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {member.role === "MODERATOR" ? "Remover admin" : "Tornar admin"}
                    </button>
                  ) : null}
                  {canRemove ? (
                    <button
                      type="button"
                      onClick={() => setMemberToRemoveId(member.id)}
                      disabled={isRemoving}
                      aria-label={`Remover ${member.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    >
                      {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Código de convite (só para owner de grupos privados) */}
      {canEdit && isPrivate ? <InviteCodeSection communityId={community.id} /> : null}

      <JoinRequestsModal
        isOpen={isJoinRequestsOpen}
        isLoading={isLoadingJoinRequests}
        error={joinRequestsError}
        requests={joinRequests}
        processingId={processingJoinRequestId}
        onClose={() => setIsJoinRequestsOpen(false)}
        onApprove={(requestId) => void handleApproveJoinRequest(requestId)}
        onReject={(requestId) => void handleRejectJoinRequest(requestId)}
      />

      {/* Sair do grupo */}
      {onLeaveGroup ? (
        <div className="px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={() => setIsLeaveConfirmOpen(true)}
            disabled={isLeaving}
            className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {isLeaving ? "Saindo..." : "Sair do grupo"}
          </button>
        </div>
      ) : null}

      {/* Excluir comunidade (apenas owner) */}
      {onDeleteCommunity ? (
        <div className="px-4 pb-4 pt-2">
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeleting}
            className="w-full rounded-xl border border-red-300 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Excluir comunidade"}
          </button>
        </div>
      ) : null}

      <ConfirmActionModal
        isOpen={memberToRemoveId != null}
        title="Remover membro"
        description={`Deseja remover ${members.find((m) => m.id === memberToRemoveId)?.name ?? "este membro"} do grupo? Essa ação não pode ser desfeita.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        isLoading={removingMemberId != null}
        onClose={() => {
          if (!removingMemberId) setMemberToRemoveId(null);
        }}
        onConfirm={() => {
          if (memberToRemoveId) void handleRemoveMember(memberToRemoveId);
        }}
      />

      <ConfirmActionModal
        isOpen={isLeaveConfirmOpen}
        title="Sair do grupo"
        description="Tem certeza que deseja sair deste grupo? Você precisará ser convidado novamente para participar."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        isLoading={isLeaving}
        onClose={() => { if (!isLeaving) setIsLeaveConfirmOpen(false); }}
        onConfirm={() => {
          if (!onLeaveGroup) return;
          setIsLeaving(true);
          onLeaveGroup().finally(() => setIsLeaving(false));
        }}
      />

      <ConfirmActionModal
        isOpen={isDeleteConfirmOpen}
        title="Excluir comunidade"
        description={`Tem certeza que deseja excluir "${community.name}"? Esta ação não pode ser desfeita e todos os membros serão removidos.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onClose={() => { if (!isDeleting) setIsDeleteConfirmOpen(false); }}
        onConfirm={() => {
          if (!onDeleteCommunity) return;
          setIsDeleting(true);
          onDeleteCommunity().finally(() => setIsDeleting(false));
        }}
      />
    </aside>
  );
}

export default CommunityInfoPanel;
