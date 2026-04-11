import { getAccessToken } from "./auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export type BackendReadingStatus =
  | "WANT_TO_READ"
  | "READING"
  | "REREADING"
  | "COMPLETED"
  | "ABANDONED";

export interface BackendBookSuggestResponse {
  id: number;
  title: string;
  authors: string[];
  coverUrl?: string | null;
}

export interface BackendBookResponse {
  id: number;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  pageCount?: number | null;
  averageRating?: number | null;
}

export interface BackendShelfSummaryResponse {
  id: number;
  name: string;
  itemCount: number;
  coverPreview: string[];
}

export interface BackendShelfResponse {
  id: number;
  name: string;
  description?: string | null;
  itemCount: number;
  coverPreview: string[];
}

export interface BackendShelfItemSummaryResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  status: BackendReadingStatus;
  progressPercent?: number | null;
}

export interface BackendShelfItemResponse {
  id: number;
  shelfId: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  status: BackendReadingStatus;
  currentPage?: number | null;
  totalPages?: number | null;
  progressPercent?: number | null;
}

export interface BackendCollectionSummaryResponse {
  id: number;
  name: string;
  shelfCount: number;
  shelfPreviews: BackendCollectionShelfPreview[];
}

export interface BackendCollectionShelfPreview {
  id: number;
  name: string;
  itemCount: number;
  firstBookCoverUrl?: string | null;
}

export interface BackendCollectionResponse {
  id: number;
  name: string;
  description?: string | null;
  shelfCount: number;
  shelfPreviews: BackendCollectionShelfPreview[];
}

export interface BackendReviewResponse {
  id: number;
  userId: number;
  bookId: number;
  text?: string | null;
  images: string[];
  gifUrl?: string | null;
  tags: string[];
  hasSpoiler?: boolean | null;
  rating: number;
  commentCount: number;
  likeCount: number;
}

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

function buildAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new BookcaseApiError("Usuario nao autenticado.", 401);
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function readCurrentUserIdFromToken(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
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
    throw new BookcaseApiError("Nao foi possivel obter sugestoes de livros.");
  }

  return parseJsonResponse<BackendBookSuggestResponse[]>(
    response,
    "Falha ao buscar sugestoes de livros.",
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
    throw new BookcaseApiError("Nao foi possivel pesquisar livros.");
  }

  return parseJsonResponse<BackendBookResponse[]>(response, "Falha ao pesquisar livros.");
}

export async function getBookById(bookId: number): Promise<BackendBookResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/books/${bookId}`);
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar os detalhes do livro.");
  }

  return parseJsonResponse<BackendBookResponse>(response, "Falha ao carregar detalhes do livro.");
}

export async function listShelves(): Promise<BackendShelfSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar as estantes.");
  }

  return parseJsonResponse<BackendShelfSummaryResponse[]>(response, "Falha ao carregar estantes.");
}

export async function getShelfById(shelfId: number): Promise<BackendShelfResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar os detalhes da estante.");
  }

  return parseJsonResponse<BackendShelfResponse>(response, "Falha ao carregar os detalhes da estante.");
}

export async function createShelf(name: string, description = ""): Promise<BackendShelfResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves`, {
      method: "POST",
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel criar uma estante para adicionar o livro.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel atualizar a estante.");
  }

  return parseJsonResponse<BackendShelfResponse>(response, "Falha ao atualizar estante.");
}

export async function deleteShelf(shelfId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel apagar a estante.");
  }

  await ensureSuccessResponse(response, "Falha ao apagar estante.");
}

export async function listShelfItems(shelfId: number): Promise<BackendShelfItemSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar os itens da estante.");
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
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar o item da estante.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId,
        initialStatus,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel adicionar o livro na estante.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao adicionar livro na estante.");
}

export async function removeBookFromShelf(shelfId: number, itemId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/${itemId}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel remover o livro da estante.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPage,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel atualizar o progresso de leitura.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newStatus,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel atualizar o status do livro.");
  }

  return parseJsonResponse<BackendShelfItemResponse>(response, "Falha ao atualizar status do livro.");
}

export async function listCollections(): Promise<BackendCollectionSummaryResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/collections`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar as colecoes.");
  }

  return parseJsonResponse<BackendCollectionSummaryResponse[]>(response, "Falha ao carregar colecoes.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        initialShelfIds,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel criar a colecao.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao criar colecao.");
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
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shelfId,
      }),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel adicionar estante na colecao.");
  }

  return parseJsonResponse<BackendCollectionResponse>(response, "Falha ao vincular estante na colecao.");
}

export async function createBookReview(
  bookId: number,
  rating: number,
  text?: string,
): Promise<BackendReviewResponse> {
  const formData = new FormData();
  formData.append("bookId", String(bookId));
  formData.append("rating", String(rating));
  if (typeof text === "string" && text.length > 0) {
    formData.append("text", text);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: formData,
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel registrar sua avaliacao.");
  }

  return parseJsonResponse<BackendReviewResponse>(response, "Falha ao registrar avaliacao.");
}

export async function updateBookReview(
  reviewId: number,
  rating: number,
  text?: string,
): Promise<BackendReviewResponse> {
  const formData = new FormData();
  formData.append("rating", String(rating));
  formData.append("text", text ?? "");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews/${reviewId}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: formData,
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel atualizar sua avaliacao.");
  }

  return parseJsonResponse<BackendReviewResponse>(response, "Falha ao atualizar avaliacao.");
}

export async function getMyBookReview(bookId: number): Promise<BackendReviewResponse | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new BookcaseApiError("Usuario nao autenticado.", 401);
  }

  const userId = readCurrentUserIdFromToken(accessToken);
  if (!userId) {
    throw new BookcaseApiError("Nao foi possivel identificar o usuario autenticado.", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/feed/reviews/user/${userId}?page=0&size=100&sort=createdAt,desc`, {
      headers: buildAuthHeaders(),
    });
  } catch {
    throw new BookcaseApiError("Nao foi possivel carregar sua avaliacao.");
  }

  const page = await parseJsonResponse<BackendPageResponse<BackendReviewResponse>>(
    response,
    "Falha ao carregar avaliacao.",
  );

  return page.content.find((review) => review.bookId === bookId) ?? null;
}
