"use client";

import React, { memo, useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Heart, MessageCircle } from "lucide-react";
import { UserBadge } from "./UserBadge";
import { BookCoverPlaceholder } from "./BookCoverPlaceholder";
import { BookDetailsCard } from "./BookDetailsCard";
import { CommentsSection } from "./CommentsSection";
import { getBookById } from "@/services/bookcase";
import { togglePostLike } from "@/services/feed";
import { ClientPortal } from "./ClientPortal";

export interface PostCardProps {
  postId?: number;
  author: string;
  authorHandle?: string;
  authorUsername?: string;
  avatarUrl?: string;
  time?: string;
  content?: string;
  likes?: number;
  comments?: number;
  className?: string;
  bookId?: number | null;
  bookTitle?: string | null;
  bookAuthors?: string[] | null;
  bookCoverUrl?: string | null;
  images?: string[];
  gifUrl?: string | null;
  hasSpoiler?: boolean;
  isLiked?: boolean;
}

export const PostCard = memo(function PostCard({
  postId,
  author,
  authorHandle,
  authorUsername,
  avatarUrl,
  time,
  content,
  likes = 0,
  comments = 0,
  className,
  bookId,
  bookTitle: bookTitleProp,
  bookAuthors: bookAuthorsProp,
  bookCoverUrl: bookCoverUrlProp,
  images,
  gifUrl,
  hasSpoiler,
  isLiked = false,
}: PostCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);
  const [fetchedAuthors, setFetchedAuthors] = useState<string[] | null>(null);
  const [fetchedCoverUrl, setFetchedCoverUrl] = useState<string | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookSynopsis, setBookSynopsis] = useState<string | null | undefined>(undefined);

  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [likePending, setLikePending] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(comments);

  useEffect(() => {
    if (bookId && !bookTitleProp) {
      getBookById(bookId)
        .then((book) => {
          setFetchedTitle(book.title);
          setFetchedAuthors(book.authors);
          setFetchedCoverUrl(book.coverUrl ?? null);
          setBookSynopsis(book.synopsis ?? book.description ?? null);
        })
        .catch(() => {});
    }
  }, [bookId, bookTitleProp]);

  const handleOpenBookModal = () => {
    setBookModalOpen(true);
    if (bookId && bookSynopsis === undefined) {
      getBookById(bookId)
        .then((b) => setBookSynopsis(b.synopsis ?? b.description ?? null))
        .catch(() => setBookSynopsis(null));
    }
  };

  const handleLike = async () => {
    if (!postId || likePending) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    if (!prevLiked) setHeartKey((k) => k + 1);
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikePending(true);
    try {
      const result = await togglePostLike(postId);
      setLiked(result.liked);
      if (result.liked !== !prevLiked) {
        setLikeCount(result.liked ? prevCount + 1 : prevCount - 1);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikePending(false);
    }
  };

  const bookTitle = bookTitleProp ?? fetchedTitle;
  const bookAuthors = bookAuthorsProp ?? fetchedAuthors;
  const bookCoverUrl = bookCoverUrlProp ?? fetchedCoverUrl;
  const hasBook = !!(bookId || bookTitle);

  return (
    <>
      <article
        className={`group/card rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className ?? ""}`.trim()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <UserBadge name={author} subtitle={authorHandle} avatarUrl={avatarUrl} href={authorUsername ? `/profile/${authorUsername}` : undefined} />
          {time ? (
            <span className="mt-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
              {time}
            </span>
          ) : null}
        </div>

        <div className="px-4 pb-4">
          {/* Referenced book */}
          {hasBook && (
            <button
              type="button"
              onClick={handleOpenBookModal}
              className="mb-3 flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
            >
              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg shadow-sm">
                {bookCoverUrl ? (
                  <Image src={bookCoverUrl} alt={bookTitle ?? ""} width={40} height={56} className="h-full w-full object-cover" />
                ) : (
                  <BookCoverPlaceholder title={bookTitle ?? undefined} author={bookAuthors?.[0] ?? undefined} />
                )}
              </div>
              <div className="min-w-0">
                {bookTitle ? (
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{bookTitle}</p>
                ) : (
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                )}
                {bookAuthors && bookAuthors.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-emerald-700">{bookAuthors.join(", ")}</p>
                )}
              </div>
            </button>
          )}

          {/* Post content */}
          {hasSpoiler && !spoilerRevealed ? (
            <div className="flex flex-col items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={18} className="text-amber-500" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-amber-800">Este post contém spoilers</p>
              <button
                type="button"
                onClick={() => setSpoilerRevealed(true)}
                className="rounded-full bg-amber-400 px-5 py-1.5 text-xs font-bold text-white transition-all hover:bg-amber-500 active:scale-95"
              >
                Revelar
              </button>
            </div>
          ) : (
            <>
              {content && (
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-line">
                  {content}
                </p>
              )}

              {images && images.length > 0 && (
                <div className={`mt-3 grid gap-1.5 overflow-hidden rounded-xl ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {images.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt={`Imagem ${i + 1}`}
                      width={600}
                      height={288}
                      className="w-full rounded-xl object-cover max-h-72"
                    />
                  ))}
                </div>
              )}

              {gifUrl && !(images && images.length > 0) && (
                <Image src={gifUrl} alt="GIF" width={600} height={256} className="mt-3 max-h-64 w-full rounded-xl object-cover" />
              )}
            </>
          )}

          {/* Footer actions */}
          <div className="mt-3 flex items-center gap-0.5 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => void handleLike()}
              disabled={!postId || likePending}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all active:scale-95 disabled:cursor-default ${
                liked
                  ? "bg-rose-50 text-rose-500"
                  : "text-gray-400 hover:bg-rose-50 hover:text-rose-500"
              }`}
            >
              <Heart
                key={heartKey}
                size={15}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "animate-heart-pop" : ""}
              />
              <span>{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                showComments
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <MessageCircle size={15} fill={showComments ? "currentColor" : "none"} />
              <span>{commentCount}</span>
            </button>

          </div>

          {showComments && postId !== undefined && (
            <CommentsSection
              contentId={postId}
              contentType="POST"
              onCommentAdded={() => setCommentCount((c) => c + 1)}
            />
          )}
        </div>
      </article>

      {bookModalOpen && (
        <ClientPortal>
          <BookDetailsCard
            isOpen={bookModalOpen}
            title={bookTitle ?? ""}
            author={bookAuthors?.join(", ") ?? ""}
            coverUrl={bookCoverUrl ?? undefined}
            synopsis={bookSynopsis ?? undefined}
            onClose={() => setBookModalOpen(false)}
            onAddToShelf={() => {}}
            availableShelves={[]}
          />
        </ClientPortal>
      )}
    </>
  );
});

export default PostCard;
