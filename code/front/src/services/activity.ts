import { optionalBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type { ActivityPost, ActivityReview } from "@/types/api";

interface PostApiResponse {
  id: number;
  userId: number;
  bookId?: number | null;
  text?: string | null;
  images?: string[];
  gifUrl?: string | null;
  tags?: string[];
  hasSpoiler?: boolean;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  likedByCurrentUser?: boolean;
}

interface ReviewApiResponse {
  id: number;
  userId: number;
  bookId?: number | null;
  text?: string | null;
  rating: number;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  likedByCurrentUser?: boolean;
}

interface ApiPage<T> {
  content: T[];
  last?: boolean;
  totalPages?: number;
  number?: number;
}

export class ActivityApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ActivityApiError";
    this.status = status;
  }
}


export async function getUserActivityPosts(
  userId: number,
  page = 0,
  size = 10,
  token?: string | null,
): Promise<{ items: ActivityPost[]; hasMore: boolean }> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/feed/posts/user/${userId}?page=${page}&size=${size}`,
      { headers: optionalBearerHeaders(token) },
    );
  } catch {
    throw new ActivityApiError("Não foi possível carregar os posts.");
  }

  if (!response.ok) throw new ActivityApiError("Falha ao carregar posts.", response.status);

  const data = (await response.json()) as ApiPage<PostApiResponse>;
  const items: ActivityPost[] = (data.content ?? []).map((p) => ({
    type: "POST" as const,
    id: p.id,
    userId: p.userId,
    bookId: p.bookId ?? null,
    text: p.text ?? null,
    images: p.images ?? [],
    gifUrl: p.gifUrl ?? null,
    tags: p.tags ?? [],
    hasSpoiler: p.hasSpoiler ?? false,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    createdAt: p.createdAt ?? new Date(0).toISOString(),
    likedByCurrentUser: p.likedByCurrentUser ?? false,
  }));

  return { items, hasMore: data.last === false };
}

export async function getUserActivityReviews(
  userId: number,
  page = 0,
  size = 10,
  token?: string | null,
): Promise<{ items: ActivityReview[]; hasMore: boolean }> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/feed/reviews/user/${userId}?page=${page}&size=${size}`,
      { headers: optionalBearerHeaders(token) },
    );
  } catch {
    throw new ActivityApiError("Não foi possível carregar as avaliações.");
  }

  if (!response.ok) throw new ActivityApiError("Falha ao carregar avaliações.", response.status);

  const data = (await response.json()) as ApiPage<ReviewApiResponse>;
  const items: ActivityReview[] = (data.content ?? []).map((r) => ({
    type: "REVIEW" as const,
    id: r.id,
    userId: r.userId,
    bookId: r.bookId ?? null,
    text: r.text ?? null,
    rating: r.rating,
    likeCount: r.likeCount ?? 0,
    commentCount: r.commentCount ?? 0,
    createdAt: r.createdAt ?? new Date(0).toISOString(),
    likedByCurrentUser: r.likedByCurrentUser ?? false,
  }));

  return { items, hasMore: data.last === false };
}
