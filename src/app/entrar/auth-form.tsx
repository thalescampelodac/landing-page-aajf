"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  SignInState,
  signInWithGoogle,
  signInWithPassword,
} from "@/app/entrar/actions";

const initialState: SignInState = {};

type AuthFormProps = {
  isConfigured: boolean;
  next?: string;
  searchError?: string;
};

export function AuthForm({
  isConfigured,
  next = "/",
  searchError,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInWithPassword,
    initialState,
  );

  const error = state.error || getSearchErrorMessage(searchError);

  return (
    <div className="grid gap-5">
      {!isConfigured ? (
        <div className="rounded-[1rem] border border-[rgba(154,31,43,0.18)] bg-[rgba(154,31,43,0.07)] p-4 text-sm leading-7 text-[var(--color-red-deep)]">
          Supabase ainda não está configurado. Defina
          `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
          para habilitar o acesso.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[1rem] border border-[rgba(154,31,43,0.18)] bg-[rgba(154,31,43,0.07)] p-4 text-sm leading-7 text-[var(--color-red-deep)]">
          {error}
        </div>
      ) : null}

      <form action={signInWithGoogle}>
        <input name="next" type="hidden" value={next} />
        <button
          className="secondary-button w-full"
          disabled={!isConfigured}
          type="submit"
        >
          Entrar com Google
        </button>
      </form>

      <form action={formAction} className="grid gap-4">
        <input name="next" type="hidden" value={next} />

        <label className="form-field">
          <span>Email</span>
          <input
            autoComplete="email"
            disabled={!isConfigured || isPending}
            name="email"
            placeholder="voce@email.com"
            required
            type="email"
          />
        </label>

        <label className="form-field">
          <span>Senha</span>
          <input
            autoComplete="current-password"
            disabled={!isConfigured || isPending}
            name="password"
            placeholder="Sua senha"
            required
            type="password"
          />
        </label>

        <div className="flex items-center justify-end">
          <Link
            className="text-sm font-medium text-[var(--color-green-deep)] underline-offset-4 transition hover:underline"
            href="/recuperar-senha"
          >
            Esqueci minha senha
          </Link>
        </div>

        <button
          className="primary-button w-full"
          disabled={!isConfigured || isPending}
          type="submit"
        >
          {isPending ? "Entrando..." : "Entrar com email e senha"}
        </button>
      </form>
    </div>
  );
}

function getSearchErrorMessage(error?: string) {
  if (error === "supabase-not-configured") {
    return "Supabase ainda não está configurado para autenticação.";
  }

  if (error === "google-sign-in-failed") {
    return "Não foi possível iniciar o acesso com Google.";
  }

  if (error === "first-access-link-invalid") {
    return "O link de primeiro acesso ou redefinição de senha está inválido ou expirou. Solicite um novo email e abra o link mais recente.";
  }

  return undefined;
}
