import React from "react";
import { AlertTriangle } from "lucide-react";
import { UserBadge } from "./UserBadge";
import { ActionRow } from "./ActionRow";
import { BookCoverPlaceholder } from "./BookCoverPlaceholder";
import { getBookById } from "@/services/bookcase";

export interface PostCardProps {
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
  const [spoilerRevealed, setSpoilerRevealed] = React.useState(false);
  const [fetchedTitle, setFetchedTitle] = React.useState<string | null>(null);
  const [fetchedAuthors, setFetchedAuthors] = React.useState<string[] | null>(null);
  const [fetchedCoverUrl, setFetchedCoverUrl] = React.useState<string | null>(null);

  // Fetch book details when bookId is provided but title wasn't embedded in the feed item
  React.useEffect(() => {
    if (bookId && !bookTitleProp) {
      getBookById(bookId)
        .then((book) => {
          setFetchedTitle(book.title);
          setFetchedAuthors(book.authors);
          setFetchedCoverUrl(book.coverUrl ?? null);
        })
        .catch(() => {});
    }
  }, [bookId, bookTitleProp]);

  const bookTitle = bookTitleProp ?? fetchedTitle;
  const bookAuthors = bookAuthorsProp ?? fetchedAuthors;
  const bookCoverUrl = bookCoverUrlProp ?? fetchedCoverUrl;
  const hasBook = !!(bookId || bookTitle);

  return (
    <article className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="flex items-start justify-between">
        <UserBadge name={author} subtitle={authorHandle} avatarUrl={avatarUrl} />
        {time ? <span className="text-xs text-gray-400">{time}</span> : null}
      </div>

      {/* Referenced book */}
      {hasBook && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
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
        </div>
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
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{content}</p>
          )}

          {/* Images */}
          {images && images.length > 0 && (
            <div className={`mt-3 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
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

          {/* GIF (mutually exclusive with images) */}
          {gifUrl && !(images && images.length > 0) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gifUrl} alt="GIF" className="mt-3 max-h-64 rounded-lg" />
          )}
        </>
      )}

      <div className="mt-4">
        <ActionRow
          items={[
            { label: `${likes} curtidas` },
            { label: `${comments} comentários` },
          ]}
        />
      </div>
    </article>
  );
}

export default PostCard;
