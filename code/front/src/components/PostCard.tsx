import React from "react";
import { UserBadge } from "./UserBadge";
import { ActionRow } from "./ActionRow";

export interface PostCardProps {
  author: string;
  authorHandle?: string;
  avatarUrl?: string;
  time?: string;
  content: string;
  likes?: number;
  comments?: number;
  className?: string;
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
}: PostCardProps) {
  return (
    <article className={`rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${className ?? ""}`.trim()}>
      <div className="flex items-start justify-between">
        <UserBadge name={author} subtitle={authorHandle} avatarUrl={avatarUrl} />
        {time ? <span className="text-xs text-gray-400">{time}</span> : null}
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{content}</p>

      <div className="mt-4">
        <ActionRow
          items={[
            { label: `${likes} curtidas` },
            { label: `${comments} comentarios` },
          ]}
        />
      </div>
    </article>
  );
}

export default PostCard;
