"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Link2, Check, Loader2, AlertCircle } from "lucide-react";
import { getAccessToken } from "@/services/auth";
import { generateShareCard } from "@/services/profile";

export type ShareCapsuleModalProps = {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userHandle?: string;
  avatarUrl?: string | null;
  booksRead?: number;
  pagesRead?: number;
  favoriteAuthors?: string[];
};

export function ShareCapsuleModal({
  open,
  onClose,
  userHandle = "@usuario",
  booksRead = 0,
}: ShareCapsuleModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setImageUrl(null);
      setImageBlob(null);
      setImageError(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const fetchCard = async () => {
      setIsLoadingImage(true);
      setImageError(false);
      setImageUrl(null);
      setImageBlob(null);

      try {
        const token = getAccessToken();
        const blob = await generateShareCard("dna", token);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setImageBlob(blob);
        setImageUrl(objectUrl);
      } catch {
        if (!cancelled) setImageError(true);
      } finally {
        if (!cancelled) setIsLoadingImage(false);
      }
    };

    void fetchCard();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "biblioo-capsula-literaria.png";
    a.click();
  };

  const handleShare = async () => {
    const text = `Minha Cápsula Literária no Biblioo 📚 — ${booksRead} livros lidos ${userHandle}`;
    try {
      if (navigator.share && imageBlob) {
        const file = new File([imageBlob], "biblioo-capsula-literaria.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: "Cápsula Literária – Biblioo", text, files: [file] });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: "Cápsula Literária – Biblioo", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // user cancelled or not supported
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            {/* Image area */}
            <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-[hsl(174_33%_12%)] shadow-2xl">
              {isLoadingImage && (
                <div className="flex flex-col items-center gap-3 p-10 text-white/60">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <span className="text-sm">Gerando sua cápsula literária…</span>
                </div>
              )}

              {imageError && !isLoadingImage && (
                <div className="flex flex-col items-center gap-3 p-10 text-white/60">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <span className="text-center text-sm">
                    Não foi possível gerar a imagem.
                    <br />
                    Tente novamente mais tarde.
                  </span>
                </div>
              )}

              {imageUrl && !isLoadingImage && (
                <Image
                  src={imageUrl}
                  alt="Cápsula literária"
                  width={600}
                  height={900}
                  className="w-full rounded-3xl"
                  draggable={false}
                  unoptimized
                />
              )}
            </div>

            {/* Action bar */}
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3">
              <button
                type="button"
                onClick={() => void handleShare()}
                disabled={isLoadingImage}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-dark text-sm font-semibold text-white shadow-[0_8px_20px_rgba(19,147,122,0.22)] transition-all hover:-translate-y-px hover:bg-primary hover:shadow-[0_12px_24px_rgba(19,147,122,0.30)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copiado!" : "Compartilhar"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!imageUrl || isLoadingImage}
                title="Baixar imagem"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4 text-gray-600" />
              </button>

              <button
                type="button"
                onClick={() => void handleCopyLink()}
                title="Copiar link do perfil"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200"
              >
                <Link2 className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
