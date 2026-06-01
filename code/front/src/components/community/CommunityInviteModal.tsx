"use client";

import { BookOpen, X } from "lucide-react";
import type { PendingCommunityInviteResponse } from "@/types/api";
import type { Community } from "@/hooks/useCommunity";
import { parseBookTitle } from "@/utils/book-utils";

function formatMembersLabel(total: number): string {
  return total.toLocaleString("pt-BR");
}

type Props = {
  isOpen: boolean;
  invite: PendingCommunityInviteResponse | null;
  community: Community | null;
  isSubmitting: boolean;
  actionError: string;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
};

export function CommunityInviteModal({
  isOpen,
  invite,
  community,
  isSubmitting,
  actionError,
  onClose,
  onAccept,
  onDecline,
}: Readonly<Props>) {
  if (!isOpen || !invite) return null;

  const communityName = community?.name ?? invite.communityName;
  const communityDescription = community?.description ?? "Comunidade privada de leitura.";
  const { title: bookName, author: bookAuthorRaw } = parseBookTitle(community?.bookTitle ?? "");
  const bookAuthor = bookAuthorRaw || "Autor desconhecido";

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
              <p className="mt-2 text-4xl font-semibold text-[var(--deep-green)]">
                {formatMembersLabel(community?.members ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.11em] text-emerald-700/80">Leitura atual</p>
              <p className="mt-2 text-xl font-semibold text-[var(--deep-green)]">{bookName}</p>
              <p className="text-sm text-emerald-900/70">{bookAuthor}</p>
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
