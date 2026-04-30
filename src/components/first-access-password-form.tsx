"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function FirstAccessPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next") || "/admin");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    let mounted = true;

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setIsReady(Boolean(data.session));
      setIsSessionLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setIsReady(Boolean(session));
      setIsSessionLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setError(null);
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    startTransition(() => {
      router.replace(next);
      router.refresh();
    });
  }

  if (isSessionLoading) {
    return (
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        Validando o convite e preparando o primeiro acesso...
      </p>
    );
  }

  if (!isReady) {
    return (
      <p className="text-sm leading-7 text-[var(--color-red-deep)]">
        Não encontramos uma sessão válida de convite. Abra novamente o link
        enviado por email para definir sua senha.
      </p>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Nova senha</span>
        <input
          autoComplete="new-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>

      <label className="form-field">
        <span>Confirmar senha</span>
        <input
          autoComplete="new-password"
          name="passwordConfirmation"
          onChange={(event) => setConfirmation(event.target.value)}
          type="password"
          value={confirmation}
        />
      </label>

      {error ? (
        <p className="text-sm font-medium text-[var(--color-red-deep)]">{error}</p>
      ) : (
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          Depois de salvar a senha, o acesso seguirá normalmente com email e
          senha. Se você já usava Google antes, esta etapa ainda é necessária
          para habilitar o login por senha.
        </p>
      )}

      <button className="primary-button" disabled={isSaving} type="submit">
        {isSaving ? "Salvando..." : "Definir senha e concluir acesso"}
      </button>
    </form>
  );
}

function getSafeNextPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/admin";
  }

  return next;
}
