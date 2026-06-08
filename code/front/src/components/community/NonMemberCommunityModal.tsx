"use client";

import Image from "next/image";
import { BookOpen, Globe, Lock, Send, Users, X } from "lucide-react";
import type { Community } from "@/hooks/useCommunity";
import { parseBookTitle } from "@/utils/book-utils";

type Props = {
  community: Community;
  communityActionError: string;
  processingCommunityId: string | null;
  inviteCode: string;
  inviteCodeError: string;
  privateJoinFeedback: string;
  processingPrivateCodeJoin: boolean;
  hasPendingJoinRequest: boolean;
  onClose: () => void;
  onJoinPublic: () => void;
  onJoinPrivateWithCode: () => void;
  onRequestPrivateJoin: () => void;
  onChangeInviteCode: (value: string) => void;
};

export function NonMemberCommunityModal({
  community,
  communityActionError,
  processingCommunityId,
  inviteCode,
  inviteCodeError,
  privateJoinFeedback,
  processingPrivateCodeJoin,
  hasPendingJoinRequest,
  onClose,
  onJoinPublic,
  onJoinPrivateWithCode,
  onRequestPrivateJoin,
  onChangeInviteCode,
}: Readonly<Props>) {
  const { title: bookName, author: bookAuthorRaw } = parseBookTitle(community.bookTitle);
  const bookAuthor = bookAuthorRaw || "Autor desconhecido";
  const isPublic = community.visibility === "PUBLIC";
  const displayUrl = community.coverUrl ?? community.bookCoverUrl;

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Fechar detalhes da comunidade"
      />

      <div className="relative z-10 my-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 px-5 pb-4 pr-12 pt-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 shadow-sm ring-2 ring-emerald-100">
            {displayUrl ? (
              <Image src={displayUrl} alt={community.name} width={56} height={56} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-7 w-7 text-emerald-500" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-base font-bold text-foreground">{community.name}</h2>
              {isPublic ? (
                <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              )}
            </div>
            {community.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{community.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{community.members}</span> membros
            </p>
          </div>
        </div>

        <div className="border-t border-border" />

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

        <div className="px-5 pb-5 pt-4">
          {communityActionError && (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {communityActionError}
            </p>
          )}

          {isPublic ? (
            <button
              type="button"
              onClick={onJoinPublic}
              disabled={processingCommunityId !== null}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processingCommunityId === community.id ? "Entrando..." : "Participar"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código de convite</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => onChangeInviteCode(e.target.value)}
                  placeholder="Inserir código"
                  className="h-10 w-full rounded-xl border border-border bg-slate-50 px-3 text-sm outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200"
                />
                <button
                  type="button"
                  onClick={onJoinPrivateWithCode}
                  disabled={processingPrivateCodeJoin}
                  className="inline-flex h-10 min-w-[72px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
                >
                  {processingPrivateCodeJoin ? "..." : "Entrar"}
                </button>
              </div>
              {inviteCodeError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {inviteCodeError}
                </p>
              )}
              {privateJoinFeedback && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {privateJoinFeedback}
                </p>
              )}
              <div className="relative py-1 text-center text-xs uppercase tracking-widest text-muted-foreground">
                <span className="absolute left-0 top-1/2 h-px w-[44%] -translate-y-1/2 bg-border" />
                ou
                <span className="absolute right-0 top-1/2 h-px w-[44%] -translate-y-1/2 bg-border" />
              </div>
              <button
                type="button"
                onClick={onRequestPrivateJoin}
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
}
