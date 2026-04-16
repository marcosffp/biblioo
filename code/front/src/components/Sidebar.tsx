"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
  import { Book, CirclePlus, Compass, Rss, User, Users } from "lucide-react";
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
  { label: "Comunidades", href: "/community", icon: <Users size={18} /> },
  { label: "Explorar", href: "/for-you", icon: <Compass size={18} /> },
  { label: "Perfil", href: "/profile", icon: <User size={18} /> },
];

export function Sidebar({ items = defaultItems, className }: Readonly<SidebarProps>) {
  const pathname = usePathname();

  return (
    <aside
      className={
        `w-64 fixed left-0 top-0 h-screen border-r border-[#d5ddda] bg-[#edf3f1] p-5 overflow-y-auto z-[60] ${className ?? ""}`.trim()
      }
    >
      <div className="mb-6">
        <img className="h-9 w-auto" src="biblioo-logo.png" alt="Biblioo" />
      </div>
      <nav aria-label="Navegacao lateral" className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${
                isActive ? "bg-[#dfecea] text-[#2f8a74]" : "text-[#556072] hover:bg-[#e6efed]"
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
