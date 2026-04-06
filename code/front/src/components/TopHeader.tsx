"use client";

import Link from "next/link";
import React from "react";
import { Bell, BookOpen, Search } from "lucide-react";
import { getAuthSession } from "@/services/auth";
import { getMyProfile } from "@/services/profile";

export interface TopHeaderProps {
  title?: string;
  searchPlaceholder?: string;
  notificationsCount?: number;
  userInitial?: string;
  className?: string;
}

export function TopHeader({
  title = "Biblioo",
  searchPlaceholder = "Buscar livros, leitores, clubes...",
  notificationsCount = 2,
  userInitial = "U",
  className,
}: Readonly<TopHeaderProps>) {
  const hasNotifications = notificationsCount > 0;
  const [resolvedInitial, setResolvedInitial] = React.useState(userInitial.toUpperCase().slice(0, 1));
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const session = getAuthSession();

    if (!session?.accessToken) {
      return;
    }

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

        if (cancelled) {
          return;
        }

        if (profile.avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
        }

        if (profile.username) {
          setResolvedInitial(profile.username.slice(0, 1).toUpperCase());
        }
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
      className={
        `fixed top-0 left-0 right-0 h-16 bg-white border-b border-emerald-100 z-50 ${className ?? ""}`.trim()
      }
    >
      <div className="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 min-w-fit text-[var(--deep-green)]">
          <BookOpen size={21} className="text-[hsl(var(--primary-dark))]" aria-hidden="true" />
          <span className="font-heading text-[1.85rem] leading-none tracking-tight">{title}</span>
        </div>

        <div className="flex-1 flex justify-center px-1 sm:px-4">
          <label
            htmlFor="global-search"
            className="relative w-full max-w-[540px]"
            aria-label="Busca global"
          >
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              placeholder={searchPlaceholder}
              className="w-full h-10 rounded-xl border border-emerald-200 bg-emerald-50/40 pl-11 pr-4 text-sm text-[var(--deep-green)] placeholder:text-[hsl(var(--muted-foreground))] transition-all duration-200 focus:border-emerald-300 focus:bg-white"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
          <button
            type="button"
            className="relative h-10 w-10 rounded-full text-[var(--deep-green)] hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-200 transition-colors"
            aria-label="Notificacoes"
          >
            <Bell size={18} className="mx-auto" aria-hidden="true" />
            {hasNotifications ? (
              <span className="absolute right-1.5 top-1.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold leading-4 text-center">
                {notificationsCount}
              </span>
            ) : null}
          </button>

          <Link
            href="/profile"
            className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm hover:bg-emerald-200 transition-colors overflow-hidden flex items-center justify-center"
            aria-label="Ir para meu perfil"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Foto do perfil" className="h-full w-full object-cover" />
            ) : (
              <span>{resolvedInitial}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
