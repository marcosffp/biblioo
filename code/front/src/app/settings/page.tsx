"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, LogOut, Mail, ShieldAlert, Upload, User } from "lucide-react";
import { AppShell } from "@/components";
import { clearAuthSession, getAccessToken, forgotPassword } from "@/services/auth";
import { getMyProfile } from "@/services/profile";
import { BookcaseApiError, importGoodreadsLibrary, type GoodreadsImportResult } from "@/services/bookcase";
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profile, setProfile] = React.useState<UserProfileResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<"idle" | "importing" | "done" | "error">("idle");
  const [importResult, setImportResult] = React.useState<GoodreadsImportResult | null>(null);
  const [importError, setImportError] = React.useState("");

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void getMyProfile(token).then(setProfile).catch(() => null);
  }, []);

  const email = profile?.email ?? "—";

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const selectedFile: File = file;
    e.target.value = "";
    setImportStatus("importing");
    setImportError("");
    setImportResult(null);
    async function doImport() {
      try {
        const result = await importGoodreadsLibrary(selectedFile);
        setImportResult(result);
        setImportStatus("done");
      } catch (err) {
        setImportError(
          err instanceof BookcaseApiError && err.message
            ? err.message
            : "Não foi possível importar os dados. Tente novamente.",
        );
        setImportStatus("error");
      }
    }
    void doImport();
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileSelected}
          />

          {importStatus === "idle" || importStatus === "error" ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Upload size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Importar do Goodreads</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                No Goodreads, vá em <span className="font-medium text-foreground">Minha conta → Importar/Exportar</span> e
                exporte sua biblioteca. Depois selecione o arquivo CSV abaixo.
              </p>
              {importStatus === "error" && (
                <p className="mx-auto mt-3 max-w-xs rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {importError}
                </p>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Upload size={14} />
                Selecionar arquivo CSV
              </button>
            </div>
          ) : importStatus === "importing" ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/30 py-10">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm font-semibold text-foreground">Importando seus livros...</p>
              <p className="mt-1 text-xs text-muted-foreground">Isso pode levar alguns instantes.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-3">
                {importResult && (importResult.imported > 0 || importResult.skipped > 0) ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">Importação concluída</p>
                  <p className="text-xs text-muted-foreground">{importResult?.totalRows ?? 0} linhas processadas</p>
                </div>
              </div>

              {importResult && (
                <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-lg font-bold text-emerald-700">{importResult.imported}</p>
                    <p className="text-[11px] text-emerald-600">Importados</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2">
                    <p className="text-lg font-bold text-blue-700">{importResult.skipped}</p>
                    <p className="text-[11px] text-blue-600">Já existiam</p>
                  </div>
                  <div className={`rounded-lg p-2 ${importResult.failed > 0 ? "bg-red-50" : "bg-muted/50"}`}>
                    <p className={`text-lg font-bold ${importResult.failed > 0 ? "text-red-700" : "text-muted-foreground"}`}>
                      {importResult.failed}
                    </p>
                    <p className={`text-[11px] ${importResult.failed > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      Falhas
                    </p>
                  </div>
                </div>
              )}

              {importResult && importResult.errors.length > 0 && (
                <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-border">
                  <div className="sticky top-0 border-b border-border bg-muted/80 px-3 py-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {importResult.errors.length} erro(s)
                    </p>
                  </div>
                  <ul className="divide-y divide-border">
                    {importResult.errors.map((err) => (
                      <li key={err.rowNumber} className="px-3 py-2">
                        <p className="text-xs font-medium text-foreground">{err.title || `Linha ${err.rowNumber}`}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{err.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setImportStatus("idle"); setImportResult(null); }}
                  className="flex-1 rounded-xl border border-border py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Importar outro
                </button>
                {(importResult?.imported ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    Ver perfil
                  </button>
                )}
              </div>
            </div>
          )}
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
