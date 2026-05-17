"use client";

import { useEffect, useState } from "react";
import { BookOpen, MessageSquare } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { ReviewFeedCard } from "@/components/ReviewFeedCard";
import { getBookById } from "@/services/bookcase";
import { getAccessToken } from "@/services/auth";
import { getUserActivityPosts, getUserActivityReviews, formatFeedTime } from "@/services/activity";
import type { ActivityItem, ActivityReview } from "@/services/activity";

function ActivityReviewItem({
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

function ActivityTypeLabel({ type }: { type: "POST" | "REVIEW" }) {
  if (type === "REVIEW") {
    return (
      <div className="mb-1.5 flex items-center gap-1.5">
        <BookOpen size={12} className="text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700">Avaliação de livro</span>
      </div>
    );
  }
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <MessageSquare size={12} className="text-blue-500" />
      <span className="text-xs font-medium text-blue-600">Post</span>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-4/5 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export type UserActivityFeedProps = {
  userId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  isOwnProfile?: boolean;
};

export function UserActivityFeed({
  userId,
  authorName,
  authorAvatarUrl,
  isOwnProfile = false,
}: UserActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postPage, setPostPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [postsResult, reviewsResult] = await Promise.all([
          getUserActivityPosts(userId, 0, 10, token),
          getUserActivityReviews(userId, 0, 10, token),
        ]);

        if (cancelled) return;

        const merged = [...postsResult.items, ...reviewsResult.items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setItems(merged);
        setHasMorePosts(postsResult.hasMore);
        setHasMoreReviews(reviewsResult.hasMore);
      } catch {
        if (!cancelled) setError("Não foi possível carregar as atividades.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const token = getAccessToken();

    try {
      const [postsResult, reviewsResult] = await Promise.all([
        hasMorePosts
          ? getUserActivityPosts(userId, postPage, 10, token)
          : Promise.resolve({ items: [], hasMore: false }),
        hasMoreReviews
          ? getUserActivityReviews(userId, reviewPage, 10, token)
          : Promise.resolve({ items: [], hasMore: false }),
      ]);

      const merged = [...postsResult.items, ...reviewsResult.items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => `${i.type}-${i.id}`));
        const newUnique = merged.filter((i) => !existingIds.has(`${i.type}-${i.id}`));
        return [...prev, ...newUnique].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });

      if (hasMorePosts) {
        setHasMorePosts(postsResult.hasMore);
        setPostPage((p) => p + 1);
      }
      if (hasMoreReviews) {
        setHasMoreReviews(reviewsResult.hasMore);
        setReviewPage((p) => p + 1);
      }
    } catch {
      // noop: load more failure is non-critical
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) return <ActivitySkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <MessageSquare size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Nenhuma atividade ainda</p>
        <p className="mt-1 text-xs text-gray-400">
          {isOwnProfile
            ? "Publique posts ou avaliações para ver seu histórico aqui."
            : "As atividades deste usuário aparecerão aqui."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.type}-${item.id}`}>
          <ActivityTypeLabel type={item.type} />
          {item.type === "POST" ? (
            <PostCard
              postId={item.id}
              author={authorName}
              avatarUrl={authorAvatarUrl ?? undefined}
              time={formatFeedTime(item.createdAt)}
              content={item.text ?? undefined}
              likes={item.likeCount}
              comments={item.commentCount}
              bookId={item.bookId}
              images={item.images}
              gifUrl={item.gifUrl}
              hasSpoiler={item.hasSpoiler}
            />
          ) : (
            <ActivityReviewItem
              review={item}
              authorName={authorName}
              authorAvatarUrl={authorAvatarUrl}
            />
          )}
        </div>
      ))}

      {(hasMorePosts || hasMoreReviews) && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => void handleLoadMore()}
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
