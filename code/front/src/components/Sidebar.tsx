"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Home, Sparkles, Users, User } from "lucide-react";
import React from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  items?: SidebarItem[];
}

const defaultItems: SidebarItem[] = [
  { label: "Inicio", href: "/", icon: <Home size={18} /> },
  { label: "Estante", href: "/estante", icon: <Book size={18} /> },
  { label: "Para Voce", href: "/para-voce", icon: <Sparkles size={18} /> },
  { label: "Clubes", href: "/comunidades", icon: <Users size={18} /> },
  { label: "Perfil", href: "/perfil", icon: <User size={18} /> },
];

export function Sidebar({ items = defaultItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 p-4">
      <nav aria-label="Navegacao lateral" className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 text-sm font-semibold p-3 rounded-lg transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
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
