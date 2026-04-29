import { AuthForm } from "@/app/entrar/auth-form";
import { signOut } from "@/app/entrar/actions";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type EntrarPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const params = await searchParams;
  const isConfigured = isSupabaseConfigured();
  const user = await getCurrentUser();

  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="highlight-card rounded-[2rem] p-8 text-[var(--color-paper)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--color-gold-strong)]">
            Acesso
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-6xl">
            Entre com Google ou email e senha.
          </h1>
          <p className="mt-5 text-sm leading-7 text-[rgba(255,247,236,0.86)]">
            O login confirma a identidade. Perfis e permissões continuam sendo
            concedidos pela administração, conforme o modelo técnico aprovado.
          </p>
        </article>

        <article className="soft-card rounded-[2rem] p-8 sm:p-10">
          {user ? (
            <div className="grid gap-5">
              <p className="section-eyebrow">Sessão ativa</p>
              <h2 className="section-title mt-1">Você já está autenticado.</h2>
              <p className="section-description">
                Email conectado: {user.email}
              </p>
              <form action={signOut}>
                <button className="secondary-button" type="submit">
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <div>
              <p className="section-eyebrow">Entrar</p>
              <h2 className="section-title mt-4">Acesse sua conta.</h2>
              <p className="section-description mt-5">
                Use uma conta autorizada. O cadastro livre será tratado apenas no
                fluxo de apoiadores.
              </p>
              <div className="mt-8">
                <AuthForm
                  isConfigured={isConfigured}
                  searchError={params?.error}
                />
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
