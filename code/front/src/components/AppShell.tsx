import type { ReactNode } from "react";
import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${className ?? ""}`.trim()}>
      <TopHeader />
      <Sidebar />
      <main className="w-full pt-16 pl-64">
        <div className="py-10 px-12">
          <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
