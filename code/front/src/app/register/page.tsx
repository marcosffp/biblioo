"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, UserPlus } from "lucide-react";
import { AuthApiError, registerWithEmailPassword } from "@/services";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!normalizedUsername) {
      nextErrors.username = "Nome de usuario obrigatorio";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
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
      if (error instanceof AuthApiError && error.code === "EMAIL_IN_USE") {
        setFormError("Esse email ja esta em uso.");
      } else if (error instanceof AuthApiError && error.code === "USERNAME_IN_USE") {
        setFormError("Esse nome de usuario ja esta em uso.");
      } else if (error instanceof AuthApiError && error.code === "VALIDATION") {
        setFormError("Dados invalidos. Revise os campos e tente novamente.");
      } else if (error instanceof AuthApiError && error.code === "NETWORK") {
        setFormError("Falha de comunicacao com o servidor.");
      } else {
        setFormError("Nao foi possivel criar sua conta. Tente novamente.");
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
              <h1 className="mt-5 text-center font-[var(--font-heading)] text-5xl font-bold leading-tight">Cadastro</h1>
              <p className="mt-2 text-center text-xl text-[var(--text-secondary)]">Crie sua conta e comece a ler</p>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Nome de usuario</span>
                  <input
                    type="text"
                    placeholder="leitor_123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-full rounded-2xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-4 text-[15px] font-medium text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition placeholder:text-[#8aa08d] focus:border-[var(--brand-500)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,143,58,0.14)]"
                  />
                  {errors.username ? <span className="mt-2 block text-sm text-red-700">{errors.username}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">E-mail</span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-full rounded-2xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-4 text-[15px] font-medium text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition placeholder:text-[#8aa08d] focus:border-[var(--brand-500)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,143,58,0.14)]"
                  />
                  {errors.email ? <span className="mt-2 block text-sm text-red-700">{errors.email}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Senha</span>
                  <div className="flex h-14 items-center rounded-2xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-[var(--brand-500)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(31,143,58,0.14)]">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[#8aa08d] focus-visible:shadow-none"
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

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Confirmar senha</span>
                  <div className="flex h-14 items-center rounded-2xl border border-[#c2d7c5] bg-gradient-to-b from-[#fbfdfb] to-[#eef5ef] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus-within:border-[var(--brand-500)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(31,143,58,0.14)]">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[#8aa08d] focus-visible:shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="ml-2 rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[#e6efe7]"
                      aria-label="Alternar exibicao da confirmacao de senha"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword ? <span className="mt-2 block text-sm text-red-700">{errors.confirmPassword}</span> : null}
                </label>

                {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-14 w-full rounded-2xl bg-gradient-to-r from-[var(--brand-500)] via-[#238f40] to-[var(--brand-600)] text-[1.06rem] font-semibold tracking-[0.01em] text-white shadow-[0_10px_20px_rgba(23,117,47,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(23,117,47,0.34)] focus-visible:shadow-[0_0_0_4px_rgba(31,143,58,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <span>{isLoading ? "Criando conta..." : "Criar conta"}</span>
                    <UserPlus size={18} aria-hidden />
                  </span>
                </button>
              </form>

              <p className="mt-10 text-center text-lg text-[var(--text-secondary)]">
                Ja possui uma conta?{" "}
                <Link href="/login" className="font-semibold text-[var(--brand-500)] hover:text-[var(--brand-600)]">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
