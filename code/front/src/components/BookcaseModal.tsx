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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${maxWidthClassName} rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
