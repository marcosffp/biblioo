"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Minimize2 } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { sendAssistantMessage } from "@/services/assistant";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  "Me recomende um livro",
  "Resumo do que estou lendo",
  "Criar uma nova coleção",
  "Sortear meu próximo livro",
];

const BiblioChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Eu sou a Bibi, sua assistente literária 📖✨ Posso recomendar livros, organizar sua estante ou encontrar leituras parecidas com as suas favoritas. Por onde começamos?",
      timestamp: new Date(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendAssistantMessage({
        message: trimmed,
        conversationId,
      });

      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((m) => [...m, reply]);
    } catch (err) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Não consegui processar sua mensagem. Tente novamente.";

      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorText,
        timestamp: new Date(),
      };

      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 group",
          "transition-all duration-300 ease-out",
          open && "scale-0 opacity-0 pointer-events-none",
        )}
        aria-label="Abrir chat com a Bibi"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/40 ring-4 ring-background group-hover:scale-110 transition-transform">
          <Image
            src="/biblioo-carinha-branca-logo.png"
            alt="Bibi"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-premium ring-2 ring-background">
            <Sparkles className="h-3 w-3 text-premium-foreground" />
          </span>
        </span>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity">
          Conversar com a Bibi
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)]",
          "bg-card border border-border rounded-2xl shadow-2xl shadow-foreground/10",
          "flex flex-col overflow-hidden origin-bottom-right",
          "transition-all duration-300 ease-out",
          open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none translate-y-4",
        )}
      >
        {/* Header */}
        <div className="relative px-4 py-3 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 ring-2 ring-background/30 backdrop-blur overflow-hidden">
                <Image
                  src="/biblioo-carinha-branca-logo.png"
                  alt="Bibi"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base leading-tight">Bibi</h3>
              <p className="text-[11px] opacity-90 leading-tight">Sua assistente literária</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
              aria-label="Minimizar"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-secondary/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
                  <Image
                    src="/biblioo-carinha-branca-logo.png"
                    alt="Bibi"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 animate-fade-in">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
                <Image
                  src="/biblioo-carinha-branca-logo.png"
                  alt="Bibi"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {messages.length <= 1 && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-1">
                Sugestões
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 border border-border focus-within:border-primary focus-within:bg-card transition-colors pl-4 pr-1.5 py-1">
            <input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Pergunte algo à Bibi..."
              className="flex-1 border-0 bg-transparent outline-none px-0 h-9 text-sm placeholder:text-muted-foreground disabled:opacity-50"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-full shrink-0 bg-gradient-to-br from-primary to-primary-dark hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            A Bibi pode cometer erros. Confirme informações importantes.
          </p>
        </form>
      </div>
    </>
  );
};

export default BiblioChatWidget;
