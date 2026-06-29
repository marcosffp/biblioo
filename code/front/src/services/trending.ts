import { API_BASE_URL } from "@/lib/api-config";
import { requiredBearerHeaders } from "@/lib/api-headers";

export interface TrendingBook {
  bookId: number;
  title: string;
  coverUrl: string | null;
  author: string;
  newReviews: number;
  shelfAdditions: number;
  progressUpdates: number;
  reviewLikes: number;
  reason: string;
  score: number;
}

export async function getTrendingBooks(): Promise<TrendingBook[]> {
  const response = await fetch(`${API_BASE_URL}/trending/books`, {
    headers: requiredBearerHeaders(),
  });
  if (!response.ok) return [];
  return (await response.json()) as TrendingBook[];
}
