"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { AuthLayout, Button, PasswordInput } from "@/components";
import { AuthApiError, resetPassword } from "@/services";

const INPUT_CLASS =
  "[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.18em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

type SubmitLikeEvent = { preventDefault: () => void };

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <AuthLayout>
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            Link inválido
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Este link de redefinição é inválido ou já expirou.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-500)] transition-colors hover:text-[var(--brand-600)]"
          >
            Solicitar novo link
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand-500)/0.12)]">
            <CheckCircle size={22} className="text-[var(--brand-500)]" aria-hidden />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--text-primary)]">
            Senha redefinida!
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sua senha foi alterada com sucesso. Agora você pode entrar com a nova senha.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-500)] transition-colors hover:text-[var(--brand-600)]"
          >
            Ir para o login
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  async function handleSubmit(event: SubmitLikeEvent) {
    event.preventDefault();
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword.trim()) {
      nextErrors.newPassword = "Senha obrigatória";
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      nextErrors.newPassword =
        "Mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirmação obrigatória";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "INVALID_TOKEN") {
        setFormError("Link inválido ou expirado. Solicite um novo link de redefinição.");
      } else if (error instanceof AuthApiError && error.code === "VALIDATION") {
        setFormError("A senha não atende aos requisitos mínimos.");
      } else if (error instanceof AuthApiError && error.code === "NETWORK") {
        setFormError("Falha de comunicação com o servidor.");
      } else {
        setFormError("Não foi possível redefinir a senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Nova senha
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Crie uma senha forte para proteger sua conta.
        </p>

        <div className="mt-8 space-y-5">
          {formError ? (
            <div role="alert" className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.12)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
              {formError}
              {(formError.includes("inválido") || formError.includes("expirado")) && (
                <Link
                  href="/forgot-password"
                  className="ml-1 font-medium underline"
                >
                  Solicitar novo link
                </Link>
              )}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <PasswordInput
              label="Nova senha"
              placeholder="********"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isLoading}
              error={errors.newPassword}
              className={INPUT_CLASS}
            />

            <PasswordInput
              label="Confirmar nova senha"
              placeholder="********"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              error={errors.confirmPassword}
              className={INPUT_CLASS}
            />

            <p className="text-xs text-[var(--text-secondary)]">
              Mínimo 8 caracteres · uma maiúscula · um número · um caractere especial
            </p>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-xl bg-primary-dark text-primary-foreground text-[0.95rem] font-semibold tracking-[0.01em] shadow-[0_12px_26px_rgba(19,147,122,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_16px_30px_rgba(19,147,122,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span>{isLoading ? "Salvando..." : "Redefinir senha"}</span>
                <ArrowRight size={16} aria-hidden />
              </span>
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Lembrou a senha?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--brand-500)] transition-colors hover:text-[var(--brand-600)]"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
