import React from "react";
import { AppShell, BookCard, PageHeader, PrimaryButton, SectionHeader } from "@/components";

const highlights = [
  { id: "h1", title: "O Nome do Vento", author: "Patrick Rothfuss", rating: 5, progress: 10 },
];

const continueReading = [
  { id: "r1", title: "Pequeno Principe", author: "Antoine de Saint-Exupery", rating: 4, progress: 70 },
  { id: "r2", title: "Sapiens", author: "Yuval Harari", rating: 5, progress: 35 },
];

const discoveries = [
  { id: "d1", title: "Oceano no Fim do Caminho", author: "Neil Gaiman", rating: 4 },
  { id: "d2", title: "A Cor Purpura", author: "Alice Walker", rating: 5 },
];

export default function ParaVocePage() {
  return (
    <AppShell>
      <PageHeader title="Para Voce" subtitle="Sugestoes baseadas no seu historico" />

      <SectionHeader title="Recomendacao do dia" action={<PrimaryButton>Sortear recomendacao</PrimaryButton>} />
      <div className="space-y-4">
        {highlights.map((book) => (
          <BookCard key={book.id} title={book.title} author={book.author} rating={book.rating} progress={book.progress} />
        ))}
      </div>

      <SectionHeader title="Continuar lendo" />
      <div className="space-y-4">
        {continueReading.map((book) => (
          <BookCard key={book.id} title={book.title} author={book.author} rating={book.rating} progress={book.progress} />
        ))}
      </div>

      <SectionHeader title="Novas descobertas" />
      <div className="space-y-4">
        {discoveries.map((book) => (
          <BookCard key={book.id} title={book.title} author={book.author} rating={book.rating} />
        ))}
      </div>
    </AppShell>
  );
}
