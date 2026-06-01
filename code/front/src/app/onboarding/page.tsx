"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { getAccessToken } from "@/services/auth";
import { getGenres, saveUserPreferences } from "@/services/preferences";
import type { GenreResponse } from "@/types/api";

const ONBOARDING_KEY = "biblioo.onboarding.completed";
const GENRES_KEY = "biblioo.preferences.genres";

interface CuratedGenre {
  id: string;
  keywords: string[];
  label: string;
  emoji: string;
  bg: string;
}

const CURATED_GENRES: CuratedGenre[] = [
  { id: "romance", keywords: ["romance"], label: "Romance", emoji: "❤️", bg: "bg-pink-50" },
  {
    id: "sci-fi",
    keywords: ["science fiction", "sci-fi", "scifi", "scientific"],
    label: "Ficção Científica",
    emoji: "🚀",
    bg: "bg-blue-50",
  },
  { id: "fantasy", keywords: ["fantasy"], label: "Fantasia", emoji: "🧙", bg: "bg-violet-50" },
  {
    id: "mystery",
    keywords: ["mystery", "detective", "crime fiction"],
    label: "Mistério",
    emoji: "🔍",
    bg: "bg-slate-50",
  },
  {
    id: "horror",
    keywords: ["horror", "ghost stories", "supernatural fiction"],
    label: "Terror",
    emoji: "👻",
    bg: "bg-red-50",
  },
  { id: "thriller", keywords: ["thriller", "suspense"], label: "Thriller", emoji: "⚡", bg: "bg-orange-50" },
  { id: "adventure", keywords: ["adventure"], label: "Aventura", emoji: "🧭", bg: "bg-emerald-50" },
  { id: "historical", keywords: ["historical", "history"], label: "Histórico", emoji: "🏛️", bg: "bg-amber-50" },
  {
    id: "self-help",
    keywords: ["self-help", "self help", "personal development", "motivational"],
    label: "Autoajuda",
    emoji: "✨",
    bg: "bg-yellow-50",
  },
  {
    id: "classics",
    keywords: ["classic", "literary fiction", "literature"],
    label: "Clássicos",
    emoji: "📚",
    bg: "bg-stone-50",
  },
  { id: "poetry", keywords: ["poetry", "poems", "verse"], label: "Poesia", emoji: "🪶", bg: "bg-rose-50" },
  {
    id: "philosophy",
    keywords: ["philosophy", "philosophical"],
    label: "Filosofia",
    emoji: "🧠",
    bg: "bg-purple-50",
  },
  {
    id: "biography",
    keywords: ["biography", "autobiography", "memoir"],
    label: "Biografia",
    emoji: "👤",
    bg: "bg-cyan-50",
  },
  {
    id: "young-adult",
    keywords: ["young adult", "teen fiction", "juvenile"],
    label: "Jovem Adulto",
    emoji: "⭐",
    bg: "bg-lime-50",
  },
  {
    id: "comics",
    keywords: ["comics", "graphic novel", "manga"],
    label: "HQ / Mangá",
    emoji: "🎨",
    bg: "bg-indigo-50",
  },
  {
    id: "humor",
    keywords: ["humor", "comedy", "humorous", "satire"],
    label: "Humor",
    emoji: "😄",
    bg: "bg-teal-50",
  },
];

function buildGenreMapping(backendGenres: GenreResponse[]): Map<string, string> {
  const mapping = new Map<string, string>();
  for (const curated of CURATED_GENRES) {
    const match = backendGenres.find((bg) =>
      curated.keywords.some((kw) => bg.original.toLowerCase().includes(kw))
    );
    mapping.set(curated.id, match?.original ?? curated.id);
  }
  return mapping;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.82, y: 14 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreMapping, setGenreMapping] = useState<Map<string, string>>(new Map());
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    if (localStorage.getItem(ONBOARDING_KEY) === "true") {
      router.replace("/for-you");
      return;
    }
    getGenres()
      .then((genres) => setGenreMapping(buildGenreMapping(genres)))
      .catch(() => {
        const fallback = new Map(CURATED_GENRES.map((g) => [g.id, g.id]));
        setGenreMapping(fallback);
      })
      .finally(() => setLoadingGenres(false));
  }, [router]);

  const checkScroll = useCallback(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 40) {
      setShowScrollHint(false);
      return;
    }
    setShowScrollHint(window.scrollY < scrollable - 80);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    if (!loadingGenres) checkScroll();
  }, [loadingGenres, checkScroll]);

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (selectedGenres.length >= 1) {
        const originals = selectedGenres.map((id) => genreMapping.get(id) ?? id);
        await saveUserPreferences(originals);
      }
    } catch {
      // 422 = preferências já salvas anteriormente, fluxo normal
    } finally {
      localStorage.setItem(GENRES_KEY, JSON.stringify(selectedGenres));
      localStorage.setItem(ONBOARDING_KEY, "true");
      router.push("/for-you");
    }
  };

  const canAdvance = selectedGenres.length >= 3;
  const remaining = Math.max(0, 3 - selectedGenres.length);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_55%),radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.18),transparent_35%)] bg-gradient-to-br from-emerald-50 via-white to-teal-50/60">
      <div className="mx-auto max-w-4xl px-5 pb-32 pt-12 sm:px-10">
        {/* Logo */}
        <motion.div
          className="mb-10 flex items-center gap-2"
          initial={{ scale: 0.92, rotate: -2, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            <Image src="/biblioo-carinha-logo.png" alt="Biblioo" width={40} height={40} className="h-10 w-auto" />
          </motion.div>
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Quais gêneros você mais curte?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] sm:text-lg">
          Escolha pelo menos 3 para personalizarmos suas recomendações.
        </p>

        {loadingGenres ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <motion.div
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {CURATED_GENRES.map((genre) => {
              const selected = selectedGenres.includes(genre.id);
              return (
                <motion.button
                  key={genre.id}
                  type="button"
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleGenre(genre.id)}
                  className={`relative flex flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-4 text-center transition-colors duration-150 ${
                    selected
                      ? "border-[var(--brand-500)] bg-[hsl(var(--brand-500)/0.08)] shadow-[0_0_0_4px_hsl(var(--brand-500)/0.10)]"
                      : `border-[var(--border-soft)] ${genre.bg} hover:border-[var(--brand-300)]`
                  }`}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-500)]">
                      <Check size={10} strokeWidth={3.5} className="text-white" />
                    </span>
                  )}
                  <span className="text-4xl leading-none" role="img" aria-hidden="true">
                    {genre.emoji}
                  </span>
                  <span
                    className={`text-sm font-semibold leading-tight ${
                      selected ? "text-[var(--brand-600)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {genre.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            {selectedGenres.length} selecionado{selectedGenres.length !== 1 ? "s" : ""}
            {remaining > 0 && (
              <span className="ml-1 text-[var(--brand-500)]">· selecione mais {remaining}</span>
            )}
          </p>
          <button
            type="button"
            onClick={finish}
            disabled={!canAdvance || loadingGenres || saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-500)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_hsl(var(--brand-500)/0.30)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                Salvando...
                <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <>
                Começar a explorar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={finish}
          disabled={saving}
          className="mt-5 block w-full text-center text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}
