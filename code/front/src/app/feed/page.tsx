"use client";

import React from "react";
import { AppShell, EmptyState, PageHeader, PostCard, SectionHeader } from "@/components";

const posts = [
  {
    id: "p1",
    author: "Fernanda Lima",
    authorHandle: "@fernandal",
    time: "2h",
    content: "Terminei hoje O Conto da Aia. Impactante e necessario.",
    likes: 24,
    comments: 6,
  },
  {
    id: "p2",
    author: "Lucas Oliveira",
    authorHandle: "@lucasbook",
    time: "5h",
    content: "Alguem recomenda um thriller curto para o fim de semana?",
    likes: 10,
    comments: 3,
  },
];

export default function FeedPage() {
  return (
    <AppShell>
      <PageHeader title="Feed" subtitle="Atualizacoes da comunidade" />
      <SectionHeader title="Ultimos posts" />
      <div className="space-y-4">
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              author={post.author}
              authorHandle={post.authorHandle}
              time={post.time}
              content={post.content}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        ) : (
          <EmptyState title="Sem posts no momento" description="Siga mais pessoas para ver novidades." />
        )}
      </div>

      <EmptyState title="Sem mais posts" description="Volte mais tarde para ver novas leituras." />
    </AppShell>
  );
}
