"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { PendingCommunityJoinRequestResponse } from "@/types/api";
import type { Community } from "@/hooks/useCommunity";

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

type Props = {
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

export function CommunityJoinRequestsModal({
  isOpen,
  community,
  requests,
  isLoading,
  actionError,
  processingRequestId,
  onClose,
  onApprove,
  onReject,
}: Readonly<Props>) {
  if (!isOpen || !community) return null;

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
                          <Image
                            src={request.avatarUrl}
                            alt={`Avatar de ${displayName}`}
                            width={44}
                            height={44}
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
