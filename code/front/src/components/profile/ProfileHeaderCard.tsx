import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Lock } from "lucide-react";

type ProfileHeaderCardProps = {
  name: string;
  handle: string;
  bio: string;
  initial: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isPrivate?: boolean;
  followersCount: number;
  followingCount: number;
  followersHref?: string;
  followingHref?: string;
  action?: React.ReactNode;
  extraInfo?: React.ReactNode;
  footerContent?: React.ReactNode;
};

function MetricItem({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href} className="hover:text-emerald-700">
        <strong>{value}</strong> {label}
      </Link>
    );
  }

  return (
    <span>
      <strong>{value}</strong> {label}
    </span>
  );
}

export function ProfileHeaderCard({
  name,
  handle,
  bio,
  initial,
  avatarUrl,
  bannerUrl,
  isPrivate,
  followersCount,
  followingCount,
  followersHref,
  followingHref,
  action,
  extraInfo,
  footerContent,
}: ProfileHeaderCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div
        className="relative h-36 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white md:h-44"
        style={
          bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="absolute -bottom-8 left-6 md:left-10">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-lg font-bold text-white shadow-lg">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={`Foto de ${name}`} width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-12 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
              {isPrivate ? (
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                  title="Perfil privado"
                  aria-label="Perfil privado"
                >
                  <Lock size={14} />
                </span>
              ) : null}
            </div>
            <p className="text-md text-gray-400">{handle}</p>
            <p className="mt-3 max-w-xl text-sm text-gray-600">{bio}</p>
            {extraInfo ? <div className="mt-2 text-sm text-gray-500">{extraInfo}</div> : null}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-emerald-900">
              <MetricItem value={followersCount} label="seguidores" href={followersHref} />
              <MetricItem value={followingCount} label="seguindo" href={followingHref} />
              {footerContent}
            </div>
          </div>
          {action ? <div className="w-full md:ml-auto md:w-auto">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
