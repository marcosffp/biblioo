"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { CommunityChatPanel } from "./CommunityChatPanel";
import { CommunityInfoPanel } from "./CommunityInfoPanel";
import type { Community, CommunityChatMessage, CommunityMember } from "./types";

export interface CommunityChatViewProps {
  community: Community;
  onBack: () => void;
}

const mockMembers: CommunityMember[] = [
  { id: "u1", name: "Ana Clara", username: "anaclara", isPro: true, isAdmin: true },
  { id: "u2", name: "Pedro Henrique", username: "pedroh" },
  { id: "u3", name: "Mariana Costa", username: "maricosta", isPro: true },
  { id: "u4", name: "Lucas Silva", username: "lucass" },
  { id: "u5", name: "Julia Santos", username: "julias", isPro: true },
];

const mockMessages: CommunityChatMessage[] = [
  {
    id: "m1",
    userId: "me",
    userName: "Voce",
    text: "Gente, alguem ja passou do capitulo 5? Preciso discutir aquela cena!",
    time: "10:30",
    isMine: true,
  },
  {
    id: "m2",
    userId: "u2",
    userName: "Pedro Henrique",
    text: "Sim! Achei muito intenso. O autor tem um jeito unico de construir tensao.",
    time: "10:32",
  },
  {
    id: "m3",
    userId: "u3",
    userName: "Mariana Costa",
    text: "Estou na pagina 80 ainda, sem spoilers por favor.",
    time: "10:35",
  },
  {
    id: "m4",
    userId: "u4",
    userName: "Lucas Silva",
    text: "Spoiler - toque para revelar",
    time: "10:40",
    isSpoiler: true,
  },
  {
    id: "m5",
    userId: "me",
    userName: "Voce",
    text: "Mariana, corre que o capitulo 6 e ainda melhor!",
    time: "10:42",
    isMine: true,
  },
  {
    id: "m6",
    userId: "system",
    userName: "Sistema",
    text: "Julia Santos entrou no grupo",
    time: "11:00",
    isSystem: true,
  },
  {
    id: "m7",
    userId: "u2",
    userName: "Pedro Henrique",
    text: "Bem-vinda Julia! Voce vai amar esse livro.",
    time: "11:05",
  },
  {
    id: "m8",
    userId: "u3",
    userName: "Mariana Costa",
    text: "O ritmo da escrita e hipnotizante, nao consigo parar de ler",
    time: "11:15",
  },
  {
    id: "m9",
    userId: "me",
    userName: "Voce",
    text: "Vamos combinar de discutir o capitulo 8 na sexta?",
    time: "11:20",
    isMine: true,
  },
];

export function CommunityChatView({ community, onBack }: Readonly<CommunityChatViewProps>) {
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <TopHeader />
      <Sidebar />
      <main className="w-full pl-64 pt-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex h-[calc(100vh-4rem)] border-x border-border bg-card">
            <div className="min-w-0 flex-1">
              <CommunityChatPanel
                community={community}
                messagesSeed={mockMessages}
                onBack={onBack}
                onOpenInfo={() => setIsInfoOpen((current) => !current)}
              />
            </div>

            {isInfoOpen ? (
              <CommunityInfoPanel
                community={community}
                members={mockMembers}
                onClose={() => setIsInfoOpen(false)}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommunityChatView;
