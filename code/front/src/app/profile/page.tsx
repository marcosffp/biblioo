"use client";

import React from "react";
import {
  AppShell,
  BookCard,
  Button,
  ChipToggle,
  EmptyState,
  IconButton,
  ImportActionCard,
  ProgressBar,
  SectionHeader,
  StatHighlight,
  TagList,
} from "@/components";

const isOwner = true;
const isPublic = true;

const genreItems = [
  { label: "Romance", value: 35 },
  { label: "Ficcao Literaria", value: 28 },
  { label: "Fantasia", value: 22 },
  { label: "Nao-Ficcao", value: 15 },
];

const favoriteAuthors = ["Clarice Lispector", "Machado de Assis", "Gabriel Garcia Marquez"];

const profileStats = {
  booksRead: 47,
  pagesRead: 14200,
  status: "Leitor Assiduo",
  favoriteGenre: "Ficcao BR",
  following: 95,
  followers: 128,
  goalCurrent: 12,
  goalTarget: 24,
};

const shelfBooks = [
  { title: "A Cidade e as Serras", author: "Eca de Queiros", rating: 4.5 },
  { title: "Torto Arado", author: "Itamar Vieira Junior", rating: 5 },
  { title: "O Avesso da Pele", author: "Jefferson Tenorio", rating: 4.8 },
  { title: "Memorias Postumas", author: "Machado de Assis", rating: 4.6 },
  { title: "Olhos d'Agua", author: "Conceicao Evaristo", rating: 4.9 },
  { title: "A Hora da Estrela", author: "Clarice Lispector", rating: 4.7 },
  { title: "Capitaes da Areia", author: "Jorge Amado", rating: 4.4 },
  { title: "Quarto de Despejo", author: "Carolina Maria de Jesus", rating: 4.9 },
];

const tabs = ["Estante", "Comunidades", "Resenhas"] as const;

export default function PerfilPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>("Estante");
  const goalPct = profileStats.goalTarget > 0 ? (profileStats.goalCurrent / profileStats.goalTarget) * 100 : 0;

  return (
    <AppShell>
      <section className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div className="relative h-36 md:h-44 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white">
          <div className="absolute -bottom-8 left-6 md:left-10">
            <div className="h-20 w-20 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center shadow-lg">
              Foto
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 pt-12 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">Usuario</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1">
                  {isPublic ? "Perfil Publico" : "Perfil Privado"}
                </span>
              </div>
              <p className="text-sm text-gray-400">@usuario</p>
              <p className="mt-3 max-w-xl text-sm text-gray-600">
                Leitor apaixonado por literatura brasileira. Sempre em busca de novos mundos entre paginas.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-emerald-900">
                <span>
                  <strong>{profileStats.followers}</strong> seguidores
                </span>
                <span>
                  <strong>{profileStats.following}</strong> seguindo
                </span>
                <span>
                  <strong>{profileStats.booksRead}</strong> livros lidos
                </span>
              </div>
            </div>
            <div className="w-full md:w-auto md:ml-auto">
              <button
                type="button"
                className="mt-0 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm font-semibold text-black shadow-sm hover:border-emerald-500 hover:bg-emerald-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                {isOwner ? "Editar perfil" : "Seguir"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StatHighlight label="Livros lidos" value={profileStats.booksRead} />
            <StatHighlight label="Paginas lidas" value={profileStats.pagesRead.toLocaleString("pt-BR")} />
            <StatHighlight label="Status" value={profileStats.status} />
            <StatHighlight label="Genero favorito" value={profileStats.favoriteGenre} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <SectionHeader title="Meta de leitura 2024" />
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
            <span>Meta de leitura 2024</span>
            <span>
              {profileStats.goalCurrent}/{profileStats.goalTarget}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={goalPct} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Faltam {Math.max(0, profileStats.goalTarget - profileStats.goalCurrent)} livros para completar sua meta.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <SectionHeader title="DNA Literario" subtitle="Seu perfil de leitura" />
        <div className="mt-4">
          <div className="space-y-3">
            {genreItems.map((item) => {
              const total = genreItems.reduce((acc, current) => acc + current.value, 0) || 1;
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
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="text-xs font-semibold text-gray-500">Autores favoritos</div>
            <TagList className="mt-2" tags={favoriteAuthors} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <SectionHeader title="Importar do Goodreads" subtitle="Importe sua biblioteca via CSV" />
        <div className="mt-4">
          <ImportActionCard
            title="Importar do Goodreads"
            description="Importe sua biblioteca via CSV. Integracao pronta para backend."
            actionLabel="Importar"
            onAction={() => {}}
            className="border-0 bg-emerald-50"
          />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <ChipToggle key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>
      </section>

      {activeTab === "Estante" ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shelfBooks.map((book) => (
            <BookCard key={book.title} title={book.title} author={book.author} rating={book.rating} variant="compact" />
          ))}
        </section>
      ) : activeTab === "Comunidades" ? (
        <EmptyState
          title="Nenhuma comunidade ainda"
          description="Encontre clubes e conversas para compartilhar suas leituras."
          action={<Button>Explorar comunidades</Button>}
        />
      ) : (
        <EmptyState
          title="Sem resenhas publicadas"
          description="Escreva uma resenha para registrar suas leituras favoritas."
          action={<Button>Escrever resenha</Button>}
        />
      )}
    </AppShell>
  );
}
