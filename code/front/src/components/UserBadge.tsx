import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface UserBadgeProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  className?: string;
  href?: string;
}

export function UserBadge({ name, subtitle, avatarUrl, size = "md", className, href }: UserBadgeProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const nameSize = size === "sm" ? "text-sm" : "text-[0.9rem]";

  const avatar = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name}
      width={size === "sm" ? 32 : 40}
      height={size === "sm" ? 32 : 40}
      className={`${avatarSize} rounded-full object-cover ring-2 ring-emerald-100`}
    />
  ) : (
    <div
      className={`${avatarSize} shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold ring-2 ring-emerald-50`}
    >
      {initials}
    </div>
  );

  const inner = (
    <>
      {avatar}
      <div>
        <div className={`${nameSize} font-semibold leading-tight text-gray-900 ${href ? "hover:underline" : ""}`}>{name}</div>
        {subtitle ? (
          <div className="mt-0.5 text-[11px] text-gray-400">{subtitle}</div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      {inner}
    </div>
  );
}

export default UserBadge;
