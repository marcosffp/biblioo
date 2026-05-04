"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken } from "@/services/auth";
import { getJwtUserId } from "@/utils/jwt";
import { getBookById, searchBooks } from "@/services/bookcase";
import {
  createCommunity,
  inviteUserToCommunity,
  joinCommunity,
  joinCommunityByInviteLink,
  listCommunities,
  requestCommunityJoin,
  type BackendCommunityResponse,
} from "@/services/community";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";

export interface Community {
  id: string;
  name: string;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  visibility: CommunityVisibility;
  members: number;
  discussions: number;
  isMember: boolean;
  ownerId?: string;
  coverUrl?: string;
  description?: string;
  createdAtLabel?: string;
}

export interface CommunityBookOption {
  id: number;
  title: string;
  author: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  isPro?: boolean;
  isAdmin?: boolean;
  role?: "OWNER" | "MODERATOR" | "MEMBER";
}

export interface CommunityChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  time: string;
  isMine?: boolean;
  isSystem?: boolean;
  isSpoiler?: boolean;
  heartCount?: number;
  hasHeartReaction?: boolean;
  images?: string[];
  gifUrl?: string | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  parentMessageId?: number | null;
}

interface CreateCommunityInput {
  name: string;
  description?: string;
  visibility: CommunityVisibility;
  bookId: number;
  selectedBook?: CommunityBookOption | null;
}

function toCreatedAtLabel(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

interface BookInfo {
  title: string;
  coverUrl?: string | null;
}

async function loadBookInfoById(bookIds: number[]): Promise<Map<number, BookInfo>> {
  const uniqueBookIds = Array.from(new Set(bookIds));
  const entries = await Promise.all(
    uniqueBookIds.map(async (bookId) => {
      try {
        const book = await getBookById(bookId);
        const author = book.authors?.join(", ") || "Autor desconhecido";
        return [bookId, { title: `${book.title} - ${author}`, coverUrl: book.coverUrl }] as const;
      } catch {
        return [bookId, { title: `Livro #${bookId}` }] as const;
      }
    }),
  );

  return new Map(entries);
}

function mapToCommunity(
  apiCommunity: BackendCommunityResponse,
  context: {
    mineIds: Set<number>;
    bookInfoById: Map<number, BookInfo>;
    fallbackBookTitleById?: Map<number, string>;
    currentUserId: string | null;
  },
): Community {
  const bookInfo = context.bookInfoById.get(apiCommunity.bookId);
  const fallbackTitle = context.fallbackBookTitleById?.get(apiCommunity.bookId);
  const bookTitle = bookInfo?.title ?? fallbackTitle ?? `Livro #${apiCommunity.bookId}`;

  return {
    id: String(apiCommunity.id),
    name: apiCommunity.name,
    bookId: apiCommunity.bookId,
    bookTitle,
    bookCoverUrl: bookInfo?.coverUrl,
    visibility: apiCommunity.type,
    members: apiCommunity.memberCount ?? 0,
    discussions: 0,
    isMember: context.mineIds.has(apiCommunity.id),
    ownerId: String(apiCommunity.ownerId),
    description: apiCommunity.description ?? undefined,
    createdAtLabel: toCreatedAtLabel(apiCommunity.createdAt),
  };
}

function decodeCurrentUserId(): string | null {
  const token = getAccessToken();
  return token ? getJwtUserId(token) : null;
}

export function useCommunity() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [pendingJoinRequestIds, setPendingJoinRequestIds] = useState<Set<string>>(new Set());
  const [communitiesError, setCommunitiesError] = useState("");

  const currentUserId = useMemo(() => decodeCurrentUserId(), []);

  const refreshCommunities = useCallback(async () => {
    setIsLoadingCommunities(true);
    setCommunitiesError("");

    try {
      const [mine, discover] = await Promise.all([
        listCommunities({ mine: true, page: 0, size: 30 }),
        listCommunities({ mine: false, page: 0, size: 30 }),
      ]);

      const mineIds = new Set<number>(mine.map((item) => item.id));
      const merged = new Map<number, BackendCommunityResponse>();

      [...mine, ...discover].forEach((community) => {
        if (!merged.has(community.id)) {
          merged.set(community.id, community);
        }
      });

      const mergedList = Array.from(merged.values());
      const bookInfoById = await loadBookInfoById(mergedList.map((item) => item.bookId));

      setCommunities(
        mergedList.map((community) =>
          mapToCommunity(community, {
            mineIds,
            bookInfoById,
            currentUserId,
          }),
        ),
      );
    } catch (error) {
      setCommunitiesError(getErrorMessage(error, "Não foi possível carregar comunidades."));
      setCommunities([]);
    } finally {
      setIsLoadingCommunities(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void refreshCommunities();
  }, [refreshCommunities]);

  const createNewCommunity = useCallback(
    async ({ name, description, visibility, bookId, selectedBook }: CreateCommunityInput) => {
      setIsSubmittingCreate(true);

      try {
        const created = await createCommunity({
          name,
          description,
          type: visibility,
          bookId,
        });

        const fallbackBookTitleById = new Map<number, string>();
        if (selectedBook) {
          fallbackBookTitleById.set(
            selectedBook.id,
            `${selectedBook.title} - ${selectedBook.author}`,
          );
        }

        const bookInfoById = await loadBookInfoById([created.bookId]);
        const mapped = mapToCommunity(created, {
          mineIds: new Set<number>([created.id]),
          bookInfoById,
          fallbackBookTitleById,
          currentUserId,
        });

        setCommunities((current) => {
          const withoutCreated = current.filter((item) => item.id !== mapped.id);
          return [mapped, ...withoutCreated];
        });

        return mapped;
      } catch (error) {
        throw new Error(getErrorMessage(error, "Não foi possível criar a comunidade."));
      } finally {
        setIsSubmittingCreate(false);
      }
    },
    [currentUserId],
  );

  const searchBookOptions = useCallback(async (query: string): Promise<CommunityBookOption[]> => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      return [];
    }

    try {
      const result = await searchBooks(normalized);
      return result.slice(0, 15).map((book) => ({
        id: book.id,
        title: book.title,
        author: book.authors?.join(", ") || "Autor desconhecido",
      }));
    } catch {
      return [];
    }
  }, []);

  const joinPublicCommunity = useCallback(async (communityId: string) => {
    const parsedId = Number(communityId);

    if (!Number.isFinite(parsedId)) {
      throw new TypeError("Comunidade invalida.");
    }

    try {
      await joinCommunity(parsedId);

      setCommunities((current) =>
        current.map((community) => {
          if (community.id !== communityId) {
            return community;
          }

          return {
            ...community,
            isMember: true,
            members: community.members + 1,
          };
        }),
      );

      setPendingJoinRequestIds((current) => {
        if (!current.has(communityId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(communityId);
        return next;
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel entrar na comunidade."));
    }
  }, []);

  const requestPrivateCommunityJoin = useCallback(async (communityId: string) => {
    const parsedId = Number(communityId);

    if (!Number.isFinite(parsedId)) {
      throw new TypeError("Comunidade invalida.");
    }

    try {
      await requestCommunityJoin(parsedId);

      setPendingJoinRequestIds((current) => {
        const next = new Set(current);
        next.add(communityId);
        return next;
      });
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel solicitar entrada na comunidade.");

      if (message.toLowerCase().includes("solicitacao pendente")) {
        setPendingJoinRequestIds((current) => {
          const next = new Set(current);
          next.add(communityId);
          return next;
        });
      }

      throw new Error(message);
    }
  }, []);

  const joinPrivateCommunityByInviteCode = useCallback(async (communityId: string, inviteToken: string) => {
    const parsedId = Number(communityId);

    if (!Number.isFinite(parsedId)) {
      throw new TypeError("Comunidade invalida.");
    }

    try {
      await joinCommunityByInviteLink(inviteToken);

      setCommunities((current) =>
        current.map((community) => {
          if (community.id !== communityId) {
            return community;
          }

          return {
            ...community,
            isMember: true,
            members: community.members + 1,
          };
        }),
      );

      setPendingJoinRequestIds((current) => {
        if (!current.has(communityId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(communityId);
        return next;
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel entrar na comunidade com o codigo."));
    }
  }, []);

  const inviteUser = useCallback(async (communityId: string, inviteeId: number) => {
    const parsedCommunityId = Number(communityId);

    if (!Number.isFinite(parsedCommunityId)) {
      throw new TypeError("Comunidade invalida.");
    }

    if (!Number.isFinite(inviteeId)) {
      throw new TypeError("Usuario invalido.");
    }

    try {
      await inviteUserToCommunity(parsedCommunityId, inviteeId);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel enviar o convite."));
    }
  }, []);

  return {
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
    inviteUser,
    pendingJoinRequestIds,
    currentUserId,
  };
}
