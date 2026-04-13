import React from "react";

import { Button } from "@/components/Button";

type UnfollowPrivateConfirmModalProps = {
  isOpen: boolean;
  username: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function UnfollowPrivateConfirmModal({
  isOpen,
  username,
  isLoading = false,
  onCancel,
  onConfirm,
}: UnfollowPrivateConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-semibold text-deep-green">Parar de seguir conta privada?</h2>
        <p className="mt-2 text-sm text-medium-text">
          Tem certeza que deseja parar de seguir @{username}? Como a conta e privada, você precisara enviar uma nova solicitacao para voltar a ver o conteudo.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="default" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Removendo..." : "Parar de seguir"}
          </Button>
        </div>
      </div>
    </div>
  );
}

