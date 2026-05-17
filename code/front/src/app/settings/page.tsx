"use client";

import Link from "next/link";
import React from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { AppShell } from "@/components";
import { getAccessToken } from "@/services/auth";
import { forgotPassword } from "@/services/auth";
import { getMyProfile, type UserProfileResponse } from "@/services/profile";


function ToggleSwitch({ checked, onChange }: Readonly<{ checked: boolean; onChange: () => void }>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        checked ? "bg-emerald-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PasswordResetModal({
  email,
  onClose,
}: Readonly<{ email: string; onClose: () => void }>) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSend = async () => {
    setStatus("loading");
    try {
      await forgotPassword(email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-base font-semibold text-foreground">E-mail enviado!</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Verifique sua caixa de entrada em <span className="font-medium">{email}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Fechar
            </button>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-foreground">Alterar senha</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviaremos um link de redefinição de senha para{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            {status === "error" && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                Não foi possível enviar o e-mail. Tente novamente.
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={status === "loading"}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {status === "loading" ? "Enviando..." : "Enviar link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void getMyProfile(token).then(setProfile).catch(() => null);
  }, []);

  const email = profile?.email ?? "—";

  return (
    <AppShell>
      <div className="w-full max-w-[680px] mx-auto">
        <header className="flex flex-col gap-3 py-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground w-fit"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        </header>

        {/* Conta */}
        <section className="mt-6 rounded-xl border border-border bg-card px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">Conta</h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-4 opacity-70 cursor-not-allowed select-none">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">E-mail</p>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground/60">{email}</p>
              </div>
              <span className="text-[11px] text-muted-foreground/50">Não editável</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Senha</p>
                <p className="mt-0.5 text-xs text-muted-foreground">••••••••</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                Alterar
              </button>
            </div>
          </div>
        </section>

        {/* Importação */}
        <section className="mt-4 rounded-xl border border-border bg-card px-6 py-5">
          <h2 className="text-base font-semibold text-foreground">Importação de dados</h2>

          <div className="mt-4 rounded-xl border border-border px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Upload size={18} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Importar do Goodreads</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Faça upload do CSV exportado do Goodreads para adicionar seus livros à estante.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Selecionar arquivo CSV
            </button>
          </div>
        </section>

        {/* Zona de perigo */}
        <section className="mt-4 rounded-xl border border-red-200 bg-card px-6 py-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-red-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Zona de perigo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ações irreversíveis. Tenha cuidado.
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Excluir conta
          </button>
        </section>
      </div>

      {isPasswordModalOpen && (
        <PasswordResetModal
          email={email}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
