"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthCard, Button, PasswordInput, TextInput } from "@/components";
import { AuthApiError, loginWithEmailPassword } from "@/services";

type SubmitLikeEvent = {
  preventDefault: () => void;
};

export default function LoginPage() {
  const router = useRouter();
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await loginWithEmailPassword({
        email: normalizedEmail,
        password,
      });
      router.push("/feed");
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
    <AuthCard
      title="Bem-vindo de volta"
      subtitle="Entre para continuar sua jornada literária"
      showDivider
      footer={
        <p className="mt-8 text-center text-base text-[var(--text-secondary)]">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-[var(--brand-500)] hover:text-[var(--brand-600)]">
            Cadastre-se
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

        <div className="-mt-0.5 text-sm">
          <Link href="#" className="font-medium text-primary-dark hover:text-primary">
            Esqueceu sua senha?
          </Link>
        </div>

        {formError ? (
          <div className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive)/0.12)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
            {formError}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-1.5 h-12 w-full rounded-[var(--radius-md)] bg-primary-dark text-primary-foreground text-[0.97rem] font-semibold tracking-[0.01em] shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-card-hover active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span>{isLoading ? "Entrando..." : "Entrar"}</span>
            <ArrowRight size={16} aria-hidden />
          </span>
        </Button>
      </form>
    </AuthCard>
  );
}

