"use client";

import React from "react";
import { Check, X } from "lucide-react";

export interface EditMessageModalProps {
  isOpen: boolean;
  previousMessage: string;
  draft: string;
  isSaving?: boolean;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function EditMessageModal({
  isOpen,
  previousMessage,
  draft,
  isSaving = false,
  onDraftChange,
  onClose,
  onSave,
}: Readonly<EditMessageModalProps>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-3xl bg-[#f3f3f3] p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/5"
            aria-label="Fechar edição"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-[30px] font-medium text-foreground">Editar mensagem</h3>
        </div>

        <div className="mb-4 rounded-2xl bg-[#efece6] p-4">
          <div className="mx-auto w-fit rounded-2xl bg-[#b8f0c2] px-4 py-2 text-sm text-foreground shadow-sm">
            {previousMessage || "Mensagem"}
          </div>
        </div>

        <div className="flex items-end gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Editar texto..."
            className="h-11 flex-1 border-none bg-transparent px-2 text-base text-foreground outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onSave}
            disabled={!draft.trim() || isSaving}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#20b059] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Salvar edição"
          >
            <Check className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMessageModal;
