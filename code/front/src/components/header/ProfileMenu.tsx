"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropdownClose } from "@/hooks/useDropdownClose";
import { clearAuthSession } from "@/services/auth";

type ProfileMenuProps = {
  resolvedInitial: string;
  avatarUrl: string | null;
  onLogout?: () => void;
};

export function ProfileMenu({ resolvedInitial, avatarUrl, onLogout }: Readonly<ProfileMenuProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const close = React.useCallback(() => setIsOpen(false), []);
  useDropdownClose(containerRef, isOpen, close);

  const handleLogout = React.useCallback(() => {
    clearAuthSession();
    setIsOpen(false);
    onLogout?.();
    router.push("/login");
  }, [router, onLogout]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="h-10 w-10 rounded-full bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors overflow-hidden flex items-center justify-center ring-2 ring-white/20"
        aria-label="Abrir menu do perfil"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Foto do perfil" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          <span>{resolvedInitial}</span>
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Menu do perfil"
          className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-44 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-[var(--deep-green)] hover:bg-emerald-50"
          >
            Meu perfil
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-[var(--deep-green)] hover:bg-emerald-50"
          >
            Configurações
          </Link>
        </div>
      ) : null}
    </div>
  );
}
