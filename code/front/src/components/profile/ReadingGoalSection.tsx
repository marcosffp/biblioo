import React from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";

interface ReadingGoalSectionProps {
  current: number;
  target: number;
  year?: number;
}

export function ReadingGoalSection({ current, target, year = 2024 }: Readonly<ReadingGoalSectionProps>) {
  const pct = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <SectionHeader title={`Meta de leitura ${year}`} />
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
          <span>Meta de leitura {year}</span>
          <span>
            {current}/{target}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={pct} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Faltam {remaining} livros para completar sua meta.
        </p>
      </div>
    </section>
  );
}

export default ReadingGoalSection;
