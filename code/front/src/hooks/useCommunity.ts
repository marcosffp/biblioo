import { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken } from "@/services/auth";
import { getBookById, searchBooks } from "@/services/bookcase";
import {
  createCommunity,
  listCommunities,
  type BackendCommunityResponse,
} from "@/services/community";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";

export interface Community {
  id: string;
  name: string;
  bookId: number;
  bookTitle: string;
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
  isPro?: boolean;
  isAdmin?: boolean;
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

async function loadBookTitlesById(bookIds: number[]): Promise<Map<number, string>> {
  const uniqueBookIds = Array.from(new Set(bookIds));
  const entries = await Promise.all(
    uniqueBookIds.map(async (bookId) => {
      try {
        const book = await getBookById(bookId);
        const author = book.authors?.join(", ") || "Autor desconhecido";
        return [bookId, `${book.title} - ${author}`] as const;
      } catch {
        return [bookId, `Livro #${bookId}`] as const;
      }
    }),
  );

  return new Map(entries);
}

function mapToCommunity(
  apiCommunity: BackendCommunityResponse,
  context: {
    mineIds: Set<number>;
    bookTitlesById: Map<number, string>;
    fallbackBookTitleById?: Map<number, string>;
    currentUserId: string | null;
  },
): Community {
  const fallbackTitle = context.fallbackBookTitleById?.get(apiCommunity.bookId);
  const bookTitle =
    context.bookTitlesById.get(apiCommunity.bookId) ?? fallbackTitle ?? `Livro #${apiCommunity.bookId}`;

  return {
    id: String(apiCommunity.id),
    name: apiCommunity.name,
    bookId: apiCommunity.bookId,
    bookTitle,
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

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = JSON.parse(atob(paddedBase64)) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export function useCommunity() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
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
      const bookTitlesById = await loadBookTitlesById(mergedList.map((item) => item.bookId));

      setCommunities(
        mergedList.map((community) =>
          mapToCommunity(community, {
            mineIds,
            bookTitlesById,
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

        const bookTitlesById = await loadBookTitlesById([created.bookId]);
        const mapped = mapToCommunity(created, {
          mineIds: new Set<number>([created.id]),
          bookTitlesById,
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

  return {
    communities,
    isLoadingCommunities,
    communitiesError,
    isSubmittingCreate,
    refreshCommunities,
    createNewCommunity,
    searchBookOptions,
    currentUserId,
  };
}
