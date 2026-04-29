"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  EmptyState,
  PageHeader,
  PostCard,
  ReviewFeedCard,
  SectionHeader,
  SkeletonBlock,
} from "@/components";
import { FeedApiError, FeedItem, formatFeedTime, getFeed } from "@/services/feed";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (cursor?: string | null) => {
    try {
      const page = await getFeed(cursor);
      setItems((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNextCursor(page.nextCursor ?? null);
      setHasMore(page.hasMore);
      setError(null);
    } catch (err) {
      setError(
        err instanceof FeedApiError ? err.message : "Não foi possível carregar o feed.",
      );
    }
  }, []);

  useEffect(() => {
    loadFeed().finally(() => setLoading(false));
  }, [loadFeed]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await loadFeed(nextCursor);
    setLoadingMore(false);
  };

  return (
    <AppShell>
      <PageHeader title="Feed" subtitle="Atualizações da comunidade" />
      <SectionHeader title="Últimos posts" />

      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonBlock lines={5} className="rounded-xl border border-gray-100 dark:border-slate-700 p-4" />
            <SkeletonBlock lines={5} className="rounded-xl border border-gray-100 dark:border-slate-700 p-4" />
            <SkeletonBlock lines={4} className="rounded-xl border border-gray-100 dark:border-slate-700 p-4" />
          </>
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Feed vazio"
            description="Siga mais pessoas para ver avaliações e posts no seu feed."
          />
        ) : (
          <>
            {items.map((item) => {
              const authorName = item.authorUsername ?? `Usuário ${item.authorId}`;
              const time = formatFeedTime(item.createdAt);

              if (item.contentType === "REVIEW") {
                const { bookTitle, bookAuthors, bookCoverUrl, rating, text, likeCount, commentCount } =
                  item.content;
                return (
                  <ReviewFeedCard
                    key={`review-${item.contentId}`}
                    authorName={authorName}
                    authorAvatarUrl={item.authorAvatarUrl}
                    time={time}
                    bookTitle={bookTitle ?? "Livro"}
                    bookAuthors={bookAuthors}
                    bookCoverUrl={bookCoverUrl}
                    rating={rating ?? 0}
                    reviewText={text}
                    likes={likeCount}
                    comments={commentCount}
                  />
                );
              }

              return (
                <PostCard
                  key={`post-${item.contentId}`}
                  author={authorName}
                  avatarUrl={item.authorAvatarUrl ?? undefined}
                  time={time}
                  content={item.content.text ?? ""}
                  likes={item.content.likeCount}
                  comments={item.content.commentCount}
                />
              );
            })}

            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? "Carregando..." : "Ver mais"}
              </button>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
