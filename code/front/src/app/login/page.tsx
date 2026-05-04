"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthLayout, Button, PasswordInput, TextInput } from "@/components";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuthApiError, loginWithEmailPassword } from "@/services";

const INPUT_CLASS =
  "[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.18em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium";

type SubmitLikeEvent = { preventDefault: () => void };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitLikeEvent) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "E-mail obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "E-mail inválido";
    }

    if (!password.trim()) nextErrors.password = "Senha obrigatória";

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await loginWithEmailPassword({ email: normalizedEmail, password });
      const next = searchParams.get("next") ?? "/feed";
      router.push(next);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "INVALID_CREDENTIALS") {
        setFormError("E-mail ou senha inválidos.");
      } else if (error instanceof AuthApiError && error.code === "NETWORK") {
        setFormError("Falha de comunicação com o servidor.");
      } else {
        setFormError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Entrar
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ou crie sua conta grátis
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
              error={errors.email}
              className={INPUT_CLASS}
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Senha
                </span>
                <Link
                  href="#"
                  className="text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-600)]"
                >
                  esqueci a senha
                </Link>
              </div>
              <PasswordInput
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                error={errors.password}
                className={INPUT_CLASS}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-xl bg-primary-dark text-primary-foreground text-[0.95rem] font-semibold tracking-[0.01em] shadow-[0_12px_26px_rgba(19,147,122,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_16px_30px_rgba(19,147,122,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span>{isLoading ? "Entrando..." : "Entrar"}</span>
                <ArrowRight size={16} aria-hidden />
              </span>
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="h-px flex-1 bg-[var(--border-soft)]" />
            ou
            <span className="h-px flex-1 bg-[var(--border-soft)]" />
          </div>

          <GoogleSignInButton onError={setFormError} onLoadingChange={setIsLoading} />

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--brand-500)] transition-colors hover:text-[var(--brand-600)]"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
