"use client";

import React from "react";
import { BookOpen, Calendar, Check, Copy, Globe, Link, Loader2, Lock, Trash2, Users, X } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { searchUsersByUsername, type UserSummaryResponse } from "@/services/profile";
import { generateCommunityInviteLink } from "@/services/community";
import type { Community, CommunityMember } from "../../hooks/useCommunity";
import { ConfirmActionModal } from "./ConfirmActionModal";

export interface CommunityInfoPanelProps {
  community: Community;
  members: CommunityMember[];
  canEdit: boolean;
  currentUserId?: string | null;
  onSaveCommunity: (community: Community) => void;
  onInviteUser: (communityId: string, inviteeId: number) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
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
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      const link = await generateCommunityInviteLink(Number(communityId));
      setInviteLink(link);
    } catch (error) {
      setGenerateError(error instanceof Error && error.message ? error.message : "Nao foi possivel gerar o codigo.");
    } finally {
      setIsGenerating(false);
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

      {inviteLink ? (
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-slate-50 border border-border px-2 py-1.5 text-xs font-mono text-foreground">
            {inviteLink}
          </code>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Copiar código"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {isGenerating ? "Gerando..." : "Gerar código"}
          </button>
          {generateError ? <p className="mt-2 text-xs text-red-600">{generateError}</p> : null}
        </>
      )}
    </div>
  );
}

function getBookParts(bookTitle: string): { title: string; author: string } {
  const [title, ...authorParts] = bookTitle.split(" - ");
  return { title: title ?? bookTitle, author: authorParts.join(" - ") || "Autor desconhecido" };
}

export function CommunityInfoPanel({
  community,
  members,
  canEdit,
  currentUserId,
  onSaveCommunity,
  onInviteUser,
  onRemoveMember,
  onClose,
}: Readonly<CommunityInfoPanelProps>) {
  const { title, author } = getBookParts(community.bookTitle);
  const isPrivate = community.visibility === "PRIVATE";
  const visibilityLabel = isPrivate ? "Grupo privado" : "Grupo público";

  const [isEditing, setIsEditing] = React.useState(false);
  const [editableName, setEditableName] = React.useState(community.name);
  const [editableDescription, setEditableDescription] = React.useState(community.description ?? "");
  const [editableCoverUrl, setEditableCoverUrl] = React.useState(community.coverUrl ?? "");
  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(null);
  const [memberToRemoveId, setMemberToRemoveId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Invite inline
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = React.useState("");
  const [inviteSearchResults, setInviteSearchResults] = React.useState<UserSummaryResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = React.useState(false);
  const [isInvitingUserId, setIsInvitingUserId] = React.useState<number | null>(null);
  const [inviteError, setInviteError] = React.useState("");
  const [inviteSuccess, setInviteSuccess] = React.useState("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditableCoverUrl(reader.result as string);
    reader.readAsDataURL(file);
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
    <aside className="h-[calc(100vh-4rem)] w-[320px] shrink-0 overflow-y-auto border-l border-border bg-card">
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
        <div
          className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 bg-cover bg-center ring-2 ring-emerald-100"
          style={editableCoverUrl ? { backgroundImage: `url(${editableCoverUrl})` } : undefined}
        >
          {editableCoverUrl ? null : <BookOpen className="h-9 w-9 text-emerald-500" />}
        </div>
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
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Foto do grupo</p>
              <div className="flex items-center gap-3">
                {editableCoverUrl ? (
                  <img src={editableCoverUrl} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {editableCoverUrl ? "Alterar foto" : "Escolher foto"}
                  </button>
                  {editableCoverUrl ? (
                    <button
                      type="button"
                      onClick={() => setEditableCoverUrl("")}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
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
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Leitura atual</p>
        <div className="rounded-xl bg-emerald-50/70 p-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-emerald-600">{author}</p>
          <div className="mt-2">
            <ProgressBar value={community.discussions > 0 ? Math.min(100, community.discussions % 100) : 68} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {community.discussions > 0 ? Math.min(100, community.discussions % 100) : 68}% do grupo concluiu
            </p>
          </div>
        </div>
      </div>

      {/* Membros */}
      <div className="border-b border-border px-4 py-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="flex-1 text-xs font-semibold text-muted-foreground">Membros · {community.members}</span>
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
              +
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
            const canRemove = canEdit && member.id !== currentUserId && !!onRemoveMember;

            return (
              <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {member.isAdmin ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      Admin
                    </span>
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

      {/* Sair do grupo */}
      <div className="px-4 pb-6 pt-2">
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          Sair do grupo
        </button>
      </div>

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
    </aside>
  );
}

export default CommunityInfoPanel;
