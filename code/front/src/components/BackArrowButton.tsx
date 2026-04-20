import { ArrowLeft } from "lucide-react";

export interface BackArrowButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  label?: string;
  className?: string;
}

export function BackArrowButton({
  onClick,
  ariaLabel = "Voltar",
  label = "Voltar",
  className,
}: Readonly<BackArrowButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] ${className ?? ""}`.trim()}
      aria-label={ariaLabel}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}

export default BackArrowButton;
