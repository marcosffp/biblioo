"use client";

import React from "react";
import { Star, PenLine } from "lucide-react";
import { getAuthSession } from "@/services/auth";
import type { AuthSession } from "@/types";

interface FeedComposeCardProps {
  onOpenReview: () => void;
  onOpenPost: () => void;
}

export function FeedComposeCard({ onOpenReview, onOpenPost }: FeedComposeCardProps) {
  const [session, setSession] = React.useState<AuthSession | null>(null);

  React.useEffect(() => {
    setSession(getAuthSession());
  }, []);

  const avatarUrl = session?.user.avatarUrl ?? null;
  const initials = (session?.user.username ?? "EU").slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Seu avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-emerald-700">{initials}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenPost}
          className="flex-1 rounded-full border border-gray-200 bg-emerald-50/60 px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-emerald-50 transition-colors"
        >
          O que você quer compartilhar?
        </button>
      </div>

      <div className="mt-3 flex items-center border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={onOpenReview}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-emerald-700 transition-colors"
        >
          <Star size={16} aria-hidden />
          Avaliar Livro
        </button>

        <div className="h-5 w-px bg-gray-200" />

        <button
          type="button"
          onClick={onOpenPost}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-emerald-700 transition-colors"
        >
          <PenLine size={16} aria-hidden />
          Escrever Post
        </button>
      </div>
    </div>
  );
}
