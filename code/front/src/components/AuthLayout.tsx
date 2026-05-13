"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <main className="min-h-screen text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[55fr_45fr]">

        {/* ── Left: desktop branded panel ── */}
        <section
          className="relative hidden overflow-hidden lg:flex lg:flex-col"
          style={{ backgroundColor: "#1a8162" }}
        >
          {/* Ruled-line texture — evokes book pages */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.09 }}
          >
            <defs>
              <pattern
                id="auth-lines"
                x="0"
                y="0"
                width="4000"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="27.5"
                  x2="4000"
                  y2="27.5"
                  stroke="white"
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-lines)" />
          </svg>

          {/* Warm radial glow — top right */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px]"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(63,195,167,0.10) 0%, transparent 68%)",
            }}
          />

          {/* BookOpen watermark — bottom right */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-10 right-5"
            style={{ opacity: 0.06 }}
          >
            <img
              src="biblioo-carinha-branca-logo.png"
              alt=""
              className="w-[220px] h-auto"
            />
          </div>

          {/* Content: wordmark → copy → meta */}
          <div className="relative flex h-full flex-col justify-between px-14 py-14">

            {/* Wordmark */}
            <span className="font-display text-sm font-semibold text-white">
              <img
                src="./biblioo-logo-branca.png"
                alt="Biblioo"
                className="h-9 w-auto"
              />
            </span>

            {/* Core copy */}
            <div>
              <p
                className="animate-fade-up [animation-fill-mode:both] text-[11px] font-semibold uppercase tracking-[0.26em]"
                style={{ color: "var(--brand-500)", animationDelay: "0ms" }}
              >
                Para quem vive histórias
              </p>

              <h1
                className="animate-fade-up [animation-fill-mode:both] mt-8 max-w-sm font-display text-[3.5rem] font-semibold leading-[1.05] text-white"
                style={{ animationDelay: "80ms" }}
              >
                Tudo o que você lê
                <br />
                merece ser
                <br />
                compartilhado.
              </h1>

              <div
                className="animate-fade-up [animation-fill-mode:both] mt-6 flex items-center gap-2"
                style={{ animationDelay: "160ms" }}
              >
                <span className="h-[3px] w-16 rounded-full bg-[var(--brand-600)]" />
                <span className="h-[3px] w-12 rounded-full bg-[var(--brand-500)]" />
                <span
                  className="h-[3px] w-10 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                />
              </div>

              <p
                className="animate-fade-up [animation-fill-mode:both] mt-5 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)", animationDelay: "240ms" }}
              >
                Organize, descubra e compartilhe histórias.
              </p>
            </div>

            {/* Genre labels + feature pills */}
            <div className="animate-fade-up [animation-fill-mode:both]" style={{ animationDelay: "320ms" }}>
              <p
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Romance · Fantasia · Mistério · Ficção · Clássicos
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Estantes", "Sugestões", "Perfil leitor", "Comunidades"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full px-4 py-1.5 text-xs font-medium"
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Left: mobile compact header ── */}
        <header
          className="flex flex-col justify-end px-6 pb-8 pt-10 lg:hidden"
          style={{ backgroundColor: "#1a8162", minHeight: "180px" }}
        >
          <span className="font-display text-sm font-semibold text-white">
            <img
              src="biblioo-logo-branca.png"
              alt="Biblioo"
              className="h-6 w-auto"
            />
          </span>
          <p className="mt-2 font-display text-2xl font-semibold leading-tight text-white">
            Sua próxima leitura
            <br />
            te encontra aqui.
          </p>
        </header>

        {/* ── Right: form slot ── */}
        <section className="flex flex-col justify-center bg-white px-6 py-10 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-[400px]">
            {children}
          </div>
        </section>

      </div>
    </main>
  );
}
