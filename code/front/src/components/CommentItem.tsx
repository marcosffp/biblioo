import React from "react";
import { UserBadge } from "./UserBadge";

export interface CommentItemProps {
  author: string;
  avatarUrl?: string;
  time?: string;
  content: string;
  className?: string;
}

export function CommentItem({ author, avatarUrl, time, content, className }: CommentItemProps) {
  return (
    <div className={`flex gap-3 ${className ?? ""}`.trim()}>
      <UserBadge name={author} avatarUrl={avatarUrl} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{author}</span>
          {time ? <span className="text-xs text-gray-400">{time}</span> : null}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-200 whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

export default CommentItem;
