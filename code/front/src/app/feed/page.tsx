"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  AppShell,
  CreatePostModal,
  CreateReviewModal,
  EditReviewModal,
  EmptyState,
  FeedComposeCard,
  PageHeader,
  PostCard,
  ReviewFeedCard,
  SkeletonBlock,
} from "@/components";
import { FeedApiError, FeedItem, formatFeedTime, getFeed } from "@/services/feed";
import { deleteBookReview } from "@/services/bookcase";
import { getAccessToken } from "@/services/auth";
import { getJwtUserId } from "@/utils/jwt";

const TRENDING_BOOKS = [
  { id: 1, title: "A Empregada", author: "Freida McFadden", readers: 1234 },
  { id: 2, title: "É Assim Que Acaba", author: "Colleen Hoover", readers: 987 },
  { id: 3, title: "Verity", author: "Colleen Hoover", readers: 876 },
  { id: 4, title: "O Problema de Ser Perfeita", author: "Sally Thorne", readers: 754 },
  { id: 5, title: "Adeus, Coisas", author: "Fumio Sasaki", readers: 631 },
];

interface EditingReview {
  id: number;
  rating: number;
  text: string;
  bookTitle: string;
  bookCoverUrl?: string | null;
  bookAuthors?: string[] | null;
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingReview, setEditingReview] = useState<EditingReview | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) setCurrentUserId(getJwtUserId(token));
  }, []);

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
      <PageHeader title="Feed" subtitle="Descubra o que a comunidade está lendo" />

      <div className="flex items-start gap-8">
        {/* Coluna principal do feed */}
        <div className="min-w-0 flex-1">
          <FeedComposeCard
            onOpenReview={() => setShowReviewModal(true)}
            onOpenPost={() => setShowPostModal(true)}
          />

          {showReviewModal && (
            <CreateReviewModal
              onClose={() => setShowReviewModal(false)}
              onPublished={() => { void loadFeed(); }}
            />
          )}

          {showPostModal && (
            <CreatePostModal
              onClose={() => setShowPostModal(false)}
              onPublished={() => { void loadFeed(); }}
            />
          )}

          {editingReview && (
            <EditReviewModal
              reviewId={editingReview.id}
              initialRating={editingReview.rating}
              initialText={editingReview.text}
              bookTitle={editingReview.bookTitle}
              bookCoverUrl={editingReview.bookCoverUrl}
              bookAuthors={editingReview.bookAuthors}
              onClose={() => setEditingReview(null)}
              onSaved={() => { void loadFeed(); }}
            />
          )}

          <div className="mt-4 space-y-4">
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
                    const { bookId, bookTitle, bookAuthors, bookCoverUrl, rating, text, likeCount, commentCount, hasSpoiler } =
                      item.content;
                    const isOwn = currentUserId !== null && String(item.authorId) === currentUserId;
                    return (
                      <ReviewFeedCard
                        key={`review-${item.contentId}`}
                        reviewId={item.contentId}
                        authorName={authorName}
                        authorAvatarUrl={item.authorAvatarUrl}
                        time={time}
                        bookId={bookId}
                        bookTitle={bookTitle ?? "Livro"}
                        bookAuthors={bookAuthors}
                        bookCoverUrl={bookCoverUrl}
                        rating={rating ?? 0}
                        reviewText={text}
                        images={item.content.images}
                        gifUrl={item.content.gifUrl}
                        likes={likeCount}
                        comments={commentCount}
                        hasSpoiler={hasSpoiler ?? false}
                        isOwn={isOwn}
                        onEdit={() => setEditingReview({
                          id: item.contentId,
                          rating: rating ?? 0,
                          text: text ?? "",
                          bookTitle: bookTitle ?? "Livro",
                          bookCoverUrl,
                          bookAuthors,
                        })}
                        onDelete={async () => {
                          await deleteBookReview(item.contentId);
                          void loadFeed();
                        }}
                      />
                    );
                  }

                  return (
                    <PostCard
                      key={`post-${item.contentId}`}
                      postId={item.contentId}
                      author={authorName}
                      avatarUrl={item.authorAvatarUrl ?? undefined}
                      time={time}
                      content={item.content.text ?? ""}
                      likes={item.content.likeCount}
                      comments={item.content.commentCount}
                      bookId={item.content.bookId}
                      bookTitle={item.content.bookTitle}
                      bookAuthors={item.content.bookAuthors}
                      bookCoverUrl={item.content.bookCoverUrl}
                      images={item.content.images}
                      gifUrl={item.content.gifUrl}
                      hasSpoiler={item.content.hasSpoiler ?? false}
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
        </div>

        {/* Sidebar direita */}
        <aside className="w-72 shrink-0 sticky top-24 self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-foreground">Em Alta</h3>
            </div>
            <div className="space-y-3">
              {TRENDING_BOOKS.map((book, index) => (
                <div key={book.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{book.title}</p>
                    <p className="truncate text-xs text-emerald-600">{book.author}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {book.readers.toLocaleString("pt-BR")} lendo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
