"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuthSession } from "@/services/auth";
import { getMyProfile } from "@/services/profile";
import { SearchBar } from "@/components/header/SearchBar";
import { NotificationsDropdown } from "@/components/header/NotificationsDropdown";
import { ProfileMenu } from "@/components/header/ProfileMenu";

export interface TopHeaderProps {
  title?: string;
  searchPlaceholder?: string;
  notificationsCount?: number;
  userInitial?: string;
  className?: string;
}

export const TopHeader = memo(function TopHeader({
  searchPlaceholder = "Buscar livros, leitores, clubes...",
  notificationsCount = 2,
  userInitial = "U",
  className,
}: Readonly<TopHeaderProps>) {
  const [resolvedInitial, setResolvedInitial] = React.useState(userInitial.toUpperCase().slice(0, 1));
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;

    setAccessToken(session.accessToken);

    if (session.user?.username) {
      setResolvedInitial(session.user.username.slice(0, 1).toUpperCase());
    }
    if (session.user?.avatarUrl) {
      setAvatarUrl(session.user.avatarUrl);
    }

    let cancelled = false;
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile(session.accessToken);
        if (cancelled) return;
        if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        if (profile.username) setResolvedInitial(profile.username.slice(0, 1).toUpperCase());
      } catch {
        // Keeps fallback data from auth session when profile request fails.
      }
    };
    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#156b50]/60 bg-[#1a8162] shadow-[0_4px_16px_rgba(13,87,64,0.28)] ${className ?? ""}`.trim()}
    >
      <div className="h-full w-full px-2 sm:px-4 lg:px-6 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 min-w-fit">
          <Link href="/feed">
            <Image
              className="block h-8 w-auto min-w-[90px] object-contain object-left"
              src="/biblioo-logo-branca.png"
              alt="Biblioo"
              width={120}
              height={32}
              style={{ width: "auto" }}
            />
          </Link>
        </div>

        <SearchBar searchPlaceholder={searchPlaceholder} />

        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          <NotificationsDropdown accessToken={accessToken} fallbackCount={notificationsCount} />
          <ProfileMenu
            resolvedInitial={resolvedInitial}
            avatarUrl={avatarUrl}
            onLogout={() => setAccessToken(null)}
          />
        </div>
      </div>
    </header>
  );
});

export default TopHeader;
