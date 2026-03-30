"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput, PrimaryButton, SecondaryButton, TextInput } from "@/components";
import { AuthApiError, loginWithEmailPassword } from "@/services";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email obrigatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Email invalido";
    }

    if (!password.trim()) nextErrors.password = "Senha obrigatoria";

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
        setFormError("Email ou senha invalidos.");
      } else if (error instanceof AuthApiError && error.code === "NETWORK") {
        setFormError("Falha de comunicacao com o servidor.");
      } else {
        setFormError("Nao foi possivel entrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrar</h1>
        <p className="mt-2 text-sm text-gray-500">Use sua conta do Biblioo.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
          />
          <PasswordInput
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.password ? <div className="text-red-600 text-sm">{errors.password}</div> : null}
          {formError ? <div className="text-red-600 text-sm">{formError}</div> : null}

          <PrimaryButton type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" disabled={isLoading}>Criar conta</SecondaryButton>
        </form>
      </div>
    </div>
  );
}
