import { useCallback, useEffect, useRef, useState } from "react";
import {
  type VotingResponse,
  type VotingEventPayload,
  type CreateVotingRequest,
  getVotings,
  createVoting,
  publishVoting,
  castVote,
  closeVoting,
  approveVoting,
  rejectVoting,
} from "@/services/voting";

const STATUS_PRIORITY = ["ACTIVE", "DRAFT", "CLOSED", "APPROVED", "REJECTED"] as const;

function topVoting(list: VotingResponse[]): VotingResponse | null {
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status),
  )[0] ?? null;
}

export function useVoting(communityId: string, lastVotingEvent: VotingEventPayload | null) {
  const [voting, setVoting] = useState<VotingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const communityIdNumber = Number(communityId);
  const myVotedOptionIdRef = useRef<number | null>(null);

  const fetchVoting = useCallback(async () => {
    if (!Number.isFinite(communityIdNumber)) return;
    try {
      const page = await getVotings(communityIdNumber);
      const best = topVoting(page.content);
      if (best?.myVotedOptionId != null) {
        myVotedOptionIdRef.current = best.myVotedOptionId;
      }
      setVoting(best);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar votação.");
    } finally {
      setIsLoading(false);
    }
  }, [communityIdNumber]);

  useEffect(() => {
    void fetchVoting();
  }, [fetchVoting]);

  // Merge real-time events — preserve myVotedOptionId (not broadcast for privacy)
  useEffect(() => {
    if (!lastVotingEvent) return;
    const incoming = lastVotingEvent.data;
    setVoting((current) => {
      const merged = {
        ...incoming,
        myVotedOptionId: incoming.myVotedOptionId ?? myVotedOptionIdRef.current,
      };
      if (!current) return merged;
      // Always replace if same voting
      if (current.id === incoming.id) return merged;
      // Replace if incoming has higher priority
      const incomingRank = STATUS_PRIORITY.indexOf(incoming.status);
      const currentRank = STATUS_PRIORITY.indexOf(current.status);
      return incomingRank <= currentRank ? merged : current;
    });
  }, [lastVotingEvent]);

  const withAction = useCallback(async (fn: () => Promise<VotingResponse>) => {
    setIsActing(true);
    setError(null);
    try {
      const updated = await fn();
      if (updated.myVotedOptionId != null) {
        myVotedOptionIdRef.current = updated.myVotedOptionId;
      }
      setVoting(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operação falhou.");
    } finally {
      setIsActing(false);
    }
  }, []);

  const handleVote = useCallback(
    (optionId: number) =>
      withAction(() => castVote(communityIdNumber, voting!.id, optionId)),
    [communityIdNumber, voting, withAction],
  );

  const handlePublish = useCallback(
    () => withAction(() => publishVoting(communityIdNumber, voting!.id)),
    [communityIdNumber, voting, withAction],
  );

  const handleClose = useCallback(
    () => withAction(() => closeVoting(communityIdNumber, voting!.id)),
    [communityIdNumber, voting, withAction],
  );

  const handleApprove = useCallback(
    (winnerOptionId?: number) =>
      withAction(() => approveVoting(communityIdNumber, voting!.id, winnerOptionId)),
    [communityIdNumber, voting, withAction],
  );

  const handleReject = useCallback(
    (reason: string) =>
      withAction(() => rejectVoting(communityIdNumber, voting!.id, reason)),
    [communityIdNumber, voting, withAction],
  );

  const handleCreate = useCallback(
    async (request: CreateVotingRequest) => {
      setIsActing(true);
      setError(null);
      try {
        const created = await createVoting(communityIdNumber, request);
        setVoting(created);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao criar votação.");
        throw e;
      } finally {
        setIsActing(false);
      }
    },
    [communityIdNumber],
  );

  return {
    voting,
    isLoading,
    error,
    isActing,
    refetch: fetchVoting,
    onVote: handleVote,
    onPublish: handlePublish,
    onClose: handleClose,
    onApprove: handleApprove,
    onReject: handleReject,
    onCreate: handleCreate,
  };
}
