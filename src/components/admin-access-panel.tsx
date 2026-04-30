import Link from "next/link";
import { signOut } from "@/app/entrar/actions";
import type { AdminAccess } from "@/lib/supabase/access";

type AdminAccessPanelProps = {
  access: AdminAccess;
  authorizedDescription: string;
  authorizedTitle: string;
  children?: React.ReactNode;
};

export function AdminAccessPanel({
  access,
  authorizedDescription,
  authorizedTitle,
  children,
}: AdminAccessPanelProps) {
  return (
    <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
      {access.status === "authorized" ? (
        <>
          <p className="section-eyebrow">Módulo Administrativo</p>
          <h2 className="section-title mt-4 max-w-3xl">{authorizedTitle}</h2>
          <p className="section-description mt-6 max-w-2xl">
            {authorizedDescription}
          </p>
          {access.email ? (
            <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
              Conta conectada: {access.email}
            </p>
          ) : null}
          {children ? <div className="mt-10">{children}</div> : null}
        </>
      ) : (
        <>
          <p className="section-eyebrow">Controle de Acesso</p>
          <h2 className="section-title mt-4 max-w-3xl">
            Acesso administrativo não autorizado.
          </h2>
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
        {access.status === "authorized" ||
        (access.status === "denied" && access.email) ? (
          <form action={signOut}>
            <button className="secondary-button" type="submit">
              Sair da conta
            </button>
          </form>
        ) : null}
        {access.status === "authorized" ? null : (
          <Link className="secondary-button" href="/entrar?next=/admin">
            Entrar com outra conta
          </Link>
        )}
      </div>
    </section>
  );
}
