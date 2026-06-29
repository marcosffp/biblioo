"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Compass, Rss, User, Users, X } from "lucide-react";
import React from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultItems: SidebarItem[] = [
  { label: "Feed", href: "/feed", icon: <Rss size={18} /> },
  { label: "Biblioteca", href: "/bookcase", icon: <Book size={18} /> },
  { label: "Comunidades", href: "/community", icon: <Users size={18} /> },
  { label: "Explorar", href: "/for-you", icon: <Compass size={18} /> },
  { label: "Perfil", href: "/profile", icon: <User size={18} /> },
];

export function Sidebar({ items = defaultItems, className, isOpen = false, onClose }: Readonly<SidebarProps>) {
  const pathname = usePathname();

  return (
    <aside
      className={
        `fixed left-0 top-16 z-40 block h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-[#e2ebe7] bg-white/80 p-5 shadow-[0_10px_30px_rgba(31,61,58,0.08)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${className ?? ""}`.trim()
      }
    >
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="mb-3 self-end flex items-center justify-center rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[rgba(31,61,58,0.06)] transition-colors lg:hidden"
        >
          <X size={18} />
        </button>
      )}
      <nav aria-label="Navegacao lateral" className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition duration-200 ease-out ${
                isActive
                  ? "bg-[rgba(26,129,98,0.10)] text-[#1a8162]"
                  : "text-[var(--text-secondary)] hover:bg-[rgba(31,61,58,0.04)] hover:text-[var(--text-primary)]"
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