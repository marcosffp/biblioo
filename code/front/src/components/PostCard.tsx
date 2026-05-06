"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Heart, MessageCircle, Share2 } from "lucide-react";
import { UserBadge } from "./UserBadge";
import { BookCoverPlaceholder } from "./BookCoverPlaceholder";
import { BookDetailsCard } from "./BookDetailsCard";
import { CommentsSection } from "./CommentsSection";
import { getBookById } from "@/services/bookcase";
import { togglePostLike } from "@/services/feed";

export interface PostCardProps {
  postId?: number;
  author: string;
  authorHandle?: string;
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
}

export function PostCard({
  postId,
  author,
  authorHandle,
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
}: PostCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null);
  const [fetchedAuthors, setFetchedAuthors] = useState<string[] | null>(null);
  const [fetchedCoverUrl, setFetchedCoverUrl] = useState<string | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookSynopsis, setBookSynopsis] = useState<string | null | undefined>(undefined);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [likePending, setLikePending] = useState(false);
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
      className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}
    >
      <div className="flex items-start justify-between">
        <UserBadge name={author} subtitle={authorHandle} avatarUrl={avatarUrl} />
        {time ? <span className="text-xs text-gray-400">{time}</span> : null}
      </div>

      {/* Referenced book */}
      {hasBook && (
        <button
          type="button"
          onClick={handleOpenBookModal}
          className="mt-3 w-full text-left flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 px-3 py-2 transition-colors"
        >
          <div className="h-12 w-8 shrink-0 overflow-hidden rounded">
            {bookCoverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bookCoverUrl} alt={bookTitle ?? ""} className="h-full w-full object-cover" />
            ) : (
              <BookCoverPlaceholder />
            )}
          </div>
          <div className="min-w-0">
            {bookTitle ? (
              <p className="truncate text-sm font-semibold text-gray-900">{bookTitle}</p>
            ) : (
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            )}
            {bookAuthors && bookAuthors.length > 0 && (
              <p className="truncate text-xs text-emerald-700">{bookAuthors.join(", ")}</p>
            )}
          </div>
        </button>
      )}

      {/* Post content with optional spoiler gate */}
      {hasSpoiler && !spoilerRevealed ? (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <AlertTriangle size={18} className="text-amber-500" aria-hidden />
          <p className="text-sm font-medium text-amber-800">Este post contém spoilers</p>
          <button
            type="button"
            onClick={() => setSpoilerRevealed(true)}
            className="mt-1 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
          >
            Revelar conteúdo
          </button>
        </div>
      ) : (
        <>
          {content && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
              {content}
            </p>
          )}

          {images && images.length > 0 && (
            <div
              className={`mt-3 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Imagem ${i + 1}`}
                  className="w-full rounded-lg object-cover max-h-64"
                />
              ))}
            </div>
          )}

          {gifUrl && !(images && images.length > 0) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gifUrl} alt="GIF" className="mt-3 max-h-64 rounded-lg" />
          )}
        </>
      )}

      {/* Footer actions */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <button
          type="button"
          onClick={handleLike}
          disabled={!postId || likePending}
          className={`inline-flex items-center gap-1.5 transition-colors disabled:cursor-default ${
            liked
              ? "text-rose-500 dark:text-rose-400"
              : "hover:text-rose-500 dark:hover:text-rose-400"
          }`}
        >
          <Heart
            size={16}
            fill={liked ? "currentColor" : "none"}
            className="transition-transform active:scale-125"
          />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className={`inline-flex items-center gap-1.5 transition-colors ${
            showComments
              ? "text-emerald-600 dark:text-emerald-400"
              : "hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          <MessageCircle size={16} fill={showComments ? "currentColor" : "none"} />
          <span>{commentCount}</span>
        </button>

        <button
          type="button"
          aria-label="Compartilhar"
          className="ml-auto hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      {showComments && postId !== undefined && (
        <CommentsSection
          contentId={postId}
          contentType="POST"
          initialCount={commentCount}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}
    </article>

    {bookModalOpen && (
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
    )}
    </>
  );
}

export default PostCard;
