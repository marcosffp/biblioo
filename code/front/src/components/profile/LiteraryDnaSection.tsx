import React from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { TagList } from "@/components/TagList";
import type { GenreDistribution } from "@/types/profile";

interface LiteraryDnaSectionProps {
  authorItems: GenreDistribution[];
  favoriteAuthors: string[];
  subtitle?: string;
  emptyMessage?: string;
}

export function LiteraryDnaSection({
  authorItems,
  favoriteAuthors,
  subtitle = "Seu perfil de leitura",
  emptyMessage = "Ainda não há dados suficientes para montar seu DNA literário.",
}: Readonly<LiteraryDnaSectionProps>) {
  const total = authorItems.reduce((acc, item) => acc + item.value, 0) || 1;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <SectionHeader title="DNA literário" subtitle={subtitle} />
      <div className="mt-4">
        {authorItems.length > 0 ? (
          <div className="space-y-3">
            {authorItems.map((item) => {
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.label}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-emerald-100">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        )}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="text-xs font-semibold text-gray-500">Autores favoritos</div>
          {favoriteAuthors.length > 0 ? (
            <TagList className="mt-2" tags={favoriteAuthors} />
          ) : (
            <p className="mt-2 text-sm text-gray-500">Sem autores suficientes para análise.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default LiteraryDnaSection;
