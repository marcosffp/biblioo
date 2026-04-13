import type { ReactNode } from "react";

interface BookcaseModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function BookcaseModal({
  title,
  onClose,
  children,
  maxWidthClassName = "max-w-2xl",
}: Readonly<BookcaseModalProps>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#122016]/35 p-4">
      <div
        className={`w-full ${maxWidthClassName} rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-soft)]`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]"
          >
            Fechar
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
