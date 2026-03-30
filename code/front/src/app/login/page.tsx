"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { AuthApiError, loginWithEmailPassword } from "@/services";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-[var(--bg-canvas)] px-6 py-12 text-[var(--text-primary)]">
      <section className="mx-auto w-full max-w-[680px] pt-10 sm:pt-12">
        <div className="rounded-[2rem] bg-gradient-to-br from-[var(--brand-500)]/70 via-[var(--border-soft)] to-[var(--brand-100)] p-[2px] shadow-[0_12px_30px_rgba(18,32,22,0.09)]">
          <div className="rounded-[calc(2rem-2px)] bg-[var(--bg-canvas)] px-6 py-10 sm:px-10 sm:py-12">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#d6e5d8]">
                <BookOpen className="h-8 w-8 text-[var(--brand-500)]" strokeWidth={2.2} />
              </div>
              <h1 className="mt-5 text-center font-[var(--font-heading)] text-5xl font-bold leading-tight">Leitura</h1>
              <p className="mt-2 text-center text-xl text-[var(--text-secondary)]">Seu companheiro de leitura</p>

              <div className="mt-8 flex items-center justify-center gap-3 text-[var(--brand-100)]" aria-hidden>
                <span className="h-px w-16 bg-current" />
                <span className="text-sm">◌</span>
                <span className="h-px w-16 bg-current" />
              </div>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">E-mail</span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-13 w-full rounded-xl border border-[var(--border-soft)] bg-[#f6f8f6] px-4 text-base outline-none transition focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[rgba(31,143,58,0.18)]"
                  />
                  {errors.email ? <span className="mt-2 block text-sm text-red-700">{errors.email}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Senha</span>
                  <div className="flex h-13 items-center rounded-xl border border-[var(--border-soft)] bg-[#f6f8f6] px-4 transition focus-within:border-[var(--brand-500)] focus-within:ring-2 focus-within:ring-[rgba(31,143,58,0.18)]">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-base outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-2 text-[var(--text-secondary)]"
                      aria-label="Alternar exibicao de senha"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password ? <span className="mt-2 block text-sm text-red-700">{errors.password}</span> : null}
                </label>

                <div className="-mt-1 text-base">
                  <Link href="#" className="font-medium text-[var(--brand-500)] hover:text-[var(--brand-600)]">
                    Esqueceu sua senha?
                  </Link>
                </div>

                {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 h-13 w-full rounded-xl bg-[var(--brand-500)] text-lg font-semibold text-white transition hover:bg-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <p className="mt-10 text-center text-lg text-[var(--text-secondary)]">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-semibold text-[var(--brand-500)] hover:text-[var(--brand-600)]">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
