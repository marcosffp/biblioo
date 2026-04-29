import type { ReactNode } from "react";
import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: Readonly<AppShellProps>) {
  return (
    <div className={`min-h-screen bg-[#f7f9f8] ${className ?? ""}`.trim()}>
      <TopHeader />
      <Sidebar />
      <main className="w-full pt-16 lg:pl-64">
        <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
