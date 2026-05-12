"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthLayout, Button, TextInput } from "@/components";
import { AuthApiError, forgotPassword } from "@/services";

const INPUT_CLASS =
  "[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.18em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium";

type SubmitLikeEvent = { preventDefault: () => void };

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: SubmitLikeEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("E-mail obrigatório");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("E-mail inválido");
      return;
    }

    setEmailError("");
    setFormError("");
    setIsLoading(true);

    try {
      await forgotPassword(normalizedEmail);
      setSent(true);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "RATE_LIMIT") {
        setFormError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (error instanceof AuthApiError && error.code === "NETWORK") {
        setFormError("Falha de comunicação com o servidor.");
      } else {
        setFormError("Não foi possível enviar o e-mail. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand-500)/0.12)]">
            <Mail size={22} className="text-[var(--brand-500)]" aria-hidden />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--text-primary)]">
            E-mail enviado
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes. Verifique também sua caixa de spam.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-500)] transition-colors hover:text-[var(--brand-600)]"
          >
            <ArrowLeft size={14} aria-hidden />
            Voltar ao login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Esqueci a senha
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <div className="mt-8 space-y-5">
          {formError ? (
            <div role="alert" className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.12)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
              {formError}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextInput
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              error={emailError}
              className={INPUT_CLASS}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-xl bg-primary-dark text-primary-foreground text-[0.95rem] font-semibold tracking-[0.01em] shadow-[0_12px_26px_rgba(19,147,122,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_16px_30px_rgba(19,147,122,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span>{isLoading ? "Enviando..." : "Enviar link"}</span>
                <Mail size={16} aria-hidden />
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

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
