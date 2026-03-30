import React from "react";

export interface UserBadgeProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  className?: string;
}

export function UserBadge({ name, subtitle, avatarUrl, size = "md", className }: UserBadgeProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={`${avatarSize} rounded-full object-cover`} />
      ) : (
        <div className={`${avatarSize} rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold`}>
          {initials}
        </div>
      )}
      <div>
        <div className={`${textSize} font-semibold text-gray-900 dark:text-gray-100`}>{name}</div>
        {subtitle ? <div className="text-xs text-gray-400">{subtitle}</div> : null}
      </div>
    </div>
  );
}

export default UserBadge;
