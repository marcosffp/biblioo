import React from "react";
import { Clock, MessageCircle, Globe, Lock, Users } from "lucide-react";
import { parseBookTitle } from "@/utils/book-utils";

export interface CommunityCardProps {
  name: string;
  description?: string;
  bookTitle?: string;
  bookCoverUrl?: string | null;
  visibility?: "PUBLIC" | "PRIVATE";
  members?: number;
  coverUrl?: string;
  className?: string;
  onClick?: () => void;
  actionLabel?: string;
  onActionClick?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  pendingJoinRequest?: boolean;
}


function getAvatarStyle(coverUrl: string | undefined | null, isPublic: boolean): React.CSSProperties {
  if (coverUrl) {
    return { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { backgroundColor: isPublic ? "#d1fae5" : "#f1f5f9", color: isPublic ? "#059669" : "#64748b" };
}

interface ActionButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onClick: (e: React.MouseEvent) => void;
}

function ActionButton({ label, loading, disabled, ariaLabel, onClick }: Readonly<ActionButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-[0.85rem] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <MessageCircle size={15} className="text-emerald-500" />
      {loading ? "Processando..." : label}
    </button>
  );
}

export function CommunityCard({
  name,
  description,
  bookTitle,
  bookCoverUrl,
  visibility = "PUBLIC",
  members,
  coverUrl,
  className,
  onClick,
  actionLabel,
  onActionClick,
  actionDisabled,
  actionLoading,
  pendingJoinRequest,
}: Readonly<CommunityCardProps>) {
  const isPublic = visibility === "PUBLIC";
  const VisibilityIcon = isPublic ? Globe : Lock;
  const visibilityLabel = isPublic ? "Pública" : "Privada";
  const { title: bookName, author: bookAuthor } = parseBookTitle(bookTitle ?? "Leitura não informada");
  const hasAction = !!(actionLabel && onActionClick);
  const displayCoverUrl = coverUrl ?? bookCoverUrl;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  let actionContent: React.ReactNode = null;
  if (pendingJoinRequest) {
    actionContent = (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-medium text-amber-700">
        <Clock size={14} />
        Solicitação enviada
      </div>
    );
  } else if (hasAction) {
    actionContent = (
      <ActionButton
        label={actionLabel}
        loading={actionLoading}
        disabled={actionDisabled}
        onClick={handleActionClick}
      />
    );
  } else if (onClick) {
    actionContent = (
      <ActionButton
        label="Ver comunidade"
        ariaLabel={`Abrir comunidade ${name}`}
        onClick={handleCardClick}
      />
    );
  }

  return (
    <div
      className={`flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] ${className ?? ""}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-bold"
            style={getAvatarStyle(displayCoverUrl, isPublic)}
            aria-hidden
          >
            {displayCoverUrl ? null : name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[1.05rem] font-bold leading-tight text-slate-800">
              {name}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-[0.8rem] text-slate-500">
              <Users size={13} />
              <span>{typeof members === "number" ? `${members} membros` : "—"}</span>
            </div>
          </div>
        </div>

        <div
          className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            isPublic ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
          }`}
        >
          <VisibilityIcon size={11} />
          {visibilityLabel}
        </div>
      </div>

      {description ? (
        <p className="mt-3 line-clamp-2 text-[0.88rem] leading-relaxed text-slate-500">{description}</p>
      ) : null}

      <div className="mt-4 rounded-2xl bg-emerald-50/80 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/80">Leitura atual</p>
        <p className="mt-1 line-clamp-1 text-[0.9rem] font-semibold leading-snug text-slate-800">{bookName}</p>
        {bookAuthor ? (
          <p className="mt-0.5 line-clamp-1 text-[0.78rem] text-emerald-600">{bookAuthor}</p>
        ) : null}
      </div>

      {actionContent}
    </div>
  );
}

export default CommunityCard;
