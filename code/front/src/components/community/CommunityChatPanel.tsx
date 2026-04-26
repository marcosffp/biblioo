"use client";

import React from "react";
import { AlertTriangle, ArrowLeft, BookOpen, Info, Send } from "lucide-react";
import type { Community, CommunityChatMessage } from "../../hooks/useCommunity";

export interface CommunityChatPanelProps {
  community: Community;
  messages: CommunityChatMessage[];
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isConnected: boolean;
  messageError?: string;
  onSendMessage: (input: { content: string; hasSpoiler: boolean }) => Promise<void>;
  onBack: () => void;
  onOpenInfo: () => void;
}

export function CommunityChatPanel({
  community,
  messages,
  isLoadingMessages,
  isSendingMessage,
  isConnected,
  messageError,
  onSendMessage,
  onBack,
  onOpenInfo,
}: Readonly<CommunityChatPanelProps>) {
  const [newMessage, setNewMessage] = React.useState("");
  const [spoilerEnabled, setSpoilerEnabled] = React.useState(false);
  const [localSendError, setLocalSendError] = React.useState("");
  const [revealedSpoilers, setRevealedSpoilers] = React.useState<Set<string>>(new Set());
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text) {
      return;
    }

    setLocalSendError("");

    try {
      await onSendMessage({ content: text, hasSpoiler: spoilerEnabled });
      setNewMessage("");
      setSpoilerEnabled(false);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalSendError(error.message);
        return;
      }

      setLocalSendError("Nao foi possivel enviar a mensagem.");
    }
  };

  const revealSpoiler = (messageId: string) => {
    setRevealedSpoilers((current) => new Set(current).add(messageId));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Voltar para comunidades"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 bg-cover bg-center"
          style={community.coverUrl ? { backgroundImage: `url(${community.coverUrl})` } : undefined}
          aria-hidden="true"
        >
          {community.coverUrl ? null : <BookOpen className="h-5 w-5 text-primary" />}
        </div>

        <button
          type="button"
          onClick={onOpenInfo}
          className="min-w-0 flex-1 text-left"
          aria-label="Abrir Informações do grupo"
        >
          <h2 className="truncate text-sm font-semibold text-foreground">{community.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{community.members} membros - {community.bookTitle}</p>
        </button>

        <button
          type="button"
          onClick={onOpenInfo}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Abrir painel do grupo"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 py-4 pb-20">
        <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col gap-2.5">
          {isLoadingMessages ? (
            <p className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              Carregando mensagens...
            </p>
          ) : null}

          {!isLoadingMessages && messageError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {messageError}
            </p>
          ) : null}

          {messages.map((message) => {
            if (message.isSystem) {
              return (
                <div key={message.id} className="flex justify-center py-2">
                  <span className="rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">{message.text}</span>
                </div>
              );
            }

            return (
              <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[56%] ${message.isMine ? "items-end" : "items-start"}`}>
                  {message.isMine ? null : (
                    <p className="mb-0.5 ml-1 text-[11px] font-medium text-primary">{message.userName}</p>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-1.5 text-[13px] leading-relaxed ${
                      message.isMine
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm border border-border bg-white text-foreground"
                    }`}
                  >
                    {message.isSpoiler ? (
                      <p
                        className={`mb-1 inline-flex items-center gap-1 text-[10px] font-medium ${
                          message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Spoiler
                      </p>
                    ) : null}

                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {message.isSpoiler && !revealedSpoilers.has(message.id) ? (
                          <button
                            type="button"
                            onClick={() => revealSpoiler(message.id)}
                            className={`inline-flex items-center gap-1.5 text-left text-xs ${
                              message.isMine ? "text-primary-foreground/75" : "text-muted-foreground"
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Spoiler - toque para revelar
                          </button>
                        ) : (
                          <p className="break-words">{message.text}</p>
                        )}
                      </div>

                      <p
                        className={`shrink-0 text-[10px] leading-none ${
                          message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="h-16" ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-white px-3 py-2">
        {isConnected ? null : (
          <p className="mb-2 ml-1 text-[11px] text-amber-700">Conectando ao chat em tempo real...</p>
        )}

        {spoilerEnabled ? (
          <div className="mb-2 ml-1 flex items-center gap-1.5 text-[11px] text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Mensagem será marcada como spoiler!
          </div>
        ) : null}

        {localSendError ? <p className="mb-2 ml-1 text-[11px] text-red-700">{localSendError}</p> : null}

        <div className="flex items-end gap-2">
          <label
            className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-foreground"
            title="Marcar como spoiler"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={spoilerEnabled}
              onChange={(event) => setSpoilerEnabled(event.target.checked)}
            />
            <AlertTriangle className={`h-5 w-5 ${spoilerEnabled ? "text-amber-500" : ""}`} />
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="h-10 flex-1 rounded-full border border-border bg-white px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
          />

          <button
            type="button"
            onClick={() => {
              void handleSend();
            }}
            disabled={!newMessage.trim() || isSendingMessage}
            className="rounded-full bg-primary text-white p-2.5 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityChatPanel;
