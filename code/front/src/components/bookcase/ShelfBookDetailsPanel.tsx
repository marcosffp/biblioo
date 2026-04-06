import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";
import { RatingStars } from "@/components";
import type { ShelfBook } from "@/hooks/useBookcasePage";
import type { ReadingStatus } from "@/utils/bookcase-filters";

interface ShelfBookDetailsPanelProps {
  isOpen: boolean;
  book: ShelfBook | null;
  onClose: () => void;
  onSelectStatus: (status: Exclude<ReadingStatus, "todos">) => void;
  onStepPage: (delta: number) => void;
  isSaving: boolean;
  errorMessage: string;
}

const statusOptions: Array<{ value: Exclude<ReadingStatus, "todos">; label: string; Icon: typeof BookOpen }> = [
  { value: "lendo", label: "Lendo", Icon: BookOpen },
  { value: "quero-ler", label: "Quero Ler", Icon: Bookmark },
  { value: "lido", label: "Lido", Icon: CheckCircle2 },
  { value: "relendo", label: "Relendo", Icon: RotateCcw },
  { value: "abandonei", label: "Abandonei", Icon: XCircle },
];

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function ShelfBookDetailsPanel({
  isOpen,
  book,
  onClose,
  onSelectStatus,
  onStepPage,
  isSaving,
  errorMessage,
}: Readonly<ShelfBookDetailsPanelProps>) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const progressPercent = useMemo(() => {
    if (!book) {
      return 0;
    }

    if (typeof book.progress === "number") {
      return clampPercent(book.progress);
    }

    if (typeof book.currentPage === "number" && typeof book.totalPages === "number" && book.totalPages > 0) {
      return clampPercent((book.currentPage / book.totalPages) * 100);
    }

    return 0;
  }, [book]);

  if (!isOpen || !book) {
    return null;
  }

  const activeStatus =
    statusOptions.find((statusOption) => statusOption.value === book.readingStatus) ?? statusOptions[0];
  const ActiveStatusIcon = activeStatus.Icon;

  const currentPage = book.currentPage ?? 0;
  const totalPages = book.totalPages ?? 0;
  const canDecreasePage = !isSaving && currentPage > 0;
  const canIncreasePage = !isSaving && (totalPages <= 0 || currentPage < totalPages);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
          aria-label="Voltar para estante"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="mx-auto max-w-3xl text-center">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Capa de ${book.title}`}
                className="mx-auto h-44 w-32 rounded-[14px] object-cover sm:h-52 sm:w-36"
              />
            ) : (
              <div className="mx-auto flex h-44 w-32 items-center justify-center rounded-[14px] bg-[var(--brand-100)] text-sm font-medium text-[var(--brand-600)] sm:h-52 sm:w-36">
                Capa do Livro
              </div>
            )}

            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{book.title}</h2>
            <p className="mt-1 text-2xl text-[var(--text-secondary)]">{book.author}</p>

            {typeof book.rating === "number" ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-[var(--text-primary)]">
                <RatingStars value={book.rating} />
                <span className="text-xl font-semibold">{book.rating.toFixed(1)}</span>
                <span className="text-base text-[var(--text-secondary)]">(avaliações)</span>
              </div>
            ) : null}

            <p className="mt-4 text-base text-[var(--text-secondary)]">
              {totalPages > 0 ? `${totalPages} páginas` : "Páginas indisponíveis"}
            </p>
          </div>
        </div>

        <section className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <button
            type="button"
            onClick={() => setIsStatusOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--brand-500)] px-4 py-3 text-left text-white"
            aria-expanded={isStatusOpen}
            aria-label="Alternar opções de status"
          >
            <span className="inline-flex items-center gap-2 text-xl font-semibold">
              <ActiveStatusIcon size={20} />
              {activeStatus.label}
            </span>
            {isStatusOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {isStatusOpen ? (
            <div className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)]">
              {statusOptions.map((statusOption) => {
                const Icon = statusOption.Icon;
                const isActive = statusOption.value === book.readingStatus;

                return (
                  <button
                    key={statusOption.value}
                    type="button"
                    onClick={() => {
                      setIsStatusOpen(false);
                      onSelectStatus(statusOption.value);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[var(--text-primary)] transition ${
                      isActive ? "bg-[var(--brand-100)]" : "bg-[var(--bg-surface)] hover:bg-[var(--bg-soft)]"
                    }`}
                  >
                    <Icon size={18} className="text-[var(--text-secondary)]" />
                    <span className="text-xl">{statusOption.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>Progresso de leitura</span>
              <span className="font-semibold text-[var(--text-primary)]">{Math.round(progressPercent)}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--brand-100)]">
              <div
                className="h-full rounded-full bg-[var(--brand-500)] transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 text-[var(--text-primary)]">
              <span className="text-lg text-[var(--text-secondary)]">Página atual:</span>
              <button
                type="button"
                onClick={() => onStepPage(-1)}
                disabled={!canDecreasePage}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-soft)] text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Diminuir página atual"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center text-xl font-semibold">{currentPage}</span>
              <button
                type="button"
                onClick={() => onStepPage(1)}
                disabled={!canIncreasePage}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-soft)] text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Aumentar página atual"
              >
                <Plus size={16} />
              </button>
              <span className="text-lg text-[var(--text-secondary)]">/ {totalPages > 0 ? totalPages : "--"}</span>
            </div>
          </div>

          {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
        </section>

        <section className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--brand-600)]">
                <Users size={18} />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Comunidade do Livro</h3>
                <p className="text-sm text-[var(--text-secondary)]">Leitores discutindo este título</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-[var(--radius-md)] border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]"
            >
              Participar
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Sinopse</h3>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
            {book.synopsis?.trim()
              ? book.synopsis
              : "Sinopse indisponível no momento. Assim que o conteúdo estiver disponível na API, ele será exibido aqui."}
          </p>
        </section>
      </div>
    </div>
  );
}

export default ShelfBookDetailsPanel;
