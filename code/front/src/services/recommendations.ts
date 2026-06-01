import { requiredBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type {
  DiceRollBook,
  BecauseYouReadData,
  FavoriteGenreNowData,
  TrendingInCommunitiesData,
  CatalogSurpriseData,
  SimilarAuthorsData,
  RereadWorthItData,
} from "@/types/api";

export class RecommendationApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RecommendationApiError";
    this.status = status;
  }
}


async function fetchRecommendation<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: requiredBearerHeaders(),
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
