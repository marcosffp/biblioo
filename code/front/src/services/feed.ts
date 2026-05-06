import { getAccessToken } from "./auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export interface FeedEmbeddedContent {
  id: number;
  userId: number;
  text?: string | null;
  images: string[];
  gifUrl?: string | null;
  tags: string[];
  hasSpoiler?: boolean | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  bookId?: number | null;
  rating?: number | null;
  bookTitle?: string | null;
  bookAuthors?: string[] | null;
  bookCoverUrl?: string | null;
}

export interface FeedItem {
  contentId: number;
  contentType: "REVIEW" | "POST";
  authorId: number;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  score: number;
  createdAt: string;
  content: FeedEmbeddedContent;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export class FeedApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "FeedApiError";
    this.status = status;
  }
}

function readUserIdFromToken(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = JSON.parse(atob(padded)) as { sub?: string };
    const id = Number(decoded.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): number | null {
  const token = getAccessToken();
  return token ? readUserIdFromToken(token) : null;
}

export async function getFeed(cursor?: string | null, size = 20): Promise<FeedPage> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);

  const userId = readUserIdFromToken(token);
  if (!userId) throw new FeedApiError("Não foi possível identificar o usuário.", 401);

  const params = new URLSearchParams({ userId: String(userId), size: String(size) });
  if (cursor) params.set("cursor", cursor);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new FeedApiError("Não foi possível carregar o feed.");
  }

  if (!response.ok) {
    throw new FeedApiError("Falha ao carregar o feed.", response.status);
  }

  return (await response.json()) as FeedPage;
}

export interface CommentData {
  id: number;
  userId: number;
  parentId: number;
  text: string;
  likeCount: number;
  createdAt: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  deleted?: boolean;
}

export interface CommentPage {
  content: CommentData[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number;
  size: number;
}

export async function togglePostLike(postId: number): Promise<{ liked: boolean }> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new FeedApiError("Falha ao curtir o post.", response.status);
  return (await response.json()) as { liked: boolean };
}

export async function toggleReviewLike(reviewId: number): Promise<{ liked: boolean }> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const response = await fetch(`${API_BASE_URL}/feed/reviews/${reviewId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new FeedApiError("Falha ao curtir a avaliação.", response.status);
  return (await response.json()) as { liked: boolean };
}

export async function getPostComments(postId: number, page = 0): Promise<CommentPage> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(
    `${API_BASE_URL}/feed/posts/${postId}/comments?page=${page}&size=10`,
    { headers },
  );
  if (!response.ok) throw new FeedApiError("Falha ao carregar comentários.", response.status);
  return (await response.json()) as CommentPage;
}

export async function getReviewComments(reviewId: number, page = 0): Promise<CommentPage> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(
    `${API_BASE_URL}/feed/reviews/${reviewId}/comments?page=${page}&size=10`,
    { headers },
  );
  if (!response.ok) throw new FeedApiError("Falha ao carregar comentários.", response.status);
  return (await response.json()) as CommentPage;
}

export async function createPostComment(postId: number, text: string): Promise<CommentData> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const form = new FormData();
  form.set("text", text);
  const response = await fetch(`${API_BASE_URL}/feed/posts/${postId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) throw new FeedApiError("Falha ao enviar comentário.", response.status);
  return (await response.json()) as CommentData;
}

export async function createReviewComment(reviewId: number, text: string): Promise<CommentData> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const form = new FormData();
  form.set("text", text);
  const response = await fetch(`${API_BASE_URL}/feed/reviews/${reviewId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) throw new FeedApiError("Falha ao enviar comentário.", response.status);
  return (await response.json()) as CommentData;
}

export async function deleteComment(commentId: number): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new FeedApiError("Falha ao excluir o comentário.", response.status);
}

export async function toggleCommentLike(commentId: number): Promise<{ liked: boolean }> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new FeedApiError("Falha ao curtir o comentário.", response.status);
  return (await response.json()) as { liked: boolean };
}

export async function getCommentReplies(commentId: number, page = 0): Promise<CommentPage> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(
    `${API_BASE_URL}/feed/comments/${commentId}/replies?page=${page}&size=5`,
    { headers },
  );
  if (!response.ok) throw new FeedApiError("Falha ao carregar respostas.", response.status);
  return (await response.json()) as CommentPage;
}

export async function createCommentReply(commentId: number, text: string): Promise<CommentData> {
  const token = getAccessToken();
  if (!token) throw new FeedApiError("Usuário não autenticado.", 401);
  const params = new URLSearchParams({ text });
  const response = await fetch(`${API_BASE_URL}/feed/comments/${commentId}/replies?${params.toString()}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new FeedApiError("Falha ao enviar resposta.", response.status);
  return (await response.json()) as CommentData;
}

export function formatFeedTime(createdAt: string): string {
  try {
    const created = new Date(createdAt);
    const diffMs = Date.now() - created.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
  } catch {
    return "";
  }
}
