"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Sparkles, Maximize2, Minimize2, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { sendAssistantMessage } from "@/services/assistant";
import { getAuthSession } from "@/services/auth";
import { formatDateLabel } from "@/utils/date";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type DateDivider = {
  type: "divider";
  id: string;
  label: string;
};

type ChatItem = Message | DateDivider;

type MessageBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

type StoredChat = {
  conversationId: string | null;
  messages: Array<Omit<Message, "timestamp"> & { timestamp: string }>;
};

const CHAT_STORAGE_KEY = (userId: number) => `biblioo.chat.${userId}`;
const TYPEWRITER_CHARS_PER_TICK = 6;
const TYPEWRITER_INTERVAL_MS = 16;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Olá! Eu sou a Bibo, sua assistente literária 📖✨ Posso recomendar livros, organizar sua estante ou encontrar leituras parecidas com as suas favoritas. Por onde começamos?",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  "Me recomende um livro",
  "Resumo do que estou lendo",
  "Criar uma nova coleção",
  "Sortear meu próximo livro",
];


function groupByDate(messages: Message[]): ChatItem[] {
  const result: ChatItem[] = [];
  let lastLabel = "";
  for (const msg of messages) {
    const label = formatDateLabel(msg.timestamp);
    if (label !== lastLabel) {
      result.push({ type: "divider", id: `divider-${label}-${msg.id}`, label });
      lastLabel = label;
    }
    result.push(msg);
  }
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseMessageBlocks(content: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) { flushList(); continue; }

    const ordered = line.match(/^\d+\.\s+(.+)/);
    if (ordered) {
      if (!list || list.type !== "ol") { flushList(); list = { type: "ol", items: [] }; }
      list.items.push(ordered[1]);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)/);
    if (unordered) {
      if (!list || list.type !== "ul") { flushList(); list = { type: "ul", items: [] }; }
      list.items.push(unordered[1]);
      continue;
    }

    flushList();
    blocks.push({ type: "p", text: line });
  }

  flushList();
  return blocks;
}

function renderInlineWithHighlight(text: string, query: string): React.ReactNode[] {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);

  return boldParts.flatMap((part, bIndex) => {
    const isBold = part.startsWith("**") && part.endsWith("**");
    const inner = isBold ? part.slice(2, -2) : part;

    if (!query.trim()) {
      const node = isBold
        ? <strong key={`b-${bIndex}`} className="font-semibold">{inner}</strong>
        : <span key={`t-${bIndex}`}>{inner}</span>;
      return [node];
    }

    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    const segments = inner.split(regex);
    const highlighted = segments.map((seg, sIndex) =>
      regex.test(seg)
        ? <mark key={`h-${bIndex}-${sIndex}`} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{seg}</mark>
        : <span key={`s-${bIndex}-${sIndex}`}>{seg}</span>,
    );

    if (isBold) {
      return [<strong key={`b-${bIndex}`} className="font-semibold">{highlighted}</strong>];
    }
    return highlighted;
  });
}

function renderMessageContent(content: string, searchQuery = ""): React.ReactNode {
  const blocks = parseMessageBlocks(content);
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={`p-${index}`} className="whitespace-pre-line">
              {renderInlineWithHighlight(block.text, searchQuery)}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={`ul-${index}`} className="list-disc pl-4 space-y-1">
              {block.items.map((item, i) => (
                <li key={`uli-${i}`}>{renderInlineWithHighlight(item, searchQuery)}</li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={`ol-${index}`} className="list-decimal pl-4 space-y-1">
            {block.items.map((item, i) => (
              <li key={`oli-${i}`}>{renderInlineWithHighlight(item, searchQuery)}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}

function loadStoredChat(userId: number): { messages: Message[]; conversationId: string | null } {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY(userId));
    if (!raw) return { messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }], conversationId: null };

    const stored: StoredChat = JSON.parse(raw) as StoredChat;

    return {
      messages: stored.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
      conversationId: stored.conversationId,
    };
  } catch {
    return { messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }], conversationId: null };
  }
}

function saveStoredChat(
  userId: number,
  messages: Message[],
  conversationId: string | null,
): void {
  try {
    const stored: StoredChat = {
      conversationId,
      messages: messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })),
    };
    localStorage.setItem(CHAT_STORAGE_KEY(userId), JSON.stringify(stored));
  } catch {
    // localStorage unavailable
  }
}

const BiblioChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Typewriter: tracks which message is animating and how many chars are shown
  const [typingEffect, setTypingEffect] = useState<{ id: string; chars: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // ── Init: load from localStorage ──
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const session = getAuthSession();
    if (!session) return;
    setUserId(session.user.id);
    const { messages: stored, conversationId: storedConvId } = loadStoredChat(session.user.id);
    setMessages(stored);
    setConversationId(storedConvId);
  }, []);

  // ── Persist to localStorage (skip during typewriter to avoid thrashing) ──
  useEffect(() => {
    if (userId === null || typingEffect !== null) return;
    saveStoredChat(userId, messages, conversationId);
  }, [messages, conversationId, userId, typingEffect]);

  // ── Focus search input when opened ──
  useEffect(() => {
    if (!showSearch) return;
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [showSearch]);

  // ── Typewriter tick ──
  useEffect(() => {
    if (!typingEffect) return;
    const msg = messages.find((m) => m.id === typingEffect.id);
    if (!msg) { setTypingEffect(null); return; }

    if (typingEffect.chars >= msg.content.length) {
      setTypingEffect(null);
      // Persist once animation is done
      if (userId !== null) saveStoredChat(userId, messages, conversationId);
      return;
    }

    const timer = setTimeout(() => {
      setTypingEffect((prev) =>
        prev ? { ...prev, chars: Math.min(prev.chars + TYPEWRITER_CHARS_PER_TICK, msg.content.length) } : null,
      );
    }, TYPEWRITER_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [typingEffect, messages, userId, conversationId]);

  // ── Auto-scroll: follow new messages when already at bottom ──
  useEffect(() => {
    if (!isAtBottom) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, isAtBottom]);

  // ── Auto-scroll during typewriter ──
  useEffect(() => {
    if (!typingEffect || !isAtBottom) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [typingEffect, isAtBottom]);

  // ── Scroll to bottom when chat opens ──
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" });
    }, 50);
  }, [open]);

  // ── Search: reset index when query changes ──
  useEffect(() => { setSearchMatchIndex(0); }, [searchQuery]);

  const matchingIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q)).map((m) => m.id);
  }, [messages, searchQuery]);

  const matchCount = matchingIds.length;

  // ── Scroll to current search match ──
  useEffect(() => {
    if (matchCount === 0) return;
    const id = matchingIds[searchMatchIndex];
    const el = scrollRef.current?.querySelector(`[data-msg-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchMatchIndex, matchingIds, matchCount]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distFromBottom < 60);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setIsAtBottom(true);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchMatchIndex(0);
  };

  const navigateSearch = (dir: 1 | -1) => {
    if (matchCount === 0) return;
    setSearchMatchIndex((i) => (i + dir + matchCount) % matchCount);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", content: trimmed, timestamp: new Date() },
    ]);
    setInput("");
    setIsAtBottom(true);
    setIsTyping(true);

    try {
      const response = await sendAssistantMessage({ message: trimmed, conversationId });
      if (response.conversationId && !conversationId) setConversationId(response.conversationId);

      const newId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        { id: newId, role: "assistant", content: response.reply, timestamp: new Date() },
      ]);
      setTypingEffect({ id: newId, chars: 0 });
    } catch (err) {
      const newId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        {
          id: newId,
          role: "assistant",
          content: err instanceof Error ? err.message : "Não consegui processar sua mensagem. Tente novamente.",
          timestamp: new Date(),
        },
      ]);
      setTypingEffect({ id: newId, chars: 0 });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleClose = () => {
    setOpen(false);
    closeSearch();
  };

  const chatItems = groupByDate(messages);
  const lastMessage = messages[messages.length - 1];
  const showSuggestions = lastMessage?.role === "assistant" && !isTyping && !typingEffect;

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 group transition-all duration-300 ease-out",
          open && "scale-0 opacity-0 pointer-events-none",
        )}
        aria-label="Abrir chat com a Bibo"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/40 ring-4 ring-background group-hover:scale-110 transition-transform">
          <Image
            src="/biblioo-carinha-branca-logo.png"
            alt="Bibo"
            width={40}
            height={40}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-premium ring-2 ring-background">
            <Sparkles className="h-3 w-3 text-premium-foreground" />
          </span>
        </span>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity">
          Conversar com a Bibo
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "bg-card border border-border rounded-2xl shadow-2xl shadow-foreground/10",
          "flex flex-col overflow-hidden origin-bottom-right",
          "transition-all duration-300 ease-out",
          expanded
            ? "w-[660px] max-w-[calc(100vw-2rem)] h-[740px] max-h-[calc(100vh-3rem)]"
            : "w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)]",
          open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none translate-y-4",
        )}
      >
        {/* Header */}
        <div className="relative px-4 py-3 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 ring-2 ring-background/30 backdrop-blur overflow-hidden">
                <Image
                  src="/biblioo-carinha-branca-logo.png"
                  alt="Bibo"
                  width={32}
                  height={32}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              {/* Pulse on green dot while typing */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-primary-dark transition-colors",
                  isTyping || typingEffect ? "bg-yellow-400 animate-pulse" : "bg-green-400",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base leading-tight">Bibo</h3>
              <p className="text-[11px] opacity-90 leading-tight">
                {isTyping ? "digitando..." : "Sua assistente literária"}
              </p>
            </div>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                showSearch ? "bg-white/20" : "hover:bg-white/15",
              )}
              aria-label="Buscar no chat"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
              aria-label={expanded ? "Reduzir chat" : "Expandir chat"}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="shrink-0 px-3 py-2 border-b border-border bg-card flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Buscar no chat..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                {matchCount === 0 ? "0 resultados" : `${searchMatchIndex + 1} de ${matchCount}`}
              </span>
            )}
            <button
              onClick={() => navigateSearch(-1)}
              disabled={matchCount === 0}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
              aria-label="Resultado anterior"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigateSearch(1)}
              disabled={matchCount === 0}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
              aria-label="Próximo resultado"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={closeSearch}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Fechar busca"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-secondary/40"
        >
          {chatItems.map((item) => {
            if ("type" in item && item.type === "divider") {
              return (
                <div key={item.id} className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              );
            }

            const m = item as Message;
            const isAnimating = typingEffect?.id === m.id;
            const displayedContent = isAnimating
              ? m.content.slice(0, typingEffect.chars)
              : m.content;
            const isCurrentMatch =
              searchQuery.trim() !== "" && matchingIds[searchMatchIndex] === m.id;

            return (
              <div
                key={m.id}
                data-msg-id={m.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
                    <Image
                      src="/biblioo-carinha-branca-logo.png"
                      alt="Bibo"
                      width={20}
                      height={20}
                      className="object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed transition-shadow",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm",
                    isCurrentMatch && "ring-2 ring-yellow-400 ring-offset-1",
                  )}
                >
                  {renderMessageContent(displayedContent, isAnimating ? "" : searchQuery)}
                  {isAnimating && (
                    <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 animate-fade-in">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark overflow-hidden">
                <Image
                  src="/biblioo-carinha-branca-logo.png"
                  alt="Bibo"
                  width={20}
                  height={20}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
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

          {showSuggestions && (
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

          {/* Scroll to bottom button */}
          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className={cn(
                "sticky bottom-0 left-1/2 -translate-x-1/2 w-fit",
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "bg-primary text-primary-foreground text-xs font-medium shadow-lg",
                "hover:opacity-90 transition-all animate-fade-in",
              )}
              aria-label="Ir para o final"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Ir para o final
            </button>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3 shrink-0">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 border border-border focus-within:border-primary focus-within:bg-card transition-colors pl-4 pr-1.5 py-1">
            <input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Pergunte algo à Bibo..."
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
            A Bibo pode cometer erros. Confirme informações importantes.
          </p>
        </form>
      </div>
    </>
  );
};

export default BiblioChatWidget;
