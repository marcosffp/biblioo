"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CirclePlus,
  CornerUpLeft,
  Heart,
  Image,
  ImagePlus,
  Info,
  MoreHorizontal,
  Reply,
  Send,
  X,
} from "lucide-react";
import type { Community, CommunityChatMessage } from "../../hooks/useCommunity";
import type { TypingUser } from "../../hooks/useCommunityMessages";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { EditMessageModal } from "./EditMessageModal";

export interface CommunityChatPanelProps {
  community: Community;
  messages: CommunityChatMessage[];
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isConnected: boolean;
  messageError?: string;
  onSendMessage: (input: { content: string; hasSpoiler: boolean; images?: File[]; gif?: File | null; parentMessageId?: number | null }) => Promise<void>;
  onEditMessage: (input: { messageId: string; content: string }) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onToggleHeartReaction: (messageId: string) => Promise<void>;
  onBack: () => void;
  onOpenInfo: () => void;
  typingUsers: TypingUser[];
  onTyping: () => void;
}

export function CommunityChatPanel({
  community,
  messages,
  isLoadingMessages,
  isSendingMessage,
  isConnected,
  messageError,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onToggleHeartReaction,
  onBack,
  onOpenInfo,
  typingUsers,
  onTyping,
}: Readonly<CommunityChatPanelProps>) {
  const [newMessage, setNewMessage] = React.useState("");
  const [spoilerEnabled, setSpoilerEnabled] = React.useState(false);
  const [localSendError, setLocalSendError] = React.useState("");
  const [revealedSpoilers, setRevealedSpoilers] = React.useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [selectedGif, setSelectedGif] = React.useState<File | null>(null);
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editingPreviewText, setEditingPreviewText] = React.useState("");
  const [editingDraft, setEditingDraft] = React.useState("");
  const [messageToDeleteId, setMessageToDeleteId] = React.useState<string | null>(null);
  const [isPerformingAction, setIsPerformingAction] = React.useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = React.useState(false);
  const [openedMessageMenuId, setOpenedMessageMenuId] = React.useState<string | null>(null);
  const [replyingTo, setReplyingTo] = React.useState<CommunityChatMessage | null>(null);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const gifInputRef = React.useRef<HTMLInputElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const messagesById = React.useMemo(() => {
    const map = new Map<string, CommunityChatMessage>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);
  const moreOptionsRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (!isMoreOptionsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(target)) {
        setIsMoreOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreOptionsOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-chat-message-menu='true']")) {
        setOpenedMessageMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text && selectedImages.length === 0 && !selectedGif) {
      return;
    }

    setLocalSendError("");

    try {
      await onSendMessage({
        content: text,
        hasSpoiler: spoilerEnabled,
        images: selectedImages,
        gif: selectedGif,
        parentMessageId: replyingTo ? Number(replyingTo.id) : null,
      });
      setIsMoreOptionsOpen(false);
      setNewMessage("");
      setSpoilerEnabled(false);
      setSelectedImages([]);
      setSelectedGif(null);
      setReplyingTo(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      if (gifInputRef.current) {
        gifInputRef.current.value = "";
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalSendError(error.message);
        return;
      }

      setLocalSendError("Não foi possível enviar a mensagem.");
    }
  };

  const revealSpoiler = (messageId: string) => {
    setRevealedSpoilers((current) => new Set(current).add(messageId));
  };

  const startEditing = (message: CommunityChatMessage) => {
    setEditingMessageId(message.id);
    setEditingPreviewText(message.text);
    setEditingDraft(message.text);
    setLocalSendError("");
    setOpenedMessageMenuId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingPreviewText("");
    setEditingDraft("");
  };

  const saveEditing = async () => {
    if (!editingMessageId) {
      return;
    }

    const normalized = editingDraft.trim();
    if (!normalized) {
      setLocalSendError("A mensagem editada não pode ficar vazia.");
      return;
    }

    setIsPerformingAction(true);
    setLocalSendError("");

    try {
      await onEditMessage({ messageId: editingMessageId, content: normalized });
      cancelEditing();
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalSendError(error.message);
      } else {
        setLocalSendError("Não foi possível editar a mensagem.");
      }
    } finally {
      setIsPerformingAction(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDeleteId) {
      return;
    }

    setIsPerformingAction(true);
    setLocalSendError("");

    try {
      await onDeleteMessage(messageToDeleteId);
      if (editingMessageId === messageToDeleteId) {
        cancelEditing();
      }
      setMessageToDeleteId(null);
      setOpenedMessageMenuId(null);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalSendError(error.message);
      } else {
        setLocalSendError("Não foi possível remover a mensagem.");
      }
    } finally {
      setIsPerformingAction(false);
    }
  };

  const toggleHeart = async (messageId: string) => {
    setLocalSendError("");

    try {
      await onToggleHeartReaction(messageId);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setLocalSendError(error.message);
      } else {
        setLocalSendError("Não foi possível reagir a mensagem.");
      }
    }
  };

  const onPickImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const valid = files.filter((file) => file.type.startsWith("image/") && file.type !== "image/gif");
    if (!valid.length) {
      setLocalSendError("Selecione imagens JPG, PNG ou WebP.");
      return;
    }

    setSelectedImages((current) => [...current, ...valid].slice(0, 5));
    setLocalSendError("");
  };

  const onPickGif = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (file.type !== "image/gif") {
      setLocalSendError("O arquivo GIF deve ser do tipo image/gif.");
      return;
    }

    setSelectedGif(file);
    setLocalSendError("");
  };

  const removeSelectedImage = (indexToRemove: number) => {
    setSelectedImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const clearSelectedGif = () => {
    setSelectedGif(null);
    if (gifInputRef.current) {
      gifInputRef.current.value = "";
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-border/80 bg-[#fbfcfc] px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Voltar para comunidades"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {(() => {
          const displayUrl = community.coverUrl ?? community.bookCoverUrl;
          if (displayUrl) {
            return (
              <img
                src={displayUrl}
                alt={community.name}
                aria-hidden="true"
                className="h-10 w-10 rounded-full object-cover"
              />
            );
          }
          return (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          );
        })()}

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

      <div className="flex-1 overflow-y-auto bg-[#f8faf9] px-4 py-4 pb-20">
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
              <div key={message.id} className={`group flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[66%] items-end gap-1.5 ${message.isMine ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Heart reaction */}
                  <button
                    type="button"
                    onClick={() => { void toggleHeart(message.id); }}
                    disabled={message.id.startsWith("temp-") || Boolean(message.isDeleted)}
                    className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center gap-0.5 rounded-full border px-1.5 shadow-sm transition-all ${
                      Boolean(message.hasHeartReaction) || (message.heartCount ?? 0) > 0
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-border/70 bg-white text-muted-foreground hover:bg-slate-50"
                    } ${Boolean(message.hasHeartReaction) || (message.heartCount ?? 0) > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"} disabled:cursor-not-allowed disabled:opacity-60`}
                    aria-label="Reagir com coração"
                  >
                    <Heart className="h-4 w-4" fill={message.hasHeartReaction ? "currentColor" : "none"} />
                    {(message.heartCount ?? 0) > 0 ? (
                      <span className="text-[9px] font-medium leading-none text-muted-foreground">{message.heartCount}</span>
                    ) : null}
                  </button>

                  {/* Reply button */}
                  {!message.isDeleted ? (
                    <button
                      type="button"
                      onClick={() => { setReplyingTo(message); inputRef.current?.focus(); }}
                      className="opacity-0 group-hover:opacity-100 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-white text-muted-foreground shadow-sm transition-all hover:bg-slate-50"
                      aria-label="Responder mensagem"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <div className={message.isMine ? "items-end" : "items-start"}>
                  {message.isMine ? null : (
                    <p className="mb-0.5 ml-1 text-[10px] font-medium text-slate-600">{message.userName}</p>
                  )}

                  <div
                    className={`relative rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                      message.isMine
                        ? "rounded-tr-md border border-[var(--brand-500)]/20 bg-[var(--brand-100)] pr-9 text-[var(--text-primary)]"
                        : "rounded-tl-md border border-[var(--border)] bg-white text-slate-800"
                    }`}
                    data-chat-message-menu="true"
                  >
                    {message.isMine && !message.id.startsWith("temp-") && !message.isDeleted ? (
                      <div className="absolute right-1.5 top-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenedMessageMenuId((current) => (current === message.id ? null : message.id))
                          }
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Abrir ações da mensagem"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {openedMessageMenuId === message.id ? (
                          <div className="absolute right-0 top-7 z-10 min-w-[140px] rounded-xl border border-border bg-white p-1.5 text-foreground shadow-lg">
                            <button
                              type="button"
                              onClick={() => startEditing(message)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-muted"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMessageToDeleteId(message.id);
                                setOpenedMessageMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
                            >
                              Apagar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Reply context */}
                    {message.parentMessageId != null ? (() => {
                      const parent = messagesById.get(String(message.parentMessageId));
                      return (
                        <div className={`mb-2 flex items-start gap-1.5 rounded-lg border-l-2 pl-2 pr-2 py-1.5 ${
                          message.isMine
                            ? "border-[var(--brand-600)] bg-[var(--brand-600)]/10"
                            : "border-[var(--brand-500)] bg-[var(--bg-soft)]"
                        }`}>
                          <CornerUpLeft className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-600 truncate">
                              {parent ? parent.userName : "Mensagem"}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 truncate">
                              {parent?.isDeleted ? "Mensagem removida" : (parent?.text ?? "Mensagem não disponível")}
                            </p>
                          </div>
                        </div>
                      );
                    })() : null}

                    {message.isSpoiler ? (
                      <p
                        className={`mb-1 inline-flex items-center gap-1 text-[10px] font-medium ${
                          message.isMine ? "text-slate-500" : "text-muted-foreground"
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Spoiler
                      </p>
                    ) : null}

                    <div className="space-y-1">
                      <div className="min-w-0">
                        {message.isDeleted ? (
                          <p className="italic">Mensagem removida</p>
                        ) : message.isSpoiler && !revealedSpoilers.has(message.id) ? (
                          <button
                            type="button"
                            onClick={() => revealSpoiler(message.id)}
                            className={`inline-flex items-center gap-1.5 text-left text-xs ${
                              message.isMine ? "text-slate-500" : "text-muted-foreground"
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Spoiler - toque para revelar
                          </button>
                        ) : (
                          <div className="space-y-1">
                            <p className="break-words">{message.text}</p>

                            {!message.isDeleted && message.images && message.images.length > 0 ? (
                              <div className="grid grid-cols-2 gap-1.5">
                                {message.images.map((imageUrl) => (
                                  <img
                                    key={imageUrl}
                                    src={imageUrl}
                                    alt="Imagem anexada"
                                    className="h-28 w-full rounded-lg object-cover"
                                  />
                                ))}
                              </div>
                            ) : null}

                            {!message.isDeleted && message.gifUrl ? (
                              <img src={message.gifUrl} alt="GIF anexado" className="max-h-44 w-full rounded-lg object-cover" />
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={`shrink-0 text-[9.5px] leading-none ${
                            "text-muted-foreground"
                          }`}
                        >
                          {message.time}
                          {message.isEdited ? " (editada)" : ""}
                        </p>
                      </div>
                    </div>

                  </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="h-16" ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border/80 bg-[#fbfcfc] px-3 py-2">
        {typingUsers.length > 0 ? (
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <div className="flex -space-x-1.5">
              {typingUsers.slice(0, 3).map((u) =>
                u.avatarUrl ? (
                  <img
                    key={u.userId}
                    src={u.avatarUrl}
                    alt={u.username}
                    className="h-5 w-5 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div
                    key={u.userId}
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-semibold text-slate-500"
                  >
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                ),
              )}
            </div>
            <p className="animate-pulse text-[11px] text-muted-foreground">
              {typingUsers.length === 1
                ? `${typingUsers[0].username} está digitando...`
                : typingUsers.length === 2
                  ? `${typingUsers[0].username} e ${typingUsers[1].username} estão digitando...`
                  : "Várias pessoas estão digitando..."}
            </p>
          </div>
        ) : null}

        {isConnected ? null : (
          <p className="mb-2 ml-1 text-[11px] text-amber-700">Conectando ao chat em tempo real...</p>
        )}

        {localSendError ? <p className="mb-2 ml-1 text-[11px] text-red-700">{localSendError}</p> : null}

        {replyingTo ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-slate-50 px-3 py-2">
            <CornerUpLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-600">{replyingTo.userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{replyingTo.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted"
              aria-label="Cancelar resposta"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {spoilerEnabled ? (
          <div className="mb-2 ml-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Spoiler ativado
          </div>
        ) : null}

        {selectedImages.length > 0 || selectedGif ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selectedImages.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground"
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => removeSelectedImage(index)}
                  aria-label="Remover imagem selecionada"
                  className="rounded-full p-0.5 hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {selectedGif ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-700">
                GIF: {selectedGif.name}
                <button
                  type="button"
                  onClick={clearSelectedGif}
                  aria-label="Remover GIF selecionado"
                  className="rounded-full p-0.5 hover:bg-black/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="relative flex items-end gap-2" ref={moreOptionsRef}>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={onPickImages}
          />

          <input ref={gifInputRef} type="file" accept="image/gif" className="hidden" onChange={onPickGif} />

          <button
            type="button"
            onClick={() => setIsMoreOptionsOpen((current) => !current)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Mais opções"
            aria-label="Abrir mais opções"
          >
            <CirclePlus className="h-5 w-5" />
          </button>

          {isMoreOptionsOpen ? (
            <div className="absolute bottom-12 left-0 z-10 w-52 rounded-2xl border border-border bg-white p-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                  setIsMoreOptionsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Image className="h-4 w-4 text-sky-600" />
                Fotos e vídeos
              </button>
              <button
                type="button"
                onClick={() => {
                  gifInputRef.current?.click();
                  setIsMoreOptionsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <ImagePlus className="h-4 w-4 text-fuchsia-600" />
                GIF
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setSpoilerEnabled((current) => !current)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={spoilerEnabled ? "Desativar spoiler" : "Marcar spoiler"}
            aria-label="Alternar spoiler"
          >
            <AlertTriangle
              className={`h-5 w-5 ${spoilerEnabled ? "text-amber-600" : ""
                }`}
            />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(event) => {
              setNewMessage(event.target.value);
              onTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? `Responder a ${replyingTo.userName}...` : "Digite uma mensagem..."}
            className="h-10 flex-1 rounded-full border border-border bg-white px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-border focus:ring-2 focus:ring-black/5"
          />

          <button
            type="button"
            onClick={() => {
              void handleSend();
            }}
            disabled={(!newMessage.trim() && selectedImages.length === 0 && !selectedGif) || isSendingMessage}
            className="rounded-full bg-primary text-white p-2.5 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={messageToDeleteId != null}
        title="Apagar mensagem"
        description="Essa mensagem será removida para todos na conversa. Deseja continuar?"
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        isLoading={isPerformingAction}
        onClose={() => {
          if (!isPerformingAction) {
            setMessageToDeleteId(null);
          }
        }}
        onConfirm={() => {
          void confirmDeleteMessage();
        }}
      />

      <EditMessageModal
        isOpen={editingMessageId != null}
        previousMessage={editingPreviewText}
        draft={editingDraft}
        isSaving={isPerformingAction}
        onDraftChange={setEditingDraft}
        onClose={cancelEditing}
        onSave={() => {
          void saveEditing();
        }}
      />
    </div>
  );
}

export default CommunityChatPanel;
