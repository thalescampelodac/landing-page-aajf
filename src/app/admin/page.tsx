import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/supabase/access";

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin");
  }

  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Área Administrativa</p>

        {access.status === "authorized" ? (
          <>
            <h1 className="section-title mt-4 max-w-3xl">
              Bem-vindo à administração.
            </h1>
            <p className="section-description mt-6 max-w-2xl">
              Seu acesso administrativo está ativo como {access.role}. Esta
              área será a base para gerir associados, status e permissões.
            </p>
            {access.email ? (
              <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
                Conta conectada: {access.email}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h1 className="section-title mt-4 max-w-3xl">
              Acesso administrativo não autorizado.
            </h1>
            <p className="section-description mt-6 max-w-2xl">
              O login confirma sua identidade, mas a permissão administrativa
              precisa estar concedida no banco de dados pela associação.
            </p>
            {access.status === "unconfigured" ? (
              <p className="mt-5 text-base font-medium text-[var(--color-red-deep)]">
                Supabase ainda não está configurado neste ambiente.
              </p>
            ) : null}
            {access.status === "denied" && access.email ? (
              <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
                Conta conectada: {access.email}
              </p>
            ) : null}
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="primary-button" href="/">
            Voltar para a pagina inicial
          </Link>
          {access.status === "authorized" ? null : (
            <Link className="secondary-button" href="/entrar?next=/admin">
              Entrar com outra conta
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
