"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Rss, Sparkles, Users, User } from "lucide-react";
import React from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
}

const defaultItems: SidebarItem[] = [
  { label: "Feed", href: "/feed", icon: <Rss size={18} /> },
  { label: "Estante", href: "/bookcase", icon: <Book size={18} /> },
  { label: "Para Voce", href: "/for-you", icon: <Sparkles size={18} /> },
  { label: "Comunidades", href: "/community", icon: <Users size={18} /> },
  { label: "Perfil", href: "/profile", icon: <User size={18} /> },
];

export function Sidebar({ items = defaultItems, className }: Readonly<SidebarProps>) {
  const pathname = usePathname();

  return (
    <aside
      className={
        `w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 p-5 overflow-y-auto z-40 ${className ?? ""}`.trim()
      }
    >
      <nav aria-label="Navegacao lateral" className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 text-sm font-semibold p-3 rounded-lg transition-colors ${
                isActive ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="inline-flex">{item.icon}</span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
