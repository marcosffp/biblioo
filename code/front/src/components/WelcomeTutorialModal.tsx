"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TUTORIAL_KEY = "biblioo.tutorial.seen";

// ── SVG Illustrations ──────────────────────────────────────────────────────────

function IllustrationWelcome() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      {/* Background circle */}
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Open book */}
      <rect x="62" y="78" width="52" height="68" rx="6" fill="#0d9488" />
      <rect x="66" y="82" width="44" height="60" rx="4" fill="#f0fdf4" />
      <rect x="126" y="78" width="52" height="68" rx="6" fill="#14b8a6" />
      <rect x="130" y="82" width="44" height="60" rx="4" fill="#f0fdf4" />
      {/* Spine */}
      <rect x="114" y="76" width="12" height="72" rx="3" fill="#0f766e" />
      {/* Lines on left page */}
      <rect x="72" y="94" width="32" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="72" y="102" width="28" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="72" y="110" width="32" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="72" y="118" width="24" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="72" y="126" width="30" height="3" rx="1.5" fill="#d1fae5" />
      {/* Lines on right page */}
      <rect x="136" y="94" width="32" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="136" y="102" width="26" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="136" y="110" width="32" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="136" y="118" width="20" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="136" y="126" width="28" height="3" rx="1.5" fill="#d1fae5" />
      {/* Sparkles */}
      <path d="M58 62l2 6 2-6-6-2 6-2-2-6-2 6 6 2z" fill="#10b981" />
      <path d="M178 58l1.5 4 1.5-4-4-1.5 4-1.5-1.5-4-1.5 4 4 1.5z" fill="#14b8a6" />
      <path d="M174 148l1.5 4 1.5-4-4-1.5 4-1.5-1.5-4-1.5 4 4 1.5z" fill="#0d9488" opacity="0.7" />
      {/* Heart */}
      <path d="M120 68 c0-3-4-6-7-3 l7 9 7-9 c-3-3-7 0-7 3z" fill="#f43f5e" />
    </svg>
  );
}

function IllustrationShelf() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Shelf plank */}
      <rect x="44" y="148" width="152" height="8" rx="4" fill="#0f766e" />
      {/* Book 1 - green tall */}
      <rect x="56" y="90" width="22" height="60" rx="3" fill="#0d9488" />
      <rect x="60" y="96" width="14" height="3" rx="1.5" fill="#ccfbf1" />
      <rect x="60" y="103" width="10" height="3" rx="1.5" fill="#ccfbf1" />
      {/* Book 2 - teal short */}
      <rect x="82" y="108" width="18" height="42" rx="3" fill="#14b8a6" />
      <rect x="86" y="114" width="10" height="3" rx="1.5" fill="#f0fdf4" />
      {/* Book 3 - emerald medium */}
      <rect x="104" y="96" width="20" height="54" rx="3" fill="#10b981" />
      <rect x="108" y="102" width="12" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="108" y="109" width="8" height="3" rx="1.5" fill="#d1fae5" />
      {/* Book 4 - light green tall */}
      <rect x="128" y="88" width="18" height="62" rx="3" fill="#059669" />
      <rect x="132" y="95" width="10" height="3" rx="1.5" fill="#ccfbf1" />
      <rect x="132" y="102" width="8" height="3" rx="1.5" fill="#ccfbf1" />
      {/* Book 5 - teal medium */}
      <rect x="150" y="100" width="22" height="50" rx="3" fill="#0d9488" opacity="0.8" />
      <rect x="154" y="107" width="14" height="3" rx="1.5" fill="#d1fae5" />
      {/* Book 6 - leaning */}
      <rect x="176" y="112" width="14" height="38" rx="3" fill="#14b8a6" opacity="0.7" />
      {/* Status badges */}
      <rect x="56" y="72" width="36" height="14" rx="7" fill="#10b981" />
      <text x="74" y="82" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">LIDO</text>
      <rect x="104" y="76" width="40" height="14" rx="7" fill="#3b82f6" />
      <text x="124" y="86" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">LENDO</text>
      <rect x="150" y="80" width="46" height="14" rx="7" fill="#8b5cf6" />
      <text x="173" y="90" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">QUERO LER</text>
    </svg>
  );
}

function IllustrationFeed() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Card 1 */}
      <rect x="50" y="58" width="140" height="46" rx="10" fill="white" />
      {/* Avatar */}
      <circle cx="68" cy="75" r="9" fill="#0d9488" />
      <circle cx="68" cy="73" r="4" fill="#ccfbf1" />
      <path d="M59 84 c0-5 18-5 18 0" fill="#ccfbf1" />
      {/* Text lines */}
      <rect x="84" y="69" width="60" height="4" rx="2" fill="#d1fae5" />
      <rect x="84" y="77" width="44" height="4" rx="2" fill="#e5e7eb" />
      {/* Book mini cover */}
      <rect x="152" y="62" width="24" height="34" rx="3" fill="#10b981" />
      <rect x="155" y="66" width="18" height="3" rx="1" fill="#d1fae5" />
      <rect x="155" y="72" width="14" height="3" rx="1" fill="#d1fae5" />
      {/* Likes/heart */}
      <path d="M86 90 c0-2-3-4-5-2 l5 6 5-6 c-2-2-5 0-5 2z" fill="#f43f5e" />
      <rect x="94" y="89" width="14" height="4" rx="2" fill="#e5e7eb" />

      {/* Card 2 */}
      <rect x="50" y="112" width="140" height="46" rx="10" fill="white" />
      <circle cx="68" cy="129" r="9" fill="#14b8a6" />
      <circle cx="68" cy="127" r="4" fill="#f0fdf4" />
      <path d="M59 138 c0-5 18-5 18 0" fill="#f0fdf4" />
      <rect x="84" y="123" width="72" height="4" rx="2" fill="#d1fae5" />
      <rect x="84" y="131" width="52" height="4" rx="2" fill="#e5e7eb" />
      {/* Stars */}
      {[0,1,2,3].map(i => (
        <path key={i} d={`M${86 + i * 12} 145 l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z`} fill="#f59e0b" />
      ))}
      <path d="M134 145 l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z" fill="#e5e7eb" />

      {/* Floating notification dot */}
      <circle cx="185" cy="62" r="8" fill="#f43f5e" />
      <text x="185" y="66" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text>
    </svg>
  );
}

function IllustrationCommunity() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Center person */}
      <circle cx="120" cy="88" r="16" fill="#0d9488" />
      <circle cx="120" cy="84" r="7" fill="#ccfbf1" />
      <path d="M104 104 c0-9 32-9 32 0" fill="#ccfbf1" />
      {/* Left person */}
      <circle cx="74" cy="96" r="13" fill="#14b8a6" />
      <circle cx="74" cy="92" r="6" fill="#f0fdf4" />
      <path d="M61 109 c0-8 26-8 26 0" fill="#f0fdf4" />
      {/* Right person */}
      <circle cx="166" cy="96" r="13" fill="#10b981" />
      <circle cx="166" cy="92" r="6" fill="#d1fae5" />
      <path d="M153 109 c0-8 26-8 26 0" fill="#d1fae5" />
      {/* Connection lines */}
      <line x1="87" y1="96" x2="104" y2="90" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="136" y1="90" x2="153" y2="96" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 2" />
      {/* Chat bubbles */}
      <rect x="52" y="118" width="52" height="24" rx="8" fill="white" />
      <path d="M68 142 l-6 6 6-2z" fill="white" />
      <rect x="56" y="124" width="20" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="56" y="131" width="40" height="3" rx="1.5" fill="#e5e7eb" />

      <rect x="136" y="118" width="52" height="24" rx="8" fill="white" />
      <path d="M172" y="142 l6 6-6-2z" fill="white" />
      <path d="M172 142 l6 6-6-2z" fill="white" />
      <rect x="140" y="124" width="30" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="140" y="131" width="20" height="3" rx="1.5" fill="#e5e7eb" />
      {/* Book in center-bottom */}
      <rect x="108" y="118" width="24" height="30" rx="4" fill="#059669" />
      <rect x="112" y="123" width="16" height="3" rx="1.5" fill="#d1fae5" />
      <rect x="112" y="130" width="12" height="3" rx="1.5" fill="#d1fae5" />
    </svg>
  );
}

function IllustrationDna() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Donut chart */}
      <circle cx="120" cy="98" r="46" fill="none" stroke="#e5e7eb" strokeWidth="18" />
      <circle cx="120" cy="98" r="46" fill="none" stroke="#0d9488" strokeWidth="18"
        strokeDasharray="145 144" strokeDashoffset="36" strokeLinecap="round" />
      <circle cx="120" cy="98" r="46" fill="none" stroke="#14b8a6" strokeWidth="18"
        strokeDasharray="72 217" strokeDashoffset="-109" strokeLinecap="round" />
      <circle cx="120" cy="98" r="46" fill="none" stroke="#10b981" strokeWidth="18"
        strokeDasharray="36 253" strokeDashoffset="-181" strokeLinecap="round" />
      {/* Center */}
      <circle cx="120" cy="98" r="28" fill="hsl(158,60%,93%)" />
      <text x="120" y="94" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="800">DNA</text>
      <text x="120" y="107" textAnchor="middle" fill="#0d9488" fontSize="8" fontWeight="600">Literário</text>
      {/* Legend */}
      <circle cx="62" cy="158" r="5" fill="#0d9488" />
      <rect x="70" y="155" width="30" height="6" rx="3" fill="#d1fae5" />
      <circle cx="110" cy="158" r="5" fill="#14b8a6" />
      <rect x="118" y="155" width="24" height="6" rx="3" fill="#d1fae5" />
      <circle cx="152" cy="158" r="5" fill="#10b981" />
      <rect x="160" y="155" width="20" height="6" rx="3" fill="#d1fae5" />
      {/* Stars above */}
      <path d="M60 68 l2 5 5 .7-3.5 3.5.8 5-4.3-2.2-4.3 2.2.8-5-3.5-3.5 5-.7z" fill="#f59e0b" />
      <path d="M178 64 l1.5 3.5 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z" fill="#f59e0b" />
    </svg>
  );
}

function IllustrationGoal() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
      <circle cx="120" cy="100" r="80" fill="hsl(158,60%,93%)" />
      {/* Progress bar background */}
      <rect x="54" y="118" width="132" height="14" rx="7" fill="#d1fae5" />
      {/* Progress bar fill */}
      <rect x="54" y="118" width="99" height="14" rx="7" fill="#0d9488" />
      {/* Label */}
      <text x="120" y="150" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="700">15 de 24 livros</text>
      {/* Trophy */}
      <path d="M98 58 h44 v28 c0 16-12 26-22 30 c-10-4-22-14-22-30z" fill="#f59e0b" />
      <rect x="112" y="116" width="16" height="6" rx="3" fill="#f59e0b" />
      <rect x="104" y="122" width="32" height="6" rx="3" fill="#d97706" />
      {/* Trophy handles */}
      <path d="M98 68 c-12 0-14 18 0 18" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M142 68 c12 0 14 18 0 18" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Star on trophy */}
      <path d="M120 68 l2 5 5 .7-3.5 3.5.8 5-4.3-2.2-4.3 2.2.8-5-3.5-3.5 5-.7z" fill="white" />
      {/* Books floating */}
      <rect x="54" y="70" width="18" height="24" rx="3" fill="#14b8a6" opacity="0.7" />
      <rect x="168" y="66" width="18" height="24" rx="3" fill="#10b981" opacity="0.7" />
      {/* Sparkles */}
      <path d="M58 54 l1 3 1-3-3-1 3-1-1-3-1 3 3 1z" fill="#f59e0b" />
      <path d="M178 54 l1 3 1-3-3-1 3-1-1-3-1 3 3 1z" fill="#f59e0b" />
      <path d="M170 100 l1 2.5 1-2.5-2.5-1 2.5-1-1-2.5-1 2.5 2.5 1z" fill="#f59e0b" opacity="0.8" />
    </svg>
  );
}

// ── Slides config ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    illustration: IllustrationWelcome,
    title: "Bem-vindo ao Biblioo!",
    description: "Sua rede social literária. Organize suas leituras, descubra novos livros e conecte-se com outros leitores apaixonados por histórias.",
  },
  {
    illustration: IllustrationShelf,
    title: "Sua Estante Digital",
    description: "Organize seus livros por status: Lendo, Lido, Quero Ler, Relendo ou Abandonei. Acompanhe seu progresso página por página.",
  },
  {
    illustration: IllustrationFeed,
    title: "Feed de Leituras",
    description: "Veja o que seus amigos estão lendo, avalie livros com até 5 estrelas e compartilhe suas resenhas com a comunidade.",
  },
  {
    illustration: IllustrationCommunity,
    title: "Clubes de Leitura",
    description: "Entre em comunidades temáticas, participe de leituras em grupo e troque recomendações com quem tem o mesmo gosto literário.",
  },
  {
    illustration: IllustrationDna,
    title: "DNA de Leitura",
    description: "Descubra seu perfil literário único. Veja quais gêneros você mais lê e acompanhe sua evolução como leitor ao longo do tempo.",
  },
  {
    illustration: IllustrationGoal,
    title: "Metas & Progresso",
    description: "Defina sua meta anual de leitura e acompanhe seu progresso. Supere seus recordes e celebre cada livro concluído!",
  },
] as const;

// ── Modal component ────────────────────────────────────────────────────────────

interface WelcomeTutorialModalProps {
  onClose: () => void;
}

function WelcomeTutorialModal({ onClose }: Readonly<WelcomeTutorialModalProps>) {
  const [step, setStep] = useState(0);
  const total = SLIDES.length;
  const isLast = step === total - 1;
  const slide = SLIDES[step];
  const Illustration = slide.illustration;

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    onClose();
  };

  const handleNext = () => {
    if (isLast) { handleClose(); return; }
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="relative w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-500)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">biblioo</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
            aria-label="Fechar tutorial"
          >
            <X size={15} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-center gap-2 px-6">
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Ir para slide ${i + 1}`}
              animate={{ width: i === step ? 24 : 7, opacity: i === step ? 1 : 0.28 }}
              transition={{ duration: 0.25 }}
              className="h-[7px] rounded-full bg-[var(--brand-500)]"
            />
          ))}
        </div>

        {/* Illustration */}
        <div className="mt-5 flex justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex h-[220px] w-full items-center justify-center"
            >
              <Illustration />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-4 px-7 text-center"
          >
            <h2 className="text-[22px] font-bold leading-tight text-[var(--text-primary)]">{slide.title}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">{slide.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="mt-5 flex items-center gap-3 px-5 pb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-soft)] text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            >
              Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-soft)] text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            >
              Pular
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-500)] text-sm font-semibold text-white shadow-[0_8px_20px_hsl(var(--brand-500)/0.30)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-600)]"
          >
            {isLast ? "Começar agora" : "Próximo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useWelcomeTutorial() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(TUTORIAL_KEY)) {
      setShow(true);
    }
  }, []);

  return {
    show,
    open: () => setShow(true),
    close: () => setShow(false),
  };
}

export { WelcomeTutorialModal };
