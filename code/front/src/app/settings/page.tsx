"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, LogOut, Mail, ShieldAlert, Upload, User } from "lucide-react";
import { AppShell } from "@/components";
import { clearAuthSession, getAccessToken, forgotPassword } from "@/services/auth";
import { getMyProfile } from "@/services/profile";
import type { UserProfileResponse } from "@/types/api";

function PasswordResetModal({ email, onClose }: Readonly<{ email: string; onClose: () => void }>) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {status === "success" ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h3 className="mt-4 text-center text-base font-semibold text-foreground">E-mail enviado!</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Verifique sua caixa de entrada em <span className="font-medium">{email}</span>.
            </p>
            <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
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
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-foreground hover:bg-muted">
                Cancelar
              </button>
              <button type="button" onClick={() => void handleSend()} disabled={status === "loading"} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {status === "loading" ? "Enviando..." : "Enviar link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, danger }: { title: string; icon?: React.ReactNode; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-2xl border bg-card shadow-sm ${danger ? "border-red-200" : "border-border"}`}>
      <div className={`flex items-center gap-2 border-b px-6 py-4 ${danger ? "border-red-100" : "border-border"}`}>
        {icon ? <span className={danger ? "text-red-500" : "text-emerald-600"}>{icon}</span> : null}
        <h2 className={`text-xs font-semibold uppercase tracking-wider ${danger ? "text-red-500" : "text-muted-foreground"}`}>{title}</h2>
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </section>
  );
}

function SettingRow({ icon, label, description, action, disabled, iconBg = "bg-emerald-50", iconColor = "text-emerald-600" }: {
  icon: React.ReactNode; label: string; description?: string; action?: React.ReactNode; disabled?: boolean; iconBg?: string; iconColor?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 ${disabled ? "cursor-not-allowed bg-muted/40 opacity-60" : "bg-white"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {description ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void getMyProfile(token).then(setProfile).catch(() => null);
  }, []);

  const email = profile?.email ?? "—";

  const handleLogout = () => {
    setIsLoggingOut(true);
    clearAuthSession();
    router.push("/login");
  };

  return (
    <AppShell>
      <div className="w-full max-w-[680px] mx-auto space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-2 pb-1">
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground w-fit">
            <ArrowLeft size={16} />
            <span>Voltar ao perfil</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </header>

        {/* Conta */}
        <SectionCard title="Conta" icon={<User size={15} />}>
          <SettingRow
            icon={<Mail size={16} />}
            label="E-mail"
            description={email}
            disabled
            action={<span className="text-[11px] text-muted-foreground/60">Não editável</span>}
          />
          <SettingRow
            icon={<KeyRound size={16} />}
            label="Senha"
            description="••••••••••••"
            action={
              <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="rounded-lg border border-border bg-muted px-4 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50">
                Alterar
              </button>
            }
          />
        </SectionCard>

        {/* Importação */}
        <SectionCard title="Importação de dados" icon={<Upload size={15} />}>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Upload size={18} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Importar do Goodreads</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Faça upload do CSV exportado do Goodreads para adicionar seus livros à estante.
            </p>
            <button type="button" className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
              Selecionar arquivo CSV
            </button>
          </div>
        </SectionCard>

        {/* Sessão */}
        <SectionCard title="Sessão" icon={<LogOut size={15} />}>
          <SettingRow
            icon={<LogOut size={16} />}
            label="Sair da conta"
            description="Encerra sua sessão neste dispositivo"
            iconBg="bg-red-50"
            iconColor="text-red-500"
            action={
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
                {isLoggingOut ? "Saindo..." : "Sair"}
              </button>
            }
          />
        </SectionCard>
      </div>

      {isPasswordModalOpen && (
        <PasswordResetModal email={email} onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </AppShell>
  );
}
