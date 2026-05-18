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
  const nameSize = size === "sm" ? "text-sm" : "text-[0.9rem]";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className={`${avatarSize} rounded-full object-cover ring-2 ring-emerald-100`}
        />
      ) : (
        <div
          className={`${avatarSize} shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold ring-2 ring-emerald-50`}
        >
          {initials}
        </div>
      )}
      <div>
        <div className={`${nameSize} font-semibold leading-tight text-gray-900`}>{name}</div>
        {subtitle ? (
          <div className="mt-0.5 text-[11px] text-gray-400">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export default UserBadge;
