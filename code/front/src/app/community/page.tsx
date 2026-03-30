"use client";

import React, { useState } from "react";
import { AppShell, CommunityCard, PageHeader, SectionHeader, SecondaryButton, ChipToggle } from "@/components";

const communities = [
  { id: "c1", name: "Clube dos Classicos", description: "Leituras mensais e debates.", members: 124 },
  { id: "c2", name: "Fantasia Urbana", description: "Magia e grandes sagas.", members: 89 },
];

export default function ComunidadesPage() {
  const [tab, setTab] = useState<"todas" | "minhas">("todas");

  return (
    <AppShell>
      <PageHeader
        title="Comunidades"
        subtitle="Encontre clubes de leitura"
        action={<SecondaryButton>Criar clube</SecondaryButton>}
      />

      <div className="flex gap-2">
        <ChipToggle label="Todas" active={tab === "todas"} onClick={() => setTab("todas")} />
        <ChipToggle label="Minhas" active={tab === "minhas"} onClick={() => setTab("minhas")} />
      </div>

      <SectionHeader title={tab === "todas" ? "Todas as comunidades" : "Minhas comunidades"} />
      <div className="grid gap-4 md:grid-cols-2">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            name={community.name}
            description={community.description}
            members={community.members}
          />
        ))}
      </div>
    </AppShell>
  );
}
