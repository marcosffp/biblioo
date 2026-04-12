import React from "react";
import { StatHighlight } from "@/components";

type ProfileStatItem = {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
};

type ProfileStatsGridProps = {
  items: ProfileStatItem[];
};

export function ProfileStatsGrid({ items }: ProfileStatsGridProps) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <StatHighlight key={item.label} label={item.label} value={item.value} icon={item.icon} />
      ))}
    </section>
  );
}
