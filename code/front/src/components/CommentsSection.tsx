"use client";

import React, { useRef, useState } from "react";
import { CornerDownRight, Heart, Send, Trash2 } from "lucide-react";
import {
  CommentData,
  createCommentReply,
  createPostComment,
  createReviewComment,
  deleteComment,
  formatFeedTime,
  getCommentReplies,
  getCurrentUserId,
  getPostComments,
  getReviewComments,
  toggleCommentLike,
} from "@/services/feed";

// ── Avatar ────────────────────────────────────────────────────────────────────

const PALETTES = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
];

function Avatar({
  userId,
  username,
  avatarUrl,
  sm,
}: Readonly<{ userId: number; username?: string | null; avatarUrl?: string | null; sm?: boolean }>) {
  const size = sm ? "h-7 w-7" : "h-8 w-8";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={username ?? "avatar"}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  const cls = PALETTES[userId % PALETTES.length];
  const initial = username ? username[0].toUpperCase() : String(userId).slice(-1);
  return (
    <div
      className={`${size} shrink-0 rounded-full flex items-center justify-center font-bold ${
        sm ? "text-[10px]" : "text-xs"
      } ${cls}`}
    >
      {initial}
    </div>
  );
}

// ── Inline reply composer ─────────────────────────────────────────────────────

function ReplyComposer({
  commentId,
  onCreated,
}: Readonly<{ commentId: number; onCreated: (reply: CommentData) => void }>) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  React.useEffect(() => { ref.current?.focus(); }, []);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const reply = await createCommentReply(commentId, trimmed);
      onCreated(reply);
      setText("");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void submit(); }}
      className="flex items-center gap-2 mt-2"
    >
      <input
        ref={ref}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva uma resposta..."
        className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 text-xs outline-none focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
      />
      <button
        type="submit"
        disabled={!text.trim() || submitting}
        aria-label="Enviar resposta"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700 transition-colors"
      >
        <Send size={11} />
      </button>
    </form>
  );
}

// ── Reply row (indented) ──────────────────────────────────────────────────────

function ReplyRow({
  reply,
  currentUserId,
  onDeleted,
}: Readonly<{ reply: CommentData; currentUserId: number | null; onDeleted: (id: number) => void }>) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(reply.likeCount);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    if (pending) return;
    const prev = liked;
    const prevCount = count;
    setLiked(!prev);
    setCount(prev ? prevCount - 1 : prevCount + 1);
    setPending(true);
    try {
      const r = await toggleCommentLike(reply.id);
      setLiked(r.liked);
      if (r.liked !== !prev) setCount(r.liked ? prevCount + 1 : prevCount - 1);
    } catch {
      setLiked(prev);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteComment(reply.id);
      onDeleted(reply.id);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const isOwn = currentUserId !== null && reply.userId === currentUserId;
  const displayName = reply.authorUsername ?? `Usuário ${reply.userId}`;

  return (
    <div className="flex gap-2.5 items-start py-2">
      <Avatar
        userId={reply.userId}
        username={reply.authorUsername}
        avatarUrl={reply.authorAvatarUrl}
        sm
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {displayName}
          </span>
          <span className="text-[11px] text-gray-400">{formatFeedTime(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
          {reply.text}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={pending}
            className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
              liked ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
            }`}
          >
            <Heart size={12} fill={liked ? "currentColor" : "none"} />
            {count > 0 && <span>{count}</span>}
            <span>Curtir</span>
          </button>
          {isOwn && (
            <button
              type="button"
              onClick={() => { void handleDelete(); }}
              disabled={deleting}
              aria-label="Excluir resposta"
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 size={11} />
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Comment row ───────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  currentUserId,
  onDeleted,
}: Readonly<{ comment: CommentData; currentUserId: number | null; onDeleted: (id: number) => void }>) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [likePending, setLikePending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replies, setReplies] = useState<CommentData[]>([]);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [repliesPage, setRepliesPage] = useState(0);
  const [replyTotal, setReplyTotal] = useState(0);

  const handleLike = async () => {
    if (likePending) return;
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!prev);
    setLikeCount(prev ? prevCount - 1 : prevCount + 1);
    setLikePending(true);
    try {
      const r = await toggleCommentLike(comment.id);
      setLiked(r.liked);
      if (r.liked !== !prev) setLikeCount(r.liked ? prevCount + 1 : prevCount - 1);
    } catch {
      setLiked(prev);
      setLikeCount(prevCount);
    } finally {
      setLikePending(false);
    }
  };

  const loadReplies = async (p = 0, append = false) => {
    setRepliesLoading(true);
    try {
      const data = await getCommentReplies(comment.id, p);
      setReplies((prev) => (append ? [...prev, ...data.content] : data.content));
      setRepliesHasMore(!data.last);
      setRepliesPage(p);
      setReplyTotal(data.totalElements);
      setRepliesLoaded(true);
    } catch {
      // ignore
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleToggleReplies = async () => {
    if (!repliesOpen && !repliesLoaded) await loadReplies(0);
    setRepliesOpen((v) => !v);
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleReplyCreated = (reply: CommentData) => {
    setReplies((prev) => [...prev, reply]);
    setReplyTotal((c) => c + 1);
    setRepliesOpen(true);
    setRepliesLoaded(true);
    setShowReplyInput(false);
  };

  const handleReplyDeleted = (replyId: number) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    setReplyTotal((c) => Math.max(0, c - 1));
  };

  const isOwn = currentUserId !== null && comment.userId === currentUserId;
  const isDeleted = comment.deleted === true;
  const hasReplies = replyTotal > 0 || replies.length > 0;
  const displayName = comment.authorUsername ?? `Usuário ${comment.userId}`;
  const repliesSuffix = replyTotal === 1 ? "" : "s";
  const repliesLabel = repliesOpen
    ? "Ocultar respostas"
    : `Ver ${replyTotal} resposta${repliesSuffix}`;

  const repliesBlock = (
    <>
      {hasReplies && (
        <button
          type="button"
          onClick={() => { void handleToggleReplies(); }}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <CornerDownRight size={12} />
          {repliesLabel}
        </button>
      )}

      {repliesOpen && (
        <div className="mt-2 ml-2 pl-3 border-l-2 border-gray-100 dark:border-slate-700 space-y-0">
          {repliesLoading && replies.length === 0 ? (
            <div className="flex gap-2 py-2 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 h-10 rounded bg-gray-100 dark:bg-slate-800" />
            </div>
          ) : (
            replies.map((r) => (
              <ReplyRow
                key={r.id}
                reply={r}
                currentUserId={currentUserId}
                onDeleted={handleReplyDeleted}
              />
            ))
          )}
          {repliesHasMore && (
            <button
              type="button"
              onClick={() => { void loadReplies(repliesPage + 1, true); }}
              disabled={repliesLoading}
              className="text-xs text-emerald-600 hover:underline disabled:opacity-50 py-1"
            >
              {repliesLoading ? "Carregando..." : "Ver mais respostas"}
            </button>
          )}
        </div>
      )}
    </>
  );

  if (isDeleted) {
    return (
      <div className="py-3 border-b border-gray-50 dark:border-slate-700/40 last:border-0">
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Trash2 size={13} className="text-gray-300 dark:text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm italic text-gray-400 dark:text-slate-500 mt-0.5 select-none">
              Comentário excluído
            </p>
            {repliesBlock}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-gray-50 dark:border-slate-700/40 last:border-0">
      <div className="flex gap-3 items-start">
        <Avatar
          userId={comment.userId}
          username={comment.authorUsername}
          avatarUrl={comment.authorAvatarUrl}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {displayName}
            </span>
            <span className="text-[11px] text-gray-400">{formatFeedTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5">
            <button
              type="button"
              onClick={handleLike}
              disabled={likePending}
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                liked ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
              }`}
            >
              <Heart size={13} fill={liked ? "currentColor" : "none"} />
              {likeCount > 0 && <span>{likeCount}</span>}
              <span>Curtir</span>
            </button>
            <button
              type="button"
              onClick={() => setShowReplyInput((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <CornerDownRight size={12} />
              Responder
            </button>
            {isOwn && (
              <button
                type="button"
                onClick={() => { void handleDelete(); }}
                disabled={deleting}
                aria-label="Excluir comentário"
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            )}
          </div>

          {/* Reply composer */}
          {showReplyInput && (
            <ReplyComposer commentId={comment.id} onCreated={handleReplyCreated} />
          )}

          {repliesBlock}
        </div>
      </div>
    </div>
  );
}

// ── Main CommentsSection (inline) ─────────────────────────────────────────────

interface CommentsSectionProps {
  contentId: number;
  contentType: "POST" | "REVIEW";
  onCommentAdded?: () => void;
}

export function CommentsSection({
  contentId,
  contentType,
  onCommentAdded,
}: Readonly<CommentsSectionProps>) {
  const currentUserId = getCurrentUserId();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    const fetcher =
      contentType === "POST"
        ? getPostComments(contentId, 0)
        : getReviewComments(contentId, 0);
    fetcher
      .then((data) => {
        if (cancelled) return;
        setComments(data.content);
        setHasMore(!data.last);
        setTotalComments(data.totalElements ?? 0);
        setPage(0);
      })
      .catch(() => {
        if (!cancelled) setFetchError("Não foi possível carregar os comentários.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [contentId, contentType]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data =
        contentType === "POST"
          ? await getPostComments(contentId, nextPage)
          : await getReviewComments(contentId, nextPage);
      setComments((prev) => [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const newComment =
        contentType === "POST"
          ? await createPostComment(contentId, trimmed)
          : await createReviewComment(contentId, trimmed);
      setComments((prev) => [newComment, ...prev]);
      setText("");
      onCommentAdded?.();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
        className="flex items-center gap-2 mb-3"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          aria-label="Enviar comentário"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-8 rounded-lg bg-gray-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && fetchError && (
        <p className="text-center text-sm text-red-500 py-4">{fetchError}</p>
      )}

      {!loading && !fetchError && comments.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      )}

      {!loading && !fetchError && comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDeleted={(id) =>
                setComments((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, deleted: true } : c)),
                )
              }
            />
          ))}
          {hasMore && totalComments > comments.length && (
            <button
              type="button"
              onClick={() => { void handleLoadMore(); }}
              disabled={loadingMore}
              className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loadingMore ? "Carregando..." : "Ver mais comentários"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
