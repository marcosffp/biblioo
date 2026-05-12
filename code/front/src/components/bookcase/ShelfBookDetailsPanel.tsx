import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, Rss, Trash2 } from "lucide-react";
import { BackHeader, RatingStars, TopHeader } from "@/components";
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
  reviewSuccessMessage: string;
  reviewError: string;
  isSavingReview: boolean;
  isLoadingReview?: boolean;
  isSaving: boolean;
  isRemovingFromShelf: boolean;
  errorMessage: string;
}

interface ReviewFormProps {
  reviewRating: number;
  reviewComment: string;
  reviewExists: boolean;
  onChangeReviewRating: (rating: number) => void;
  onChangeReviewComment: (value: string) => void;
  onSaveReview: () => void;
  reviewSuccessMessage: string;
  reviewError: string;
  isSavingReview: boolean;
  isLoadingReview: boolean;
}


const statusOptions: Array<{
  value: Exclude<ReadingStatus, "todos">;
  label: string;
  buttonClassName: string;
  menuActiveClassName: string;
  swatchClassName: string;
}> = [
  {
    value: "lendo",
    label: "Lendo",
    buttonClassName: "bg-blue-600 text-white",
    menuActiveClassName: "bg-blue-50 text-blue-800",
    swatchClassName: "bg-blue-600",
  },
  {
    value: "quero-ler",
    label: "Quero Ler",
    buttonClassName: "bg-violet-600 text-white",
    menuActiveClassName: "bg-violet-50 text-violet-800",
    swatchClassName: "bg-violet-600",
  },
  {
    value: "lido",
    label: "Lido",
    buttonClassName: "bg-emerald-600 text-white",
    menuActiveClassName: "bg-emerald-50 text-emerald-800",
    swatchClassName: "bg-emerald-600",
  },
  {
    value: "relendo",
    label: "Relendo",
    buttonClassName: "bg-amber-500 text-white",
    menuActiveClassName: "bg-amber-50 text-amber-800",
    swatchClassName: "bg-amber-500",
  },
  {
    value: "abandonei",
    label: "Abandonei",
    buttonClassName: "bg-rose-600 text-white",
    menuActiveClassName: "bg-rose-50 text-rose-800",
    swatchClassName: "bg-rose-600",
  },
];

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

const COLLAPSED_SYNOPSIS_MAX_SENTENCES = 3;
const COLLAPSED_SYNOPSIS_FALLBACK_CHARS = 280;

function buildCollapsedSynopsis(text: string): string {
  const normalized = text.trim();
  if (!normalized) {
    return "";
  }

  const sentences = normalized.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (sentences && sentences.length >= COLLAPSED_SYNOPSIS_MAX_SENTENCES) {
    return sentences.slice(0, COLLAPSED_SYNOPSIS_MAX_SENTENCES).join("").trim();
  }

  const byChars = normalized.slice(0, COLLAPSED_SYNOPSIS_FALLBACK_CHARS).trimEnd();
  if (byChars.length >= normalized.length) {
    return normalized;
  }

  return `${byChars}...`;
}

function ReviewForm({
  reviewRating,
  reviewComment,
  reviewExists,
  onChangeReviewRating,
  onChangeReviewComment,
  onSaveReview,
  reviewSuccessMessage,
  reviewError,
  isSavingReview,
  isLoadingReview,
}: Readonly<ReviewFormProps>) {
  const saveLabel = isSavingReview ? "Salvando..." : reviewExists ? "Atualizar avaliação" : "Publicar avaliação";

  if (isLoadingReview) {
    return <p className="mt-2 text-sm text-[var(--text-secondary)]">Carregando sua avaliação...</p>;
  }

  return (
    <>
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <Rss size={15} className="mt-0.5 flex-shrink-0 text-emerald-600" />
        <p className="text-xs text-emerald-700">
          <strong>Publicada automaticamente no feed</strong> — seus seguidores verão esta avaliação.
        </p>
      </div>

      <fieldset className="mb-3 flex items-center" aria-label="Selecionar nota de 1 a 5 estrelas">
        <RatingStars value={reviewRating} size={28} onChange={onChangeReviewRating} />
      </fieldset>

      <p className="text-sm text-[var(--text-secondary)]">Comentário (opcional)</p>
      <textarea
        value={reviewComment}
        onChange={(event) => onChangeReviewComment(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Escreva sua opinião sobre o livro..."
        className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-500)]"
      />
      <p className="mt-1 text-right text-xs text-[var(--text-secondary)]">{reviewComment.length}/2000 caracteres</p>

      {reviewError ? <p className="mt-2 text-sm text-red-600">{reviewError}</p> : null}

      {reviewSuccessMessage ? (
        <p className="mt-2 rounded-[var(--radius-md)] border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {reviewSuccessMessage}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSaveReview}
          disabled={isSavingReview}
          className="rounded-[var(--radius-md)] bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveLabel}
        </button>
      </div>
    </>
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
  reviewSuccessMessage,
  reviewError,
  isSavingReview,
  isLoadingReview,
  isSaving,
  isRemovingFromShelf,
  errorMessage,
}: Readonly<ShelfBookDetailsPanelProps>) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [pageDraft, setPageDraft] = useState("0");
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);

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

  const currentPage = book?.currentPage ?? 0;
  const totalPages = book?.totalPages ?? 0;

  useEffect(() => {
    setPageDraft(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    if (reviewSuccessMessage) {
      const timer = setTimeout(() => setIsReviewExpanded(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [reviewSuccessMessage]);

  if (!isOpen || !book) {
    return null;
  }

  const activeStatus =
    statusOptions.find((statusOption) => statusOption.value === book.readingStatus) ?? statusOptions[0];
  const canDecreasePage = !isSaving && currentPage > 0;
  const canIncreasePage = !isSaving && (totalPages <= 0 || currentPage < totalPages);
  const publicRatingValue = typeof book.rating === "number" ? book.rating.toFixed(1) : "--";
  const readCount = book.readerCount ?? (totalPages > 0 && currentPage >= totalPages ? 1 : 0);
  const readingCount = currentPage > 0 && (totalPages <= 0 || currentPage < totalPages) ? 1 : 0;
  const wantedCount = book.readingStatus === "quero-ler" ? 1 : 0;
  const abandonedCount = book.readingStatus === "abandonei" ? 1 : 0;
  const reviewCount = reviewExists ? 1 : 0;
  const synopsisText = (book.synopsis ?? book.description ?? "").trim();
  const collapsedSynopsis = buildCollapsedSynopsis(synopsisText);
  const hasLongSynopsis = synopsisText.length > collapsedSynopsis.length;
  const displayedSynopsis = hasLongSynopsis && !isSynopsisExpanded ? collapsedSynopsis : synopsisText;

  const commitPageDraft = () => {
    const normalizedDraft = pageDraft.trim();
    if (!normalizedDraft) {
      setPageDraft(String(currentPage));
      return;
    }

    const parsedPage = Number(normalizedDraft);
    if (!Number.isInteger(parsedPage) || parsedPage < 0) {
      setPageDraft(String(currentPage));
      return;
    }

    const nextPage = totalPages > 0 ? Math.min(parsedPage, totalPages) : parsedPage;
    setPageDraft(String(nextPage));

    if (nextPage !== currentPage) {
      onSetPage?.(nextPage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <TopHeader />
      <div className="h-16" aria-hidden="true" />

      <div className="sticky top-16 z-20 bg-[var(--bg-surface)]">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-4 sm:px-8 lg:px-12">
          <BackHeader
            onBack={onClose}
            ariaLabel="Voltar para estante"
            backLabel="Voltar para estante"
            className="items-center"
            titleClassName="text-sm font-semibold text-[var(--text-secondary)]"
          />
        </div>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 pb-12 pt-8 sm:px-8 lg:px-12">
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
                  <span>{activeStatus.label}</span>
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
                        <span className={`h-3 w-3 rounded-full ${statusOption.swatchClassName}`} aria-hidden="true" />
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
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageDraft}
                onChange={(event) => setPageDraft(event.target.value)}
                onBlur={commitPageDraft}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();
                  commitPageDraft();
                }}
                disabled={isSaving}
                className="h-8 w-20 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white px-2 text-center text-base font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Digitar página atual"
              />
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

        <section className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Sua avaliação</h3>
              {!isReviewExpanded && reviewExists && reviewRating > 0 ? (
                <div className="mt-1 flex items-center gap-3">
                  <RatingStars value={reviewRating} size={20} />
                  {reviewComment.trim() ? (
                    <p className="line-clamp-1 text-sm text-[var(--text-secondary)]">
                      {reviewComment.trim()}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {!isReviewExpanded && !reviewExists ? (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Nenhuma avaliação ainda.</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setIsReviewExpanded((v) => !v)}
              className="flex-shrink-0 rounded-[var(--radius-md)] border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-soft)]"
            >
              {isReviewExpanded ? "Cancelar" : reviewExists ? "Editar avaliação" : "Avaliar"}
            </button>
          </div>

          {isReviewExpanded ? (
            <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
              <ReviewForm
                reviewRating={reviewRating}
                reviewComment={reviewComment}
                reviewExists={reviewExists}
                onChangeReviewRating={onChangeReviewRating}
                onChangeReviewComment={onChangeReviewComment}
                onSaveReview={onSaveReview}
                reviewSuccessMessage={reviewSuccessMessage}
                reviewError={reviewError}
                isSavingReview={isSavingReview}
                isLoadingReview={isLoadingReview ?? false}
              />
            </div>
          ) : null}
        </section>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onRemoveFromShelf}
            disabled={isRemovingFromShelf}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--danger-600)] transition hover:bg-[var(--danger-50)] hover:text-[var(--danger-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-300)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={14} />
            {isRemovingFromShelf ? "Removendo..." : "Remover da estante"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShelfBookDetailsPanel;
