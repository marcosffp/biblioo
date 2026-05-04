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
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e7f7f0_0%,#f6fbf9_55%,#f3f7f6_100%)] px-5 py-10 text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[rgba(63,195,167,0.22)] blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-72 w-72 rounded-full bg-[rgba(126,217,182,0.18)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-72 w-72 rounded-full bg-[rgba(15,47,44,0.12)] blur-3xl" />
      </div>
      <section className="mx-auto w-full max-w-[680px] pt-6 sm:pt-10">
        <div className="rounded-[24px] border border-[var(--border-soft)] bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,47,44,0.15)] backdrop-blur-xl sm:p-10">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mx-auto flex items-center justify-center gap-2">
              <img className="h-10 w-17" src="biblioo-logo.png" alt="Biblioo" />
            </div>
            <h1 className="mt-6 text-center font-[var(--font-heading)] text-[2.1rem] font-semibold leading-tight text-[var(--text-primary)] sm:text-[2.35rem]">
              {title}
            </h1>
            <p className="mt-2 text-center text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.1rem]">
              {subtitle}
            </p>

            {children}

            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthCard;
