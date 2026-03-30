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
      <main className="flex-1 w-full py-10 px-12">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
