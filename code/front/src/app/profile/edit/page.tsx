"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { AppShell } from "@/components";

export default function EditarPerfilPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState("Usuario");
  const [username, setUsername] = React.useState("usuario");
  const [bio, setBio] = React.useState(
    "Leitor apaixonado por literatura brasileira. Sempre em busca de novos mundos entre paginas."
  );
  const [isPublicProfile, setIsPublicProfile] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const DISPLAY_NAME_MAX = 50;
  const USERNAME_MAX = 30;
  const BIO_MAX = 160;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const visibilityResponse = await fetch("/users/me/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

        {saveError ? <p className="mt-2 text-sm text-red-600">{saveError}</p> : null}

        <section className="mt-4 rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="relative h-40 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white">
            <div className="absolute -bottom-7 left-8">
              <div className="h-16 w-16 rounded-full border-4 border-white bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                U
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
                  className="mt-2 h-11 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value.slice(0, DISPLAY_NAME_MAX))}
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
                    className="h-11 w-full rounded-md px-1 pr-3 text-sm text-gray-900 outline-none"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value.slice(0, USERNAME_MAX))}
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
                  className="mt-2 min-h-[120px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX))}
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
