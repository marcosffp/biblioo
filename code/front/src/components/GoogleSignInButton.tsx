"use client";

import { useCallback } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApiError, loginWithGoogle } from "@/services/auth";

type GoogleSignInButtonProps = {
  onError?: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  defaultRedirect?: string;
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export function GoogleSignInButton({ onError, onLoadingChange, defaultRedirect = "/feed" }: Readonly<GoogleSignInButtonProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCredential = useCallback(
    async (credentialResponse: { credential?: string }) => {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        onError?.("Não foi possível obter o token do Google.");
        return;
      }
      onLoadingChange?.(true);
      try {
        await loginWithGoogle(idToken);
        router.push(searchParams.get("next") ?? defaultRedirect);
      } catch (error) {
        onError?.(
          error instanceof AuthApiError && error.code === "NETWORK"
            ? "Falha de comunicação com o servidor."
            : "Não foi possível entrar com o Google. Tente novamente."
        );
      } finally {
        onLoadingChange?.(false);
      }
    },
    [onError, onLoadingChange, router, searchParams, defaultRedirect]
  );

  return (
    /*
     * The GoogleLogin iframe handles auth (postMessage-based, COOP-safe).
     * Our visual button sits on top with pointer-events:none so clicks
     * pass through to the iframe underneath.
     */
    <div className="relative h-12 w-full cursor-pointer overflow-hidden rounded-[var(--radius-md)]">
      {/* Google's invisible iframe — covers the whole button, handles clicks */}
      <div className="absolute inset-0 [&>div]:!h-full [&>div>div]:!h-full [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-w-none">
        <GoogleLogin
          width={800}
          size="large"
          shape="rectangular"
          theme="outline"
          onSuccess={handleCredential}
          onError={() => onError?.("Não foi possível iniciar o login com o Google.")}
        />
      </div>

      {/* Visual button — no pointer events, painted on top */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-border bg-card text-sm font-semibold text-[var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--text-secondary)] hover:shadow-card">
        <GoogleIcon />
        Continuar com Google
      </div>
    </div>
  );
}
