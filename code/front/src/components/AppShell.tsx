import type { ReactNode } from "react";
import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import BiblioChatWidget from "@/components/chat/BiblioChatWidget";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: Readonly<AppShellProps>) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e7f7f0_0%,#f7faf9_45%,#f7f9f8_100%)] ${className ?? ""}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[rgba(62,190,158,0.2)] blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-72 w-72 rounded-full bg-[rgba(126,217,182,0.18)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-80 w-80 rounded-full bg-[rgba(31,61,58,0.12)] blur-3xl" />
      </div>
      <TopHeader />
      <Sidebar />
      <main className="w-full pt-16 lg:pl-64">
        <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            {children}
          </div>
        </div>
      </main>
      <BiblioChatWidget />
    </div>
  );
}

export default AppShell;
