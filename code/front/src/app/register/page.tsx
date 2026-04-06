"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AuthCard, Button, PasswordInput, TextInput } from "@/components";
import { AuthApiError, registerWithEmailPassword } from "@/services";

type SubmitLikeEvent = {
  preventDefault: () => void;
};

type RegisterFormErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function validateRegisterFields(username: string, email: string, password: string, confirmPassword: string): RegisterFormErrors {
  const nextErrors: RegisterFormErrors = {};
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim();

  if (!normalizedUsername) {
    nextErrors.username = "Nome de usuario obrigatorio";
  } else if (!/^\w{3,30}$/.test(normalizedUsername)) {
    nextErrors.username = "Use de 3 a 30 caracteres (letras, numeros e _)";
  }

  if (!normalizedEmail) {
    nextErrors.email = "Email obrigatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    nextErrors.email = "Email invalido";
  }

  if (!password.trim()) {
    nextErrors.password = "Senha obrigatoria";
  } else if (password.length < 8) {
    nextErrors.password = "A senha deve ter no minimo 8 caracteres";
  }

  if (!confirmPassword.trim()) {
    nextErrors.confirmPassword = "Confirme sua senha";
  } else if (password !== confirmPassword) {
    nextErrors.confirmPassword = "As senhas nao coincidem";
  }

  return nextErrors;
}

function mapRegisterErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.code === "EMAIL_IN_USE") {
    return "Esse email ja esta em uso.";
  }

  if (error instanceof AuthApiError && error.code === "USERNAME_IN_USE") {
    return "Esse nome de usuario ja esta em uso.";
  }

  if (error instanceof AuthApiError && error.code === "VALIDATION") {
    return "Dados invalidos. Revise os campos e tente novamente.";
  }

  if (error instanceof AuthApiError && error.code === "NETWORK") {
    return "Falha de comunicacao com o servidor.";
  }

  return "Nao foi possivel criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await registerWithEmailPassword({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });

      router.push("/feed");
    } catch (error) {
      setFormError(mapRegisterErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Comece sua jornada literária no Biblioo"
      footer={
        <p className="mt-8 text-center text-base text-[var(--text-secondary)]">
          Ja possui uma conta?{" "}
          <Link href="/login" className="font-semibold text-[var(--brand-500)] hover:text-[var(--brand-600)]">
            Entrar
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Nome de usuario"
          type="text"
          placeholder="leitor_123"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isLoading}
          error={errors.username}
          className="[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.12em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium"
        />

        <TextInput
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          error={errors.email}
          className="[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.12em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium"
        />

        <PasswordInput
          label="Senha"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          error={errors.password}
          className="[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.12em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium"
        />

        <PasswordInput
          label="Confirmar senha"
          placeholder="********"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
          error={errors.confirmPassword}
          className="[&>span]:mb-1.5 [&>span]:text-[11px] [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-[0.12em] [&>span]:text-[var(--text-secondary)] [&_input]:h-12 [&_input]:text-sm [&_input]:font-medium"
        />

        {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-1.5 h-12 w-full rounded-xl bg-gradient-to-r from-[var(--brand-500)] via-[#238f40] to-[var(--brand-600)] text-[0.97rem] font-semibold tracking-[0.01em] text-white shadow-[0_8px_16px_rgba(23,117,47,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(23,117,47,0.3)] focus-visible:shadow-[0_0_0_3px_rgba(31,143,58,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span>{isLoading ? "Criando conta..." : "Criar conta"}</span>
            <UserPlus size={16} aria-hidden />
          </span>
        </Button>
      </form>
    </AuthCard>
  );
}
