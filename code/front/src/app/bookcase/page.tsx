"use client";

import React, { useState } from "react";
import { AppShell, BookCard, ChipToggle, PageHeader, SectionHeader } from "@/components";

const books = [
  { id: "b1", title: "A Menina que Roubava Livros", author: "Markus Zusak", rating: 4, progress: 65 },
  { id: "b2", title: "1984", author: "George Orwell", rating: 5, progress: 40 },
];

const collections = [
  { id: "c1", title: "Distopias favoritas", author: "8 livros" },
  { id: "c2", title: "Classicos brasileiros", author: "5 livros" },
];

export default function EstantePage() {
  const [view, setView] = useState<"livros" | "colecoes">("livros");

  return (
    <AppShell>
      <PageHeader title="Estante" subtitle="Organize suas leituras" />

      <div className="flex gap-2">
        <ChipToggle label="Livros" active={view === "livros"} onClick={() => setView("livros")} />
        <ChipToggle label="Colecoes" active={view === "colecoes"} onClick={() => setView("colecoes")} />
      </div>

      <SectionHeader title={view === "livros" ? "Seus livros" : "Suas colecoes"} />
      <div className="space-y-4">
        {view === "livros"
          ? books.map((book) => (
              <BookCard
                key={book.id}
                title={book.title}
                author={book.author}
                rating={book.rating}
                progress={book.progress}
              />
            ))
          : collections.map((collection) => (
              <BookCard
                key={collection.id}
                title={collection.title}
                author={collection.author}
                variant="compact"
              />
            ))}
      </div>
    </AppShell>
  );
}
