import { getAccessToken } from "./auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export interface RecommendedBook {
  id: number;
  title: string;
  description?: string | null;
  pageCount?: number | null;
  readerCount?: number | null;
  averageRating?: number | null;
  coverUrl?: string | null;
  score?: number;
}

export interface DiceRollBook {
  id: number;
  title: string;
  description?: string | null;
  pageCount?: number | null;
  readerCount?: number | null;
  averageRating?: number | null;
  coverUrl?: string | null;
}

export interface BecauseYouReadData {
  seedBookTitle: string;
  books: RecommendedBook[];
}

export interface FavoriteGenreNowData {
  topGenres: string[];
  books: RecommendedBook[];
}

export interface TrendingInCommunitiesData {
  books: RecommendedBook[];
}

export interface CatalogSurpriseData {
  books: RecommendedBook[];
}

export interface SimilarAuthorsData {
  books: RecommendedBook[];
}

export interface RereadWorthItData {
  books: RecommendedBook[];
}

export class RecommendationApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RecommendationApiError";
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) throw new RecommendationApiError("Usuário não autenticado.", 401);
  return { Authorization: `Bearer ${token}` };
}

async function fetchRecommendation<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: authHeaders(),
    });
  } catch {
    throw new RecommendationApiError("Não foi possível conectar ao servidor.");
  }
  if (!response.ok) {
    throw new RecommendationApiError(`Falha ao carregar recomendações.`, response.status);
  }
  return (await response.json()) as T;
}

export async function rollDice(): Promise<DiceRollBook> {
  return fetchRecommendation<DiceRollBook>("/roll-dice");
}

export async function getBecauseYouRead(): Promise<BecauseYouReadData> {
  return fetchRecommendation<BecauseYouReadData>("/recommendations/because-you-read");
}

export async function getFavoriteGenreNow(): Promise<FavoriteGenreNowData> {
  return fetchRecommendation<FavoriteGenreNowData>("/recommendations/favorite-genre-now");
}

export async function getTrendingInCommunities(): Promise<TrendingInCommunitiesData> {
  return fetchRecommendation<TrendingInCommunitiesData>("/recommendations/trending-in-communities");
}

export async function getCatalogSurprise(): Promise<CatalogSurpriseData> {
  return fetchRecommendation<CatalogSurpriseData>("/recommendations/catalog-surprise");
}

export async function getSimilarAuthors(): Promise<SimilarAuthorsData> {
  return fetchRecommendation<SimilarAuthorsData>("/recommendations/similar-authors");
}

export async function getRereadWorthIt(): Promise<RereadWorthItData> {
  return fetchRecommendation<RereadWorthItData>("/recommendations/reread-worth-it");
}
