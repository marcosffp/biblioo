"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Plus,
  Trophy,
  XCircle,
} from "lucide-react";
import type { VotingResponse, VotingOptionResponse, CreateVotingRequest } from "@/types/api";
import { CreateVotingModal } from "./CreateVotingModal";

interface VotingPanelProps {
  voting: VotingResponse | null;
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
  isActing: boolean;
  onVote: (optionId: number) => Promise<void>;
  onPublish: () => Promise<void>;
  onClose: () => Promise<void>;
  onApprove: (winnerOptionId?: number) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onCreate: (request: CreateVotingRequest) => Promise<void>;
}

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Encerrada";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d restantes`;
  if (h > 0) return `${h}h ${m}min restantes`;
  return `${m}min restantes`;
}

function VotingOptionRow({
  option,
  total,
  myVotedOptionId,
  isActive,
  isActing,
  onVote,
}: Readonly<{
  option: VotingOptionResponse;
  total: number;
  myVotedOptionId: number | null;
  isActive: boolean;
  isActing: boolean;
  onVote: (id: number) => void;
}>) {
  const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0;
  const isVoted = myVotedOptionId === option.id;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-sm">
      <div
        className="absolute inset-y-0 left-0 bg-emerald-50 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
      <div className="relative flex items-center gap-3 px-3 py-2.5">
        {option.bookCoverUrl ? (
          <Image
            src={option.bookCoverUrl}
            alt={option.bookTitle}
            width={32}
            height={48}
            className="h-12 w-8 rounded object-cover shrink-0 shadow-sm"
          />
        ) : (
          <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-muted">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{option.bookTitle}</p>
          <p className="text-xs text-muted-foreground">
            {option.voteCount} {option.voteCount === 1 ? "voto" : "votos"} · {pct}%
          </p>
        </div>

        {isActive && (
          <button
            type="button"
            disabled={isActing}
            onClick={() => onVote(option.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              isVoted
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-white text-foreground hover:border-emerald-400 hover:bg-emerald-50"
            }`}
          >
            {isVoted ? "Votado ✓" : "Votar"}
          </button>
        )}
      </div>
    </div>
  );
}

function RejectModal({
  onConfirm,
  onCancel,
}: Readonly<{ onConfirm: (reason: string) => void; onCancel: () => void }>) {
  const [reason, setReason] = React.useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white shadow-xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Rejeitar resultado</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição..."
          rows={3}
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
}

export function VotingPanel({
  voting,
  isLoading,
  error,
  isOwner,
  isActing,
  onVote,
  onPublish,
  onClose,
  onApprove,
  onReject,
  onCreate,
}: Readonly<VotingPanelProps>) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = React.useState<number | null>(null);

  const totalVotes = voting?.options.reduce((s, o) => s + o.voteCount, 0) ?? 0;
  const winner = voting?.options.find((o) => o.id === voting.winnerOptionId);

  const needsAdminChoice =
    voting?.status === "CLOSED" &&
    voting.tieBreakRule === "ADMIN_CHOICE" &&
    voting.winnerOptionId === null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando votação...
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>
    );
  }

  // No voting exists
  if (!voting) {
    if (!isOwner) {
      return (
        <div className="px-4 py-4 text-sm text-muted-foreground text-center">
          Nenhuma votação ativa no momento.
        </div>
      );
    }
    return (
      <>
        <div className="flex flex-col items-center gap-3 py-5 px-4">
          <p className="text-sm text-muted-foreground text-center">
            Crie uma votação para a comunidade escolher o próximo livro.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar votação
          </button>
        </div>
        {showCreateModal && (
          <CreateVotingModal onClose={() => setShowCreateModal(false)} onSubmit={onCreate} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-3 space-y-3">
        {/* Header da votação */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-0.5">
              {voting.status === "DRAFT" && "Rascunho"}
              {voting.status === "ACTIVE" && "Votação em andamento"}
              {voting.status === "CLOSED" && "Votação encerrada"}
              {voting.status === "APPROVED" && "Resultado aprovado"}
              {voting.status === "REJECTED" && "Resultado rejeitado"}
            </p>
            <h3 className="text-sm font-semibold text-foreground truncate">{voting.title}</h3>
            {voting.status === "ACTIVE" && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeRemaining(voting.endsAt)}
              </div>
            )}
          </div>

          {/* Owner actions — inline */}
          <div className="flex shrink-0 items-center gap-2">
            {voting.status === "DRAFT" && isOwner && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => void onPublish()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isActing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Publicar
              </button>
            )}
            {voting.status === "ACTIVE" && isOwner && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => void onClose()}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
              >
                Encerrar
              </button>
            )}
            {isOwner && (voting.status === "APPROVED" || voting.status === "REJECTED") && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Nova votação
              </button>
            )}
          </div>
        </div>

        {/* APPROVED: winner destaque */}
        {voting.status === "APPROVED" && winner && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
            <Trophy className="h-5 w-5 text-emerald-600 shrink-0" />
            {winner.bookCoverUrl && (
              <Image src={winner.bookCoverUrl} alt={winner.bookTitle} width={32} height={48} className="h-12 w-8 rounded object-cover shadow-sm shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-700">Próxima leitura</p>
              <p className="text-sm font-bold text-foreground truncate">{winner.bookTitle}</p>
            </div>
          </div>
        )}

        {/* REJECTED: motivo */}
        {voting.status === "REJECTED" && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{voting.rejectionReason ?? "Resultado rejeitado."}</p>
          </div>
        )}

        {/* Options */}
        {(voting.status === "DRAFT" || voting.status === "ACTIVE" || voting.status === "CLOSED") && (
          <div className="space-y-2">
            {voting.options.map((option) => (
              <VotingOptionRow
                key={option.id}
                option={option}
                total={totalVotes}
                myVotedOptionId={voting.myVotedOptionId}
                isActive={voting.status === "ACTIVE"}
                isActing={isActing}
                onVote={(id) => void onVote(id)}
              />
            ))}
          </div>
        )}

        {/* CLOSED: owner actions */}
        {voting.status === "CLOSED" && isOwner && (
          <div className="space-y-2 pt-1">
            {needsAdminChoice && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Empate — escolha o livro vencedor:</p>
                <div className="relative">
                  <select
                    value={selectedWinnerId ?? ""}
                    onChange={(e) => setSelectedWinnerId(Number(e.target.value) || null)}
                    className="w-full appearance-none rounded-lg border border-border px-3 py-2 text-sm pr-8 outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="">Selecione o vencedor</option>
                    {voting.options.map((o) => (
                      <option key={o.id} value={o.id}>{o.bookTitle} ({o.voteCount} votos)</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isActing || (needsAdminChoice && !selectedWinnerId)}
                onClick={() => void onApprove(selectedWinnerId ?? undefined)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar resultado
              </button>
              <button
                type="button"
                disabled={isActing}
                onClick={() => setShowRejectModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Rejeitar
              </button>
            </div>
          </div>
        )}

        {/* CLOSED: winner (se não admin_choice tie) */}
        {voting.status === "CLOSED" && !needsAdminChoice && winner && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-muted-foreground">Provável vencedor:</span>
            <span className="font-semibold text-foreground truncate">{winner.bookTitle}</span>
          </div>
        )}

        {/* Total de votos */}
        {(voting.status === "ACTIVE" || voting.status === "CLOSED") && (
          <p className="text-right text-xs text-muted-foreground">
            {totalVotes} {totalVotes === 1 ? "voto" : "votos"} no total
          </p>
        )}
      </div>

      {showCreateModal && (
        <CreateVotingModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (req) => {
            await onCreate(req);
            setShowCreateModal(false);
          }}
        />
      )}

      {showRejectModal && (
        <RejectModal
          onConfirm={async (reason) => {
            setShowRejectModal(false);
            await onReject(reason);
          }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </>
  );
}

export default VotingPanel;
