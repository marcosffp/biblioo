import React from "react";

type UserListItem = {
  id: number;
  username: string;
  sideLabel?: string;
};

type ProfileFollowersPanelProps = {
  title: string;
  emptyLabel: string;
  users: UserListItem[];
};

export function ProfileFollowersPanel({ title, emptyLabel, users }: ProfileFollowersPanelProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="mb-3 font-display text-2xl font-semibold text-deep-green">{title}</h2>
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={`${title}-${user.id}`}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
            >
              <span className="truncate text-sm font-semibold text-deep-green">@{user.username}</span>
              <span className="text-xs text-medium-text">{user.sideLabel ?? ""}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-medium-text">{emptyLabel}</p>
      )}
    </article>
  );
}
