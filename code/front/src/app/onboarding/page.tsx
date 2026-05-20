"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, BookOpen } from "lucide-react";
import { getAccessToken } from "@/services/auth";

const ONBOARDING_KEY = "biblioo.onboarding.completed";
const GENRES_KEY = "biblioo.preferences.genres";
const FREQUENCY_KEY = "biblioo.preferences.readingFrequency";

const GENRES = [
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "ficcao-cientifica", label: "Ficção Científica", emoji: "🚀" },
  { id: "fantasia", label: "Fantasia", emoji: "🧙" },
  { id: "misterio", label: "Mistério", emoji: "🔍" },
  { id: "terror", label: "Terror", emoji: "👻" },
  { id: "thriller", label: "Thriller", emoji: "😰" },
  { id: "aventura", label: "Aventura", emoji: "🗺️" },
  { id: "historico", label: "Histórico", emoji: "🏛️" },
  { id: "autoajuda", label: "Autoajuda", emoji: "✨" },
  { id: "classicos", label: "Clássicos", emoji: "📜" },
  { id: "poesia", label: "Poesia", emoji: "🌸" },
  { id: "filosofia", label: "Filosofia", emoji: "🤔" },
  { id: "biografia", label: "Biografia", emoji: "📖" },
  { id: "jovem-adulto", label: "Jovem Adulto", emoji: "🌟" },
  { id: "hq-manga", label: "HQ / Mangá", emoji: "🎨" },
  { id: "humor", label: "Humor", emoji: "😂" },
] as const;

const FREQUENCIES = [
  {
    id: "daily",
    label: "Todo dia",
    description: "Leio pelo menos um pouco todos os dias",
    emoji: "📅",
  },
  {
    id: "weekly",
    label: "Algumas vezes por semana",
    description: "Leio quando encontro um tempo livre",
    emoji: "📆",
  },
  {
    id: "weekends",
    label: "Fins de semana",
    description: "Reservo o fim de semana para leitura",
    emoji: "🛋️",
  },
  {
    id: "casual",
    label: "Quando tenho tempo",
    description: "Leio sem frequência definida",
    emoji: "🌊",
  },
] as const;

const slideVariants = {
  enter: { opacity: 0, x: 48 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    if (localStorage.getItem(ONBOARDING_KEY) === "true") {
      router.replace("/feed");
    }
  }, [router]);

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const finish = () => {
    localStorage.setItem(GENRES_KEY, JSON.stringify(selectedGenres));
    localStorage.setItem(FREQUENCY_KEY, selectedFrequency);
    localStorage.setItem(ONBOARDING_KEY, "true");
    router.push("/feed");
  };

  const canAdvance = selectedGenres.length >= 3;
  const canFinish = selectedFrequency !== "";
  const remaining = Math.max(0, 3 - selectedGenres.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      {/* Progress bar */}
      <div className="fixed inset-x-0 top-0 z-10 h-1 bg-[var(--border-soft)]">
        <motion.div
          className="h-full bg-[var(--brand-500)]"
          initial={{ width: "0%" }}
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-8">
        {/* Logo */}
        <div className="mb-14 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-500)]">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">biblioo</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-500)]">
                Passo 1 de 2
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Quais gêneros você mais curte?
              </h1>
              <p className="mt-2 text-[var(--text-secondary)]">
                Escolha pelo menos 3 para personalizarmos suas recomendações.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {GENRES.map((genre) => {
                  const selected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-150 ${
                        selected
                          ? "border-[var(--brand-500)] bg-[hsl(var(--brand-500)/0.10)] text-[var(--brand-600)] shadow-[0_0_0_4px_hsl(var(--brand-500)/0.10)]"
                          : "border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-300)] hover:bg-[hsl(var(--brand-500)/0.04)]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-500)]">
                          <Check size={11} strokeWidth={3} className="text-white" />
                        </span>
                      )}
                      <span className="text-3xl leading-none">{genre.emoji}</span>
                      <span className="text-sm font-medium leading-tight">{genre.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedGenres.length} selecionado{selectedGenres.length !== 1 ? "s" : ""}
                  {remaining > 0 && (
                    <span className="ml-1 text-[var(--brand-500)]">
                      · selecione mais {remaining}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_hsl(var(--brand-500)/0.30)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={finish}
                className="mt-5 block w-full text-center text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Pular por agora
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-500)]">
                Passo 2 de 2
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Com que frequência você lê?
              </h1>
              <p className="mt-2 text-[var(--text-secondary)]">
                Vamos ajudar você a manter o ritmo certo de leitura.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {FREQUENCIES.map((freq) => {
                  const selected = selectedFrequency === freq.id;
                  return (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setSelectedFrequency(freq.id)}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-150 ${
                        selected
                          ? "border-[var(--brand-500)] bg-[hsl(var(--brand-500)/0.10)] shadow-[0_0_0_4px_hsl(var(--brand-500)/0.10)]"
                          : "border-[var(--border-soft)] bg-white hover:border-[var(--brand-300)] hover:bg-[hsl(var(--brand-500)/0.04)]"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 text-3xl leading-none">{freq.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${selected ? "text-[var(--brand-600)]" : "text-[var(--text-primary)]"}`}>
                          {freq.label}
                        </p>
                        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                          {freq.description}
                        </p>
                      </div>
                      {selected && (
                        <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-500)]">
                          <Check size={13} strokeWidth={3} className="text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={finish}
                  disabled={!canFinish}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_hsl(var(--brand-500)/0.30)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Começar a explorar
                  <ArrowRight size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={finish}
                className="mt-5 block w-full text-center text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Pular por agora
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
