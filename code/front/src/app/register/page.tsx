"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AuthLayout, Button, isPasswordValid, PasswordInput, PasswordStrengthChecklist, TextInput } from "@/components";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuthApiError, registerWithEmailPassword } from "@/services";

const INPUT_CLASS =
  "[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.18em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium";

type SubmitLikeEvent = { preventDefault: () => void };

type RegisterFormErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function validateRegisterFields(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterFormErrors {
  const nextErrors: RegisterFormErrors = {};
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim();

  if (!normalizedUsername) {
    nextErrors.username = "Nome de usuário obrigatório";
  } else if (!/^\w{3,30}$/.test(normalizedUsername)) {
    nextErrors.username = "Use de 3 a 30 caracteres (letras, numeros e _)";
  }

  if (!normalizedEmail) {
    nextErrors.email = "E-mail obrigatório";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    nextErrors.email = "E-mail inválido";
  }

  if (!password.trim()) {
    nextErrors.password = "Senha obrigatória";
  } else if (!isPasswordValid(password)) {
    nextErrors.password = "A senha não atende todos os requisitos indicados";
  }

  if (!confirmPassword.trim()) {
    nextErrors.confirmPassword = "Confirme sua senha";
  } else if (password !== confirmPassword) {
    nextErrors.confirmPassword = "As senhas não coincidem";
  }

  return nextErrors;
}

function mapRegisterErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.code === "EMAIL_IN_USE") {
    return "Esse e-mail já está em uso.";
  }
  if (error instanceof AuthApiError && error.code === "USERNAME_IN_USE") {
    return "Esse nome de usuário já está em uso.";
  }
  if (error instanceof AuthApiError && error.code === "VALIDATION") {
    return "Dados inválidos. Revise os campos e tente novamente.";
  }
  if (error instanceof AuthApiError && error.code === "NETWORK") {
    return "Falha de comunicação com o servidor.";
  }
  return "Não foi possível criar sua conta. Tente novamente.";
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitLikeEvent) {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const nextErrors = validateRegisterFields(username, email, password, confirmPassword);

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await registerWithEmailPassword({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });
      localStorage.removeItem("biblioo.onboarding.completed");
      const next = searchParams.get("next") ?? "/onboarding";
      router.push(next);
    } catch (error) {
      setFormError(mapRegisterErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Criar conta
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ou entre na sua conta
        </p>

        <div className="mt-8 space-y-5">
          {formError ? (
            <div role="alert" className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.12)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
              {formError}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextInput
              label="Nome de usuário"
              type="text"
              placeholder="leitor_123"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isLoading}
              error={errors.username}
              className={INPUT_CLASS}
            />

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
              <PasswordInput
                label="Senha"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                error={errors.password}
                className={INPUT_CLASS}
              />
              <PasswordStrengthChecklist password={password} />
            </div>

            <PasswordInput
              label="Confirmar senha"
              placeholder="********"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              error={errors.confirmPassword}
              className={INPUT_CLASS}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-xl bg-primary-dark text-primary-foreground text-[0.95rem] font-semibold tracking-[0.01em] shadow-[0_12px_26px_rgba(19,147,122,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_16px_30px_rgba(19,147,122,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span>{isLoading ? "Criando conta..." : "Criar conta"}</span>
                <UserPlus size={16} aria-hidden />
              </span>
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="h-px flex-1 bg-[var(--border-soft)]"></span>
            ou
            <span className="h-px flex-1 bg-[var(--border-soft)]"></span>
          </div>

          <GoogleSignInButton onError={setFormError} onLoadingChange={setIsLoading} />

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Já possui conta?{" "}
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
