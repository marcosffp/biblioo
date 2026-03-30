import React from "react";
import {
  AppShell,
  GenreDistributionCard,
  GoalProgressCard,
  ImportActionCard,
  PageHeader,
  SectionHeader,
  StatHighlight,
  TagList,
  UserBadge,
} from "@/components";

const genreItems = [
  { label: "Fantasia", value: 40 },
  { label: "Drama", value: 25 },
  { label: "Nao-ficcao", value: 20 },
  { label: "Romance", value: 15 },
];

export default function PerfilPage() {
  return (
    <AppShell>
      <PageHeader title="Perfil" subtitle="Seu resumo de leitura" />

      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <UserBadge name="Beatriz Carvalho" subtitle="@beatriz" />
      </div>

      <SectionHeader title="Metricas" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatHighlight label="Livros lidos" value={32} />
        <StatHighlight label="Meta anual" value="52" />
        <StatHighlight label="Dias ativos" value={140} />
      </div>

      <SectionHeader title="Meta de leitura" />
      <GoalProgressCard current={18} target={52} />

      <SectionHeader title="DNA literario" />
      <GenreDistributionCard items={genreItems} />

      <SectionHeader title="Preferencias" />
      <TagList tags={["Ficcao", "Classicos", "Distopia", "Suspense"]} />

      <SectionHeader title="Importar historico" />
      <ImportActionCard
        title="Importe seus livros"
        description="Conecte sua conta para trazer leituras anteriores."
        actionLabel="Importar"
      />
    </AppShell>
  );
}
