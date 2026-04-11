import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Minus,
  Plus,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";
import { BackArrowButton, RatingStars } from "@/components";
import type { ShelfBook } from "@/hooks/useBookcasePage";
import type { ReadingStatus } from "@/utils/bookcase-filters";

interface ShelfBookDetailsPanelProps {
  isOpen: boolean;
  book: ShelfBook | null;
  onClose: () => void;
  onSelectStatus: (status: Exclude<ReadingStatus, "todos">) => void;
  onStepPage: (delta: number) => void;
  onSetPage?: (page: number) => void;
  onRemoveFromShelf: () => void;
  reviewRating: number;
  reviewComment: string;
  reviewExists: boolean;
  onChangeReviewRating: (rating: number) => void;
  onChangeReviewComment: (value: string) => void;
  onSaveReview: () => void;
  reviewError: string;
  isSavingReview: boolean;
  isLoadingReview?: boolean;
  isSaving: boolean;
  isRemovingFromShelf: boolean;
  errorMessage: string;
}

interface ReviewSectionProps {
  reviewRating: number;
  reviewComment: string;
  reviewExists: boolean;
  onChangeReviewRating: (rating: number) => void;
  onChangeReviewComment: (value: string) => void;
  onSaveReview: () => void;
  reviewError: string;
  isSavingReview: boolean;
  isLoadingReview: boolean;
}

const statusOptions: Array<{
  value: Exclude<ReadingStatus, "todos">;
  label: string;
  Icon: typeof BookOpen;
  buttonClassName: string;
  menuActiveClassName: string;
  iconClassName: string;
}> = [
  {
    value: "lendo",
    label: "Lendo",
    Icon: BookOpen,
    buttonClassName: "bg-blue-600 text-white",
    menuActiveClassName: "bg-blue-50 text-blue-800",
    iconClassName: "text-blue-600",
  },
  {
    value: "quero-ler",
    label: "Quero Ler",
    Icon: Bookmark,
    buttonClassName: "bg-violet-600 text-white",
    menuActiveClassName: "bg-violet-50 text-violet-800",
    iconClassName: "text-violet-600",
  },
  {
    value: "lido",
    label: "Lido",
    Icon: CheckCircle2,
    buttonClassName: "bg-emerald-600 text-white",
    menuActiveClassName: "bg-emerald-50 text-emerald-800",
    iconClassName: "text-emerald-600",
  },
  {
    value: "relendo",
    label: "Relendo",
    Icon: RotateCcw,
    buttonClassName: "bg-amber-500 text-white",
    menuActiveClassName: "bg-amber-50 text-amber-800",
    iconClassName: "text-amber-500",
  },
  {
    value: "abandonei",
    label: "Abandonei",
    Icon: XCircle,
    buttonClassName: "bg-rose-600 text-white",
    menuActiveClassName: "bg-rose-50 text-rose-800",
    iconClassName: "text-rose-600",
  },
];

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function ReviewSection({
  reviewRating,
  reviewComment,
  reviewExists,
  onChangeReviewRating,
  onChangeReviewComment,
  onSaveReview,
  reviewError,
  isSavingReview,
  isLoadingReview = false,
}: Readonly<ReviewSectionProps>) {
  let saveReviewLabel = "Salvar avaliação";
  if (reviewExists) {
    saveReviewLabel = "Atualizar avaliação";
  }
  if (isSavingReview) {
    saveReviewLabel = "Salvando...";
  }

  return (
    <section className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <h3 className="text-xl font-semibold text-[var(--text-primary)]">Sua avaliação</h3>

      {isLoadingReview ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Carregando sua avaliação...</p>
      ) : (
        <>
          <fieldset className="mt-3 flex items-center" aria-label="Selecionar nota de 1 a 5 estrelas">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isActive = reviewRating >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => onChangeReviewRating(starValue)}
                  className={`text-3xl leading-none transition ${
                    isActive ? "text-[var(--brand-500)]" : "text-[#a8b8aa] hover:text-[var(--brand-600)]"
                  }`}
                  aria-label={`${starValue} estrela${starValue > 1 ? "s" : ""}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`icon-star ${isActive ? "text-amber-300" : "text-amber-100"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </fieldset>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">Comentário (opcional)</p>
          <textarea
            value={reviewComment}
            onChange={(event) => onChangeReviewComment(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Escreva sua opinião sobre o livro..."
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-500)]"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)]">{reviewComment.length}/2000 caracteres</p>
            <button
              type="button"
              onClick={onSaveReview}
              disabled={isSavingReview}
              className="rounded-[var(--radius-md)] bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveReviewLabel}
            </button>
          </div>

          {reviewError ? <p className="mt-3 text-sm text-red-600">{reviewError}</p> : null}
        </>
      )}
    </section>
  );
}

export function ShelfBookDetailsPanel({
  isOpen,
  book,
  onClose,
  onSelectStatus,
  onStepPage,
  onSetPage,
  onRemoveFromShelf,
  reviewRating,
  reviewComment,
  reviewExists,
  onChangeReviewRating,
  onChangeReviewComment,
  onSaveReview,
  reviewError,
  isSavingReview,
  isLoadingReview,
  isSaving,
  isRemovingFromShelf,
  errorMessage,
}: Readonly<ShelfBookDetailsPanelProps>) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [pageInputDraft, setPageInputDraft] = useState("");

  useEffect(() => {
    setPageInputDraft(String(book?.currentPage ?? 0));
  }, [book?.currentPage, book?.id]);

  useEffect(() => {
    setIsSynopsisExpanded(false);
  }, [book?.id]);

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
  const currentPage = book.currentPage ?? 0;
  const totalPages = book.totalPages ?? 0;
  const canDecreasePage = !isSaving && currentPage > 0;
  const canIncreasePage = !isSaving && (totalPages <= 0 || currentPage < totalPages);
  const publicRatingValue = typeof book.rating === "number" ? book.rating.toFixed(1) : "--";
  const readCount = book.readerCount ?? (totalPages > 0 && currentPage >= totalPages ? 1 : 0);
  const readingCount = currentPage > 0 && (totalPages <= 0 || currentPage < totalPages) ? 1 : 0;
  const wantedCount = book.readingStatus === "quero-ler" ? 1 : 0;
  const abandonedCount = book.readingStatus === "abandonei" ? 1 : 0;
  const reviewCount = reviewExists ? 1 : 0;
  const synopsisText = (book.synopsis ?? book.description ?? "").trim();
  const hasLongSynopsis = synopsisText.length > 100;
  const displayedSynopsis = hasLongSynopsis && !isSynopsisExpanded ? `${synopsisText.slice(0, 100).trimEnd()}...` : synopsisText;

  const commitTypedPage = () => {
    const normalizedDraft = pageInputDraft.trim();
    if (!normalizedDraft) {
      setPageInputDraft(String(currentPage));
      return;
    }

    const parsedPage = Number(normalizedDraft);
    if (!Number.isInteger(parsedPage) || parsedPage < 0) {
      setPageInputDraft(String(currentPage));
      return;
    }

    if (totalPages > 0 && parsedPage > totalPages) {
      setPageInputDraft(String(currentPage));
      return;
    }

    if (parsedPage === currentPage) {
      return;
    }

    if (onSetPage) {
      onSetPage(parsedPage);
      return;
    }

    onStepPage(parsedPage - currentPage);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-10">
          <BackArrowButton onClick={onClose} ariaLabel="Voltar para estante" />
          <span className="text-sm font-semibold text-[var(--text-secondary)]">Detalhes do livro</span>
        </div>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-8 sm:px-6 lg:px-10">
        <div className="mt-1 bg-white sm:p-2">
          <div className="grid gap-6 md:grid-cols-[250px_1fr] md:items-start">
            <div>
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Capa de ${book.title}`}
                  className="h-72 w-52 rounded-[14px] object-cover"
                />
              ) : (
                <div className="flex h-72 w-52 items-center justify-center rounded-[14px] bg-[var(--bg-soft)] text-sm font-medium text-[var(--brand-600)]">
                  Capa do Livro
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <p>
                  <span className="font-semibold text-[var(--text-primary)]">Páginas:</span> {totalPages > 0 ? totalPages : "--"}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsStatusOpen((current) => !current)}
                  className={`inline-flex min-w-[140px] items-center justify-between rounded-full px-4 py-2 text-sm font-semibold ${activeStatus.buttonClassName}`}
                  aria-expanded={isStatusOpen}
                  aria-label="Alternar opções de status"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="icon-bookmark text-[16px] text-white" aria-hidden="true" />
                    <span>{activeStatus.label}</span>
                  </span>
                  <ChevronDown size={16} />
                </button>

              </div>

              {isStatusOpen ? (
                <div className="mt-2 w-[180px] overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(26,46,76,0.15)]">
                  {statusOptions.map((statusOption) => {
                    const isActive = statusOption.value === book.readingStatus;

                    return (
                      <button
                        key={statusOption.value}
                        type="button"
                        onClick={() => {
                          setIsStatusOpen(false);
                          onSelectStatus(statusOption.value);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? `${statusOption.menuActiveClassName}`
                            : "text-[var(--text-primary)] hover:bg-[var(--bg-soft)]"
                        }`}
                      >
                        <span
                          className={`icon-bookmark text-[15px] ${isActive ? statusOption.iconClassName : "text-[var(--text-secondary)]"}`}
                          aria-hidden="true"
                        />
                        <span>{statusOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

            </div>

            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{book.title}</h2>
              <p className="mt-1 text-3xl text-[var(--text-primary)]">{book.author}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <div className="inline-flex rounded-md bg-[#02a362] px-2 py-1 text-2xl font-bold leading-none text-white">
                    {publicRatingValue}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[var(--text-primary)]">
                    {typeof book.rating === "number" ? <RatingStars value={book.rating} /> : null}
                  </div>
                </article>

                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <p className="text-base text-[var(--text-primary)]">Leram</p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--brand-500)]">{readCount}</p>
                </article>

                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <p className="text-base text-[var(--text-primary)]">Lendo</p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--brand-500)]">{readingCount}</p>
                </article>

                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <p className="text-base text-[var(--text-primary)]">Querem</p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--brand-500)]">{wantedCount}</p>
                </article>

                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <p className="text-base text-[var(--text-primary)]">Abandonos</p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--brand-500)]">{abandonedCount}</p>
                </article>

                <article className="rounded-3xl bg-[var(--bg-soft)] p-4">
                  <p className="text-base text-[var(--text-primary)]">Resenhas</p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--brand-500)]">{reviewCount}</p>
                </article>
              </div>

              <section className="mt-6 bg-white">
                <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                  {synopsisText ? displayedSynopsis : "Sinopse indisponível no momento."}
                </p>
                {hasLongSynopsis ? (
                  <button
                    type="button"
                    onClick={() => setIsSynopsisExpanded((current) => !current)}
                    className="mt-2 text-sm font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                  >
                    {isSynopsisExpanded ? "Ver menos" : "Ver mais"}
                  </button>
                ) : null}
              </section>
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-3xl bg-[var(--bg-soft)] p-5">
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-soft)] text-[var(--text-primary)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Diminuir página atual"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center text-xl font-semibold">{currentPage}</span>
              <button
                type="button"
                onClick={() => onStepPage(1)}
                disabled={!canIncreasePage}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-soft)] text-[var(--text-primary)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Aumentar página atual"
              >
                <Plus size={16} />
              </button>
              <span className="text-lg text-[var(--text-secondary)]">/ {totalPages > 0 ? totalPages : "--"}</span>
            </div>
          </div>

          {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
        </section>

        <ReviewSection
          reviewRating={reviewRating}
          reviewComment={reviewComment}
          reviewExists={reviewExists}
          onChangeReviewRating={onChangeReviewRating}
          onChangeReviewComment={onChangeReviewComment}
          onSaveReview={onSaveReview}
          reviewError={reviewError}
          isSavingReview={isSavingReview}
          isLoadingReview={isLoadingReview ?? false}
        />

        <section className="mt-4 rounded-3xl bg-[var(--bg-soft)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--brand-600)]">
                <Users size={18} />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Comunidade do Livro</h3>
                <p className="text-sm text-[var(--text-secondary)]">Leitores discutindo este titulo</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white"
            >
              Participar
            </button>
          </div>
        </section>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onRemoveFromShelf}
            disabled={isRemovingFromShelf}
            className="rounded-[var(--radius-md)] bg-[var(--danger-500)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--danger-600)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRemovingFromShelf ? "Removendo..." : "Remover da estante"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShelfBookDetailsPanel;