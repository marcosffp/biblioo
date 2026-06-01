"use client";

import { Check, X } from "lucide-react";

const RULES = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Caractere especial (!@#$%...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
] as const;

export function checkPasswordRules(password: string) {
  return RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
}

export function isPasswordValid(password: string): boolean {
  return RULES.every((rule) => rule.test(password));
}

interface PasswordStrengthChecklistProps {
  password: string;
}

export function PasswordStrengthChecklist({ password }: Readonly<PasswordStrengthChecklistProps>) {
  if (!password) return null;

  const results = checkPasswordRules(password);

  return (
    <ul className="mt-2 space-y-1.5" aria-label="Requisitos de senha">
      {results.map(({ label, met }) => (
        <li
          key={label}
          className={`flex items-center gap-2 text-sm transition-colors duration-150 ${
            met ? "text-emerald-600" : "text-[var(--text-secondary)]"
          }`}
        >
          {met ? (
            <Check size={14} className="shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <X size={14} className="shrink-0 text-rose-400" aria-hidden />
          )}
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export default PasswordStrengthChecklist;
