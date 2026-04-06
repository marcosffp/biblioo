"use client";

import React from "react";
import { BookOpen } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  showDivider?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, showDivider = false, children, footer }: Readonly<AuthCardProps>) {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] px-5 py-10 text-[var(--text-primary)]">
      <section className="mx-auto w-full max-w-[620px] pt-8 sm:pt-10">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-500)]/70 via-[var(--border-soft)] to-[var(--brand-100)] p-[2px] shadow-[0_10px_24px_rgba(18,32,22,0.08)]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[var(--bg-canvas)] px-5 py-8 sm:px-8 sm:py-9">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="mx-auto flex items-center justify-center gap-2 text-[var(--brand-500)]">
                <BookOpen className="h-7 w-7" strokeWidth={2.2} />
                <span className="font-[var(--font-heading)] text-[1.85rem] font-semibold leading-none text-[#24414a]">Biblioo</span>
              </div>

              <h1 className="mt-6 text-center font-[var(--font-heading)] text-[2.2rem] font-bold leading-tight text-[#24414a] sm:text-[2.4rem]">
                {title}
              </h1>
              <p className="mt-2 text-center text-[1.2rem] leading-tight text-[var(--text-secondary)] sm:text-[1.3rem]">{subtitle}</p>

              {showDivider ? (
                <div className="mt-6 flex items-center justify-center gap-3 text-[var(--brand-100)]" aria-hidden>
                  <span className="h-px w-12 bg-current" />
                  <span className="text-sm">◌</span>
                  <span className="h-px w-12 bg-current" />
                </div>
              ) : null}

              {children}

              {footer}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthCard;
