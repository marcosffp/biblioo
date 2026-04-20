"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components";
import { getAccessToken } from "@/services/auth";
import {
  getMyProfile,
  getProfilePreferences,
  saveProfilePreferences,
  updateMyProfile,
  updateMyVisibility,
  uploadMyAvatar,
  type ProfilePreferences,
  type UserProfileResponse,
} from "@/services/profile";

export default function EditarPerfilPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState("Usuário");
  const [username, setUsername] = React.useState("usuario");
  const [email, setEmail] = React.useState<string | null>(null);
  const [bio, setBio] = React.useState("");
  const [isPublicProfile, setIsPublicProfile] = React.useState(true);
  const [showReadingGoal, setShowReadingGoal] = React.useState(true);
  const [showDnaLiterario, setShowDnaLiterario] = React.useState(true);
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
      setLoadError("Você precisa estar logado para editar o perfil.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const profile = (await getMyProfile(accessToken)) as UserProfileResponse;
        const preferences = getProfilePreferences() as ProfilePreferences;

        if (cancelled) return;

        setUsername(profile.username);
        setDisplayName(preferences.displayName?.trim() ? preferences.displayName : profile.username);
        setEmail(profile.email ?? null);
        setBio(profile.bio ?? "");
        setIsPublicProfile(!profile.isPrivate);
        setShowReadingGoal(preferences.showReadingGoal);
        setShowDnaLiterario(preferences.showDnaLiterario);
        setAvatarUrl(profile.avatarUrl ?? null);
      } catch {
        if (cancelled) return;
        setLoadError("Não foi possível carregar seu perfil.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

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
        const uploaded = await uploadMyAvatar(avatarFile, accessToken);
        setAvatarUrl(uploaded.avatarUrl ?? null);
      }

      await updateMyProfile({ bio }, accessToken);
      await updateMyVisibility(!isPublicProfile, accessToken);
      saveProfilePreferences({
        displayName: displayName.trim() || username,
        showReadingGoal,
        showDnaLiterario,
      });

      router.push("/profile");
    } catch {
      setSaveError("Não foi possível salvar agora.");
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
              className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              aria-label="Voltar para perfil"
            >
              <ArrowLeft size={18} />
              <span>Voltar para perfil</span>
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
                  aria-label="Alterar foto do usuário"
                >
                  {avatarPreviewUrl || avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreviewUrl ?? avatarUrl ?? ""}
                      alt="Foto do usuário"
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
                    Nome de exibição
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
                  disabled={isLoading || isSaving}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="username">
                    Nome de usuário
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
          <p className="mt-1 text-sm text-gray-500">Defina se seu perfil é público ou privado.</p>
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
                <div className="text-sm font-semibold text-gray-900">Perfil público</div>
                <p className="mt-1 text-xs text-gray-500">Visível para qualquer pessoa.</p>
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
                <p className="mt-1 text-xs text-gray-500">Apenas você vê detalhes completos.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white px-8 py-6">
          <div className="text-base font-semibold text-gray-900">Visibilidade de seções no perfil</div>
          <p className="mt-1 text-sm text-gray-500">Escolha o que será exibido para quem visitar seu perfil.</p>
          <div className="mt-4 grid gap-4">
            <label className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">Meta de leitura</div>
                <p className="mt-1 text-xs text-gray-500">Mostrar ou ocultar o card de meta.</p>
              </div>
              <input
                type="checkbox"
                checked={showReadingGoal}
                onChange={(event) => setShowReadingGoal(event.target.checked)}
                disabled={isLoading || isSaving}
              />
            </label>

            <label className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">DNA literário</div>
                <p className="mt-1 text-xs text-gray-500">Mostrar ou ocultar o card de DNA literário.</p>
              </div>
              <input
                type="checkbox"
                checked={showDnaLiterario}
                onChange={(event) => setShowDnaLiterario(event.target.checked)}
                disabled={isLoading || isSaving}
              />
            </label>

          </div>
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white px-8 py-6">
          <div className="text-base font-semibold text-gray-900">Conta</div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-md border border-gray-200 bg-white px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">E-mail</div>
                <div className="mt-1 text-xs text-gray-400">{email ?? "-"}</div>
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
            <span aria-hidden>�a�</span>
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

