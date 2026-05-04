import Link from "next/link";
import { redirect } from "next/navigation";
import { AssociateAreaManager } from "@/components/associate-area-manager";
import type { AssociateAreaData } from "@/lib/supabase/associate-profile-shared";
import { getAssociateAreaData } from "@/lib/supabase/associate-profile";

export default async function AssociadoPage() {
  const data = await getAssociateAreaData();

  if (data.access.status === "unauthenticated") {
    redirect("/entrar?next=/associado");
  }

  if (isAuthorizedAssociateAreaData(data)) {
    return (
      <main className="section-shell flex-1 pb-16 pt-8">
        <AssociateAreaManager
          authMethods={data.authMethods}
          profile={data.profile}
        />
      </main>
    );
  }

  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <AssociateAccessFallback access={data.access} />
    </main>
  );
}

function AssociateAccessFallback({
  access,
}: {
  access: Exclude<AssociateAreaData["access"], { status: "authorized" }>;
}) {
  return (
    <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
      <p className="section-eyebrow">Área do Associado</p>
      <h1 className="section-title mt-4 max-w-3xl">
        Seu acesso de associado ainda não está liberado.
      </h1>
      <p className="section-description mt-6 max-w-2xl">
        O login confirma sua identidade, mas a entrada nesta área depende de um
        vínculo ativo de associado concedido pela associação.
      </p>

      {access.status === "unconfigured" ? (
        <p className="mt-5 text-base font-medium text-[var(--color-red-deep)]">
          Supabase ainda não está configurado neste ambiente.
        </p>
      ) : null}

      {access.status === "denied" && access.membershipStatus ? (
        <p className="mt-5 text-base font-medium text-[var(--color-red-deep)]">
          Sua conta existe, mas o vínculo de associado está atualmente como{" "}
          {access.membershipStatus}.
        </p>
      ) : null}

      {access.status === "denied" && !access.membershipStatus ? (
        <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
          Ainda não encontramos um vínculo de associado para esta conta.
        </p>
      ) : null}

      {access.status === "denied" && access.email ? (
        <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
          Conta conectada: {access.email}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link className="primary-button" href="/">
          Voltar para a pagina inicial
        </Link>
        <Link className="secondary-button" href="/entrar?next=/associado">
          Entrar com outra conta
        </Link>
      </div>
    </section>
  );
}

function isAuthorizedAssociateAreaData(
  data: AssociateAreaData,
): data is Extract<AssociateAreaData, { access: { status: "authorized" } }> {
  return data.access.status === "authorized";
}
