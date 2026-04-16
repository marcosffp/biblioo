import React from "react";
import { ChevronRight, Globe, Lock, MessageSquare, Users } from "lucide-react";

export interface CommunityCardProps {
  name: string;
  description?: string;
  bookTitle?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  members?: number;
  discussions?: number;
  coverUrl?: string;
  className?: string;
  onClick?: () => void;
}

export function CommunityCard({
  name,
  description,
  bookTitle,
  visibility = "PUBLIC",
  members,
  discussions,
  coverUrl,
  className,
  onClick,
}: CommunityCardProps) {
  const VisibilityIcon = visibility === "PRIVATE" ? Lock : Globe;
  const visibilityLabel = visibility === "PRIVATE" ? "Comunidade privada" : "Comunidade publica";
  const subtitle = bookTitle ?? description;

  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-white px-4 py-5 shadow-sm sm:px-5 ${onClick ? "cursor-pointer transition-colors hover:bg-emerald-50/40" : ""} ${className ?? ""}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100/80"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          aria-hidden
        >
          {coverUrl ? null : <Users size={24} className="text-[var(--brand-700)]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{name}</h3>
            <VisibilityIcon size={14} className="text-[var(--text-secondary)]" aria-label={visibilityLabel} />
          </div>

          {subtitle ? <p className="mt-1 truncate text-base text-[var(--text-secondary)]">{subtitle}</p> : null}

          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            {typeof members === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Users size={14} />
                {members}
              </span>
            ) : null}

            {typeof discussions === "number" ? (
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={14} />
                {discussions}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
          className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)]"
          aria-label={`Abrir comunidade ${name}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default CommunityCard;
