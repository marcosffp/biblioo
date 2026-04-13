import { ArrowLeft } from "lucide-react";

export interface BackArrowButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export function BackArrowButton({ onClick, ariaLabel = "Voltar", className }: Readonly<BackArrowButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)] ${className ?? ""}`.trim()}
      aria-label={ariaLabel}
    >
      <ArrowLeft size={18} />
    </button>
  );
}

export default BackArrowButton;
