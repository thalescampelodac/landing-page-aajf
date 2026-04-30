import { Suspense } from "react";
import { FirstAccessPasswordForm } from "@/components/first-access-password-form";

export default function PrimeiroAcessoPage() {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Primeiro Acesso</p>
        <h1 className="section-title mt-4 max-w-3xl">
          Defina sua senha para concluir o acesso administrativo.
        </h1>
        <p className="section-description mt-6 max-w-2xl">
          Este é o passo final do convite enviado por email. Depois de criar a
          sua senha, você poderá entrar normalmente com email e senha no portal
          administrativo.
        </p>

        <div className="mt-10 max-w-xl">
          <Suspense
            fallback={
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Validando o convite e preparando o primeiro acesso...
              </p>
            }
          >
            <FirstAccessPasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
