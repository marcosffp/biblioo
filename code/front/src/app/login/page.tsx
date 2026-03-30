"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Eye, EyeOff } from "lucide-react";
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
    <main className="min-h-screen bg-[var(--bg-canvas)] px-5 py-10 text-[var(--text-primary)]">
      <section className="mx-auto w-full max-w-[620px] pt-8 sm:pt-10">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-500)]/70 via-[var(--border-soft)] to-[var(--brand-100)] p-[2px] shadow-[0_10px_24px_rgba(18,32,22,0.08)]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[var(--bg-canvas)] px-5 py-8 sm:px-8 sm:py-9">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="mx-auto flex items-center justify-center gap-2 text-[var(--brand-500)]">
                <BookOpen className="h-7 w-7" strokeWidth={2.2} />
                <span className="font-[var(--font-heading)] text-[1.85rem] font-semibold leading-none text-[#24414a]">Biblioo</span>
              </div>
              <h1 className="mt-6 text-center font-[var(--font-heading)] text-[2.2rem] font-bold leading-tight text-[#24414a] sm:text-[2.4rem]">Bem-vindo de volta</h1>
              <p className="mt-2 text-center text-[1.2rem] leading-tight text-[var(--text-secondary)] sm:text-[1.3rem]">Entre para continuar sua jornada literária</p>

              <div className="mt-6 flex items-center justify-center gap-3 text-[var(--brand-100)]" aria-hidden>
                <span className="h-px w-12 bg-current" />
                <span className="text-sm">◌</span>
                <span className="h-px w-12 bg-current" />
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">E-mail</span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-3.5 text-sm font-medium text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition placeholder:text-[#8aa08d] focus:border-[var(--brand-500)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,143,58,0.14)]"
                  />
                  {errors.email ? <span className="mt-2 block text-sm text-red-700">{errors.email}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Senha</span>
                  <div className="flex h-12 items-center rounded-xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-[var(--brand-500)] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(31,143,58,0.14)]">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[#8aa08d] focus-visible:shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-2 rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[#e6efe7]"
                      aria-label="Alternar exibicao de senha"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password ? <span className="mt-2 block text-sm text-red-700">{errors.password}</span> : null}
                </label>

                <div className="-mt-0.5 text-sm">
                  <Link href="#" className="font-medium text-[var(--brand-500)] hover:text-[var(--brand-600)]">
                    Esqueceu sua senha?
                  </Link>
                </div>

                {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1.5 h-12 w-full rounded-xl bg-gradient-to-r from-[var(--brand-500)] via-[#238f40] to-[var(--brand-600)] text-[0.97rem] font-semibold tracking-[0.01em] text-white shadow-[0_8px_16px_rgba(23,117,47,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(23,117,47,0.3)] focus-visible:shadow-[0_0_0_3px_rgba(31,143,58,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <span>{isLoading ? "Entrando..." : "Entrar"}</span>
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </button>
              </form>

              <p className="mt-8 text-center text-base text-[var(--text-secondary)]">
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
