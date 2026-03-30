"use client";

import React, { useState } from "react";
import { PasswordInput, PrimaryButton, SecondaryButton, TextInput } from "@/components";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) nextErrors.email = "Email obrigatorio";
    if (!password.trim()) nextErrors.password = "Senha obrigatoria";

    setErrors(nextErrors);
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
          />
          <PasswordInput
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password ? <div className="text-red-600 text-sm">{errors.password}</div> : null}

          <PrimaryButton type="submit" className="w-full">Entrar</PrimaryButton>
          <SecondaryButton type="button" className="w-full">Criar conta</SecondaryButton>
        </form>
      </div>
    </div>
  );
}
