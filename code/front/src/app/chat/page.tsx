import React from "react";
import { AppShell, CommentComposer, CommentItem, PageHeader, SectionHeader } from "@/components";

const comments = [
  { id: "m1", author: "Ana Paula", time: "10m", content: "Esse capitulo me deixou sem palavras." },
  { id: "m2", author: "Renato Alves", time: "35m", content: "Tambem senti isso! A autora foi brilhante." },
];

export default function ChatPage() {
  return (
    <AppShell>
      <PageHeader title="Clube de Leitura" subtitle="Discussao da semana" />

      <SectionHeader title="Comentários" />
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} author={comment.author} time={comment.time} content={comment.content} />
        ))}
      </div>

      <CommentComposer />
    </AppShell>
  );
}

