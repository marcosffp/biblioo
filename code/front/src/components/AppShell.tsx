import type { ReactNode } from "react";
import React from "react";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex ${className ?? ""}`.trim()}>
      <Sidebar />
      <main className="flex-1 flex flex-col gap-6 py-8 px-10">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
