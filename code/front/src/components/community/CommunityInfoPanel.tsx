"use client";

import React from "react";
import { BookOpen, Calendar, Globe, Users, X } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import type { Community, CommunityMember } from "./types";

export interface CommunityInfoPanelProps {
  community: Community;
  members: CommunityMember[];
  canEdit: boolean;
  onSaveCommunity: (community: Community) => void;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBookParts(bookTitle: string): { title: string; author: string } {
  const [title, ...authorParts] = bookTitle.split(" - ");
  return {
    title,
    author: authorParts.join(" - ") || "Autor desconhecido",
  };
}

export function CommunityInfoPanel({
  community,
  members,
  canEdit,
  onSaveCommunity,
  onClose,
}: Readonly<CommunityInfoPanelProps>) {
  const { title, author } = getBookParts(community.bookTitle);
  const visibilityLabel = community.visibility === "PRIVATE" ? "Grupo privado" : "Grupo publico";
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableName, setEditableName] = React.useState(community.name);
  const [editableDescription, setEditableDescription] = React.useState(community.description ?? "");
  const [editableCoverUrl, setEditableCoverUrl] = React.useState(community.coverUrl ?? "");

  React.useEffect(() => {
    setEditableName(community.name);
    setEditableDescription(community.description ?? "");
    setEditableCoverUrl(community.coverUrl ?? "");
    setIsEditing(false);
  }, [community]);

  const handleSave = () => {
    const normalizedName = editableName.trim();
    if (normalizedName.length < 3) {
      return;
    }

    onSaveCommunity({
      ...community,
      name: normalizedName,
      description: editableDescription.trim(),
      coverUrl: editableCoverUrl.trim() || undefined,
    });
    setIsEditing(false);
  };

  return (
    <aside className="h-[calc(100vh-4rem)] w-[340px] shrink-0 overflow-y-auto border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Informacoes do grupo</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Fechar painel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center px-4 pb-4 pt-6">
        <div
          className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 bg-cover bg-center"
          style={community.coverUrl ? { backgroundImage: `url(${community.coverUrl})` } : undefined}
        >
          {community.coverUrl ? null : <BookOpen className="h-10 w-10 text-primary" />}
        </div>
        <h2 className="text-center text-3xl font-semibold leading-tight text-foreground">{community.name}</h2>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          {visibilityLabel} - {community.members} membros
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {isEditing ? "Fechar edicao" : "Editar grupo"}
          </button>
        ) : null}
      </div>

      {canEdit && isEditing ? (
        <div className="border-b border-border px-4 pb-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="group-name-input">
                Nome do grupo
              </label>
              <input
                id="group-name-input"
                value={editableName}
                onChange={(event) => setEditableName(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm text-foreground outline-none focus:border-border focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="group-bio-input">
                Bio
              </label>
              <textarea
                id="group-bio-input"
                rows={3}
                value={editableDescription}
                onChange={(event) => setEditableDescription(event.target.value)}
                className="w-full resize-none rounded-md border border-border bg-white px-2.5 py-2 text-sm text-foreground outline-none focus:border-border focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="group-photo-input">
                URL da foto
              </label>
              <input
                id="group-photo-input"
                value={editableCoverUrl}
                onChange={(event) => setEditableCoverUrl(event.target.value)}
                placeholder="https://..."
                className="h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm text-foreground outline-none focus:border-border focus:ring-2 focus:ring-black/5"
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
                Salvar alteracoes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-b border-border px-4 pb-4">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Descricao</p>
        <p className="text-sm leading-relaxed text-foreground">
          {community.description ??
            "Clube dedicado a leitura e discussao de obras da literatura. Lemos um livro por mes e discutimos capitulo a capitulo."}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Criado em {community.createdAtLabel ?? "janeiro de 2025"}
        </div>
      </div>

      <div className="border-b border-border px-4 py-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Leitura atual</p>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{author}</p>
          <div className="mt-2">
            <ProgressBar value={community.discussions > 0 ? Math.min(100, community.discussions % 100) : 68} />
            <p className="mt-1 text-[11px] text-muted-foreground">{community.discussions > 0 ? Math.min(100, community.discussions % 100) : 68}% do grupo concluiu</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3 w-3" />
          Membros - {community.members}
        </p>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {getInitials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.name}
                  {member.isPro ? (
                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">PRO</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
              </div>
              {member.isAdmin ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Admin</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        <button
          type="button"
          className="w-full rounded-lg border border-destructive/30 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          Sair do grupo
        </button>
      </div>
    </aside>
  );
}

export default CommunityInfoPanel;
