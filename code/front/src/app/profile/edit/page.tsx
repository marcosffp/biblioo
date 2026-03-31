"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { AppShell } from "@/components";
import { getAccessToken } from "@/services/auth";

type UserProfileResponse = {
  id: number;
  username: string;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isPrivate: boolean;
  restricted: boolean;
  createdAt?: string | null;
};

export default function EditarPerfilPage() {
  const router = useRouter();

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

  const [displayName, setDisplayName] = React.useState("Usuario");
  const [username, setUsername] = React.useState("usuario");
  const [bio, setBio] = React.useState("");
  const [isPublicProfile, setIsPublicProfile] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  const DISPLAY_NAME_MAX = 50;
  const USERNAME_MAX = 30;
  const BIO_MAX = 160;

  React.useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsLoading(false);
      setLoadError("Voce precisa estar logado para editar o perfil.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("load_me_failed");
        }

        const profile = (await response.json()) as UserProfileResponse;

        if (cancelled) return;

        setUsername(profile.username);
        setDisplayName(profile.username);
        setBio(profile.bio ?? "");
        setIsPublicProfile(!profile.isPrivate);
        setAvatarUrl(profile.avatarUrl ?? null);
      } catch {
        if (cancelled) return;
        setLoadError("Nao foi possivel carregar seu perfil.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL]);

  React.useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(file);
    setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("missing_access_token");
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const avatarResponse = await fetch(`${API_BASE_URL}/users/me/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });

        if (!avatarResponse.ok) {
          throw new Error("avatar_upload_failed");
        }
      }

      const updateProfileResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (!updateProfileResponse.ok) {
        throw new Error("update_profile_failed");
      }

      const visibilityResponse = await fetch(`${API_BASE_URL}/users/me/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isPrivate: !isPublicProfile }),
      });

      if (!visibilityResponse.ok) {
        throw new Error("visibility_request_failed");
      }

      router.push("/profile");
    } catch (error) {
      setSaveError("Nao foi possivel salvar agora.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-[860px] mx-auto">
        <header className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-md px-2 py-2 text-gray-700 hover:bg-gray-100"
              aria-label="Voltar"
            >
              <span aria-hidden className="text-lg">←</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Editar perfil</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm font-semibold text-gray-500 hover:text-gray-700">
              Cancelar
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? "Salvando" : "Salvar"}
            </button>
          </div>
        </header>

        {loadError ? <p className="mt-2 text-sm text-red-600">{loadError}</p> : null}
        {saveError ? <p className="mt-2 text-sm text-red-600">{saveError}</p> : null}

        <section className="mt-4 rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="relative h-40 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white">
            <div className="absolute -bottom-7 left-8">
              <div className="relative">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isSaving || isLoading}
                />

                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={isSaving || isLoading}
                  className="group relative h-16 w-16 rounded-full border-4 border-white bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-md overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Alterar foto do usuario"
                >
                  {avatarPreviewUrl || avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreviewUrl ?? avatarUrl ?? ""}
                      alt="Foto do usuario"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>U</span>
                  )}

                  <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Editar
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="px-8 pt-10 pb-8">
            <div className="grid gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="displayName">
                    Nome de exibicao
                  </label>
                  <span className="text-xs text-gray-400">
                    {Math.min(displayName.length, DISPLAY_NAME_MAX)}/{DISPLAY_NAME_MAX}
                  </span>
                </div>
                <input
                  id="displayName"
                  className="mt-2 h-11 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value.slice(0, DISPLAY_NAME_MAX))}
                  disabled
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="username">
                    Nome de usuario
                  </label>
                  <span className="text-xs text-gray-400">
                    {Math.min(username.length, USERNAME_MAX)}/{USERNAME_MAX}
                  </span>
                </div>
                <div className="mt-2 flex items-center rounded-md border border-gray-200 bg-white">
                  <span className="px-3 text-sm text-gray-400">@</span>
                  <input
                    id="username"
                    className="h-11 w-full rounded-md px-1 pr-3 text-sm text-gray-900 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value.slice(0, USERNAME_MAX))}
                    disabled
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="bio">
                    Bio
                  </label>
                  <span className="text-xs text-gray-400">
                    {Math.min(bio.length, BIO_MAX)}/{BIO_MAX}
                  </span>
                </div>
                <textarea
                  id="bio"
                  className="mt-2 min-h-[120px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX))}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white px-8 py-6">
          <div className="text-base font-semibold text-gray-900">Visibilidade</div>
          <p className="mt-1 text-sm text-gray-500">Defina se seu perfil e publico ou privado.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4">
              <input
                type="radio"
                name="profile-visibility"
                className="mt-1"
                checked={isPublicProfile}
                onChange={() => setIsPublicProfile(true)}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Perfil publico</div>
                <p className="mt-1 text-xs text-gray-500">Visivel para qualquer pessoa.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4">
              <input
                type="radio"
                name="profile-visibility"
                className="mt-1"
                checked={!isPublicProfile}
                onChange={() => setIsPublicProfile(false)}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Perfil privado</div>
                <p className="mt-1 text-xs text-gray-500">Apenas voce ve detalhes completos.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white px-8 py-6">
          <div className="text-base font-semibold text-gray-900">Conta</div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-md border border-gray-200 bg-white px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Email</div>
                <div className="mt-1 text-xs text-gray-400">usuario@email.com</div>
              </div>
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Alterar
              </button>
            </div>

            <div className="rounded-md border border-gray-200 bg-white px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Senha</div>
                <div className="mt-1 text-xs text-gray-400">••••••••</div>
              </div>
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Alterar
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-red-200 bg-white px-8 py-6">
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <span aria-hidden>⚠</span>
            <span>Zona de perigo</span>
          </div>
          <button
            type="button"
            className="mt-4 rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Excluir conta
          </button>
        </section>
      </div>
    </AppShell>
  );
}
