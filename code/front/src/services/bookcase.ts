import { getAccessToken } from "./auth";
import { requiredBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type {
  BackendReadingStatus,
  BackendBookSuggestResponse,
  BackendBookResponse,
  BackendShelfSummaryResponse,
  BackendShelfResponse,
  BackendShelfItemSummaryResponse,
  BackendShelfItemResponse,
  BackendCollectionSummaryResponse,
  BackendCollectionResponse,
  BackendCollectionStatisticsResponse,
  BackendReviewResponse,
  BackendFeedPostResponse,
} from "@/types/api";

interface BackendPageResponse<T> {
  content: T[];
}

export class BookcaseApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "BookcaseApiError";
    this.status = status;
  }
}


function readCurrentUserIdFromToken(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const decodedPayload = JSON.parse(atob(paddedBase64)) as { sub?: string };
    const subject = Number(decodedPayload.sub);

    return Number.isFinite(subject) ? subject : null;
  } catch {
    return null;
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new BookcaseApiError(message || fallbackMessage, response.status);
  }

  return (await response.json()) as T;
}

async function ensureSuccessResponse(response: Response, fallbackMessage: string): Promise<void> {
  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new BookcaseApiError(message || fallbackMessage, response.status);
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.clone().json()) as { message?: string };
    return data.message ?? "";
  } catch {
    return "";
  }
}

export async function suggestBooks(query: string): Promise<BackendBookSuggestResponse[]> {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/books/suggest?q=${encodeURIComponent(normalized)}`);
  } catch {
    throw new BookcaseApiError("Não foi possível obter sugestões de livros.");
  }

  return parseJsonResponse<BackendBookSuggestResponse[]>(
    response,
    "Falha ao buscar sugestões de livros.",
  );
}

export async function searchBooks(query: string): Promise<BackendBookResponse[]> {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/books/search?q=${encodeURIComponent(normalized)}`);
  } catch {
    throw new BookcaseApiError("Não foi possível pesquisar livros.");
  }

  return parseJsonResponse<BackendBookResponse[]>(response, "Falha ao pesquisar livros.");
}

export async function getBookById(bookId: number): Promise<BackendBookResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/books/${bookId}`);
  } catch {
    throw new BookcaseApiError("Não foi possível carregar os detalhes do livro.");
  }

  return parseJsonResponse<BackendBookResponse>(response, "Falha ao carregar detalhes do livro.");
}

export async function listShelves(): Promise<BackendShelfSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar as estantes.");
  }

  return parseJsonResponse<BackendShelfSummaryResponse[]>(response, "Falha ao carregar estantes.");
}

export async function getShelfById(shelfId: number): Promise<BackendShelfResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar os detalhes da estante.");
  }

  return parseJsonResponse<BackendShelfResponse>(response, "Falha ao carregar os detalhes da estante.");
}

export async function createShelf(name: string, description = ""): Promise<BackendShelfResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves`, {
      method: "POST",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível criar uma estante para adicionar o livro.");
  }

  return parseJsonResponse<BackendShelfResponse>(response, "Falha ao criar estante.");
}

export async function updateShelf(
  shelfId: number,
  name: string,
  description = "",
): Promise<BackendShelfResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}`, {
      method: "PUT",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível atualizar a estante.");
  }

  return parseJsonResponse<BackendShelfResponse>(response, "Falha ao atualizar estante.");
}

export async function deleteShelf(shelfId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}`, {
      method: "DELETE",
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível apagar a estante.");
  }

  await ensureSuccessResponse(response, "Falha ao apagar estante.");
}

export async function listShelfItems(shelfId: number): Promise<BackendShelfItemSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar os itens da estante.");
  }

  return parseJsonResponse<BackendShelfItemSummaryResponse[]>(
    response,
    "Falha ao carregar itens da estante.",
  );
}

export async function getShelfItemById(shelfId: number, itemId: number): Promise<BackendShelfItemResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/${itemId}`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar o item da estante.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao carregar item da estante.");
}

export async function addBookToShelf(
  shelfId: number,
  bookId: number,
  initialStatus: BackendReadingStatus = "WANT_TO_READ",
): Promise<BackendShelfItemResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items`, {
      method: "POST",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId,
        initialStatus,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível adicionar o livro na estante.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao adicionar livro na estante.");
}

export async function removeBookFromShelf(shelfId: number, itemId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/${itemId}`, {
      method: "DELETE",
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível remover o livro da estante.");
  }

  await ensureSuccessResponse(response, "Falha ao remover livro da estante.");
}

export async function updateShelfItemProgress(
  shelfId: number,
  itemId: number,
  currentPage: number,
): Promise<BackendShelfItemResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/${itemId}/progress`, {
      method: "PATCH",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPage,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível atualizar o progresso de leitura.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao atualizar progresso de leitura.");
}

export async function changeShelfItemStatus(
  shelfId: number,
  itemId: number,
  newStatus: BackendReadingStatus,
): Promise<BackendShelfItemResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/${itemId}/status`, {
      method: "PATCH",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newStatus,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível atualizar o status do livro.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao atualizar status do livro.");
}

export async function listCollections(): Promise<BackendCollectionSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar as coleções.");
  }

  return parseJsonResponse<BackendCollectionSummaryResponse[]>(response, "Falha ao carregar coleções.");
}

export async function getCollectionById(collectionId: number): Promise<BackendCollectionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar os detalhes da coleção.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao carregar detalhes da coleção.");
}

export async function createCollection(
  name: string,
  description = "",
  initialShelfIds: number[] = [],
): Promise<BackendCollectionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections`, {
      method: "POST",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        initialShelfIds,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível criar a coleção.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao criar coleção.");
}

export async function updateCollection(
  collectionId: number,
  name: string,
  description = "",
): Promise<BackendCollectionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
      method: "PUT",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível atualizar a coleção.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao atualizar coleção.");
}

export async function addShelfToCollection(
  collectionId: number,
  shelfId: number,
): Promise<BackendCollectionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections/${collectionId}/shelves`, {
      method: "PATCH",
      headers: {
        ...requiredBearerHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shelfId,
      }),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível adicionar estante na coleção.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao vincular estante na coleção.");
}

export async function deleteCollection(collectionId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
      method: "DELETE",
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível apagar a coleção.");
  }

  await ensureSuccessResponse(response, "Falha ao apagar coleção.");
}

export async function getCollectionStatistics(
  collectionId: number,
): Promise<BackendCollectionStatisticsResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections/${collectionId}/statistics`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar as estatísticas da coleção.");
  }

  return parseJsonResponse<BackendCollectionStatisticsResponse>(
    response,
    "Falha ao carregar estatísticas da coleção.",
  );
}

export async function createBookReview(
  bookId: number,
  rating: number,
  text?: string,
): Promise<BackendReviewResponse> {
  const formData = new FormData();
  formData.append("bookId", String(bookId));
  formData.append("rating", String(rating));
  formData.append("publish", "true");
  formData.append("hasSpoiler", "false");
  if (typeof text === "string" && text.length > 0) {
    formData.append("text", text);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews`, {
      method: "POST",
      headers: requiredBearerHeaders(),
      body: formData,
    });
  } catch {
    throw new BookcaseApiError("Não foi possível registrar sua avaliação.");
  }

  return parseJsonResponse<BackendReviewResponse>(response, "Falha ao registrar avaliação.");
}

export async function updateBookReview(
  reviewId: number,
  rating: number,
  text: string,
): Promise<BackendReviewResponse> {
  const formData = new FormData();
  formData.append("rating", String(rating));
  formData.append("text", text);
  formData.append("hasSpoiler", "false");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews/${reviewId}`, {
      method: "PUT",
      headers: requiredBearerHeaders(),
      body: formData,
    });
  } catch {
    throw new BookcaseApiError("Não foi possível atualizar sua avaliação.");
  }

  return parseJsonResponse<BackendReviewResponse>(response, "Falha ao atualizar avaliação.");
}

export async function deleteBookReview(reviewId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews/${reviewId}`, {
      method: "DELETE",
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível excluir sua avaliação.");
  }

  if (!response.ok) {
    throw new BookcaseApiError("Falha ao excluir avaliação.", response.status);
  }
}

export async function getMyBookReview(bookId: number): Promise<BackendReviewResponse | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new BookcaseApiError("Usuário não autenticado.", 401);
  }

  const userId = readCurrentUserIdFromToken(accessToken);
  if (!userId) {
    throw new BookcaseApiError("Não foi possível identificar o usuário autenticado.", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews/user/${userId}?page=0&size=100&sort=createdAt,desc`, {
      headers: requiredBearerHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Não foi possível carregar sua avaliação.");
  }

  const page = await parseJsonResponse<BackendPageResponse<BackendReviewResponse>>(
    response,
    "Falha ao carregar avaliação.",
  );

  return page.content.find((review) => review.bookId === bookId) ?? null;
}

export async function createFeedPost(
  text: string,
  options?: { hasSpoiler?: boolean; tags?: string[]; bookId?: number; images?: File[]; gif?: File },
): Promise<BackendFeedPostResponse> {
  const normalizedText = text.trim();

  const formData = new FormData();
  if (normalizedText) {
    formData.append("text", normalizedText);
  }
  formData.append("hasSpoiler", String(Boolean(options?.hasSpoiler)));

  if (options?.bookId != null) {
    formData.append("bookId", String(options.bookId));
  }

  if (options?.tags && options.tags.length > 0) {
    options.tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .forEach((tag) => {
        formData.append("tags", tag);
      });
  }

  if (options?.images && options.images.length > 0) {
    options.images.forEach((img) => formData.append("images", img));
  }

  if (options?.gif) {
    formData.append("gif", options.gif);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/posts`, {
      method: "POST",
      headers: requiredBearerHeaders(),
      body: formData,
    });
  } catch {
    throw new BookcaseApiError("Não foi possível publicar no feed.");
  }

  return parseJsonResponse<BackendFeedPostResponse>(response, "Falha ao publicar no feed.");
}

export async function getActiveReadingDays(token?: string | null): Promise<number> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/me/active-reading-days`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : requiredBearerHeaders(),
    });
  } catch {
    return 0;
  }
  if (!response.ok) return 0;
  const data = (await response.json()) as { count: number };
  return data.count ?? 0;
}

