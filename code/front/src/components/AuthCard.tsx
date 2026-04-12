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
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-card-hover sm:p-8">
            <div className="mx-auto w-full max-w-[390px]">
            <div className="mx-auto flex items-center gap-2 justify-center min-w-fit">
              <img className="h-10 w-17" src="biblioo-logo.png" alt="Biblioo" />
            </div>
              <h1 className="mt-6 text-center font-[var(--font-heading)] text-[2.2rem] font-bold leading-tight text-[var(--text-primary)] sm:text-[2.4rem]">
                {title}
              </h1>
              <p className="mt-2 text-center text-[1.2rem] leading-tight text-[var(--text-secondary)] sm:text-[1.2rem]">{subtitle}</p>

              {children}

              {footer}
            </div>
        </div>
      </section>
    </main>
  );
}

export default AuthCard;
