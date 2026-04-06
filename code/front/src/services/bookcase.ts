import { getAccessToken } from "./auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

type BackendReadingStatus =
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

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new BookcaseApiError(message || fallbackMessage, response.status);
  }

  return (await response.json()) as T;
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
