"use client";

import React from "react";
import Image from "next/image";
import { Check, Loader2, Search, X } from "lucide-react";
import { searchBooks } from "@/services/bookcase";
import type { BackendBookResponse, CreateVotingRequest, TieBreakRule } from "@/types/api";

interface SelectedBook {
  id: number;
  title: string;
  authors: string[];
  coverUrl: string | null;
}

interface CreateVotingModalProps {
  onClose: () => void;
  onSubmit: (request: CreateVotingRequest) => Promise<void>;
}

function toLocalDateTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowPlusHours(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return toLocalDateTimeValue(d);
}

export function CreateVotingModal({ onClose, onSubmit }: Readonly<CreateVotingModalProps>) {
  const [title, setTitle] = React.useState("");
  const [tieBreakRule, setTieBreakRule] = React.useState<TieBreakRule>("RANDOM_DRAW");
  const [startsAt, setStartsAt] = React.useState(nowPlusHours(0));
  const [endsAt, setEndsAt] = React.useState(nowPlusHours(72));
  const [selectedBooks, setSelectedBooks] = React.useState<SelectedBook[]>([]);
  const [bookQuery, setBookQuery] = React.useState("");
  const [bookResults, setBookResults] = React.useState<BackendBookResponse[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBookQueryChange = (value: string) => {
    setBookQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setBookResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchBooks(value);
        setBookResults(results.filter((b) => !selectedBooks.some((s) => s.id === b.id)));
      } catch {
        setBookResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const addBook = (book: BackendBookResponse) => {
    if (selectedBooks.length >= 6) return;
    if (selectedBooks.some((b) => b.id === book.id)) return;
    setSelectedBooks((prev) => [
      ...prev,
      { id: book.id, title: book.title, authors: book.authors, coverUrl: book.coverUrl ?? null },
    ]);
    setBookQuery("");
    setBookResults([]);
  };

  const removeBook = (id: number) => {
    setSelectedBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const canSubmit =
    title.trim().length >= 1 &&
    selectedBooks.length >= 3 &&
    selectedBooks.length <= 6 &&
    startsAt &&
    endsAt &&
    endsAt > startsAt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        tieBreakRule,
        startsAt: new Date(startsAt).toISOString().slice(0, 19),
        endsAt: new Date(endsAt).toISOString().slice(0, 19),
        options: selectedBooks.map((b) => ({ bookId: b.id })),
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao criar votação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Criar votação de próxima leitura</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="voting-title" className="block text-sm font-medium text-foreground mb-1.5">
              Título da votação
            </label>
            <input
              id="voting-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Ex: Qual será nossa próxima leitura?"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="voting-starts" className="block text-sm font-medium text-foreground mb-1.5">
                Início
              </label>
              <input
                id="voting-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="voting-ends" className="block text-sm font-medium text-foreground mb-1.5">
                Encerramento
              </label>
              <input
                id="voting-ends"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Desempate */}
          <div>
            <span className="block text-sm font-medium text-foreground mb-1.5">Em caso de empate</span>
            <div className="flex gap-3">
              {(["RANDOM_DRAW", "ADMIN_CHOICE"] as TieBreakRule[]).map((rule) => (
                <button
                  key={rule}
                  type="button"
                  onClick={() => setTieBreakRule(rule)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                    tieBreakRule === rule
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {rule === "RANDOM_DRAW" ? "Sorteio aleatório" : "Escolha do admin"}
                </button>
              ))}
            </div>
          </div>

          {/* Livros */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Livros para votação{" "}
              <span className="font-normal text-muted-foreground">({selectedBooks.length}/6, mín. 3)</span>
            </label>

            {selectedBooks.length < 6 && (
              <div className="relative mb-2">
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    value={bookQuery}
                    onChange={(e) => handleBookQueryChange(e.target.value)}
                    placeholder="Buscar livro para adicionar..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                </div>
                {bookResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-border bg-white shadow-md max-h-44 overflow-y-auto">
                    {bookResults.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => addBook(book)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                      >
                        {book.coverUrl && (
                          <Image src={book.coverUrl} alt={book.title} width={28} height={40} className="h-10 w-7 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{book.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{book.authors.join(", ")}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedBooks.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">Adicione entre 3 e 6 livros.</p>
            )}

            <div className="space-y-1.5">
              {selectedBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
                >
                  {book.coverUrl && (
                    <Image src={book.coverUrl} alt={book.title} width={24} height={36} className="h-9 w-6 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{book.authors.join(", ")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBook(book.id)}
                    className="rounded p-0.5 text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label="Remover livro"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form=""
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isSubmitting ? "Criando..." : "Criar votação"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateVotingModal;
