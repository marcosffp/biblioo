import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components";
import { humanizeUsername } from "@/utils/format";
import type { UserSummaryResponse } from "@/services/profile";

interface FollowUserCardProps {
  user: UserSummaryResponse;
  isFollowing: boolean;
  isRequested: boolean;
  onToggleFollow: (username: string) => void;
}

export function FollowUserCard({
  user,
  isFollowing,
  isRequested,
  onToggleFollow,
}: Readonly<FollowUserCardProps>) {
  let followLabel = "Seguir";
  if (isFollowing) followLabel = "Seguindo";
  else if (isRequested) followLabel = "Solicitado";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-12 w-12 bg-primary/20">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
          <AvatarFallback className="bg-primary/20 font-semibold text-primary-dark">
            {user.username[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-deep-green">{humanizeUsername(user.username)}</p>
          <p className="truncate text-sm text-medium-text">@{user.username}</p>
        </div>
      </Link>
      <Button
        size="sm"
        variant={isFollowing || isRequested ? "outline" : "default"}
        onClick={() => onToggleFollow(user.username)}
      >
        {followLabel}
      </Button>
    </div>
  );
}

export default FollowUserCard;
