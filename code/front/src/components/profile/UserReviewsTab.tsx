"use client";

import React, { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { ReviewFeedCard } from "@/components/ReviewFeedCard";
import { getBookById } from "@/services/bookcase";
import { getUserActivityReviews, formatFeedTime } from "@/services/activity";
import type { ActivityReview } from "@/services/activity";

function ReviewItem({
  review,
  authorName,
  authorAvatarUrl,
}: {
  review: ActivityReview;
  authorName: string;
  authorAvatarUrl?: string | null;
}) {
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [bookAuthors, setBookAuthors] = useState<string[] | null>(null);
  const [bookCoverUrl, setBookCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!review.bookId) return;
    getBookById(review.bookId)
      .then((book) => {
        setBookTitle(book.title);
        setBookAuthors(book.authors);
        setBookCoverUrl(book.coverUrl ?? null);
      })
      .catch(() => {});
  }, [review.bookId]);

  return (
    <ReviewFeedCard
      reviewId={review.id}
      authorName={authorName}
      authorAvatarUrl={authorAvatarUrl}
      time={formatFeedTime(review.createdAt)}
      bookId={review.bookId}
      bookTitle={bookTitle ?? "Carregando..."}
      bookAuthors={bookAuthors}
      bookCoverUrl={bookCoverUrl}
      rating={review.rating}
      reviewText={review.text}
      likes={review.likeCount}
      comments={review.commentCount}
    />
  );
}

export type UserReviewsTabProps = {
  userId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  emptyMessage?: string;
};

export function UserReviewsTab({
  userId,
  authorName,
  authorAvatarUrl,
  emptyMessage = "Nenhuma avaliação publicada ainda.",
}: UserReviewsTabProps) {
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        const result = await getUserActivityReviews(userId, 0, 10);
        if (cancelled) return;
        setReviews(result.items);
        setHasMore(result.hasMore);
      } catch {
        // silently handled by empty state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await getUserActivityReviews(userId, page, 10);
      setReviews((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage((p) => p + 1);
    } catch {
      // noop
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-1/3 rounded bg-gray-200" />
                <div className="h-2.5 w-1/4 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-16 w-full rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <BookOpen size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Nenhuma avaliação ainda</p>
        <p className="mt-1 text-xs text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          authorName={authorName}
          authorAvatarUrl={authorAvatarUrl}
        />
      ))}

      {hasMore && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
          >
            {isLoadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
