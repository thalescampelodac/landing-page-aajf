import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { AdminAssociatesManager } from "@/components/admin-associates-manager";
import {
  getAdminAssociatesData,
  type AdminAssociatesData,
} from "@/lib/supabase/admin-associates";

export default async function AdminAssociadosPage() {
  try {
    const data = await getAdminAssociatesData();
    const { access } = data;

    if (access.status === "unauthenticated") {
      redirect("/entrar?next=/admin/associados");
    }

    const authorizedData = isAuthorizedAdminAssociatesData(data) ? data : null;

    return (
      <AdminAccessPanel
        access={access}
        authorizedDescription="Este módulo agora concede vínculo de associado, permite revisar status e cria a ponte operacional com a área do associado e a ficha cadastral persistida."
        authorizedTitle="Gestão de associados e ficha cadastral"
      >
      {authorizedData ? (
        <AdminAssociatesManager
          bootstrapGrants={authorizedData.bootstrapGrants}
          memberships={authorizedData.memberships}
        />
      ) : null}
      </AdminAccessPanel>
    );
  } catch (error) {
    return (
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Gestão de associados</p>
        <h1 className="section-title mt-4 max-w-3xl">
          O módulo ainda não conseguiu acessar as tabelas novas da ficha cadastral.
        </h1>
        <p className="section-description mt-6 max-w-2xl">
          Isso costuma acontecer quando a migration da `#8` ainda não foi aplicada
          no Supabase ou quando as permissões/grants dessa migration ainda não
          entraram em vigor no ambiente atual.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[rgba(154,31,43,0.12)] bg-[rgba(255,250,243,0.74)] p-5">
          <p className="text-sm font-medium text-[var(--color-red-deep)]">
            {getErrorMessage(error)}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-green-deep)]">
            Verifique principalmente a migration
            `20260503113000_associate_profiles.sql`, que cria `aajf.associate_profiles`
            e `aajf.associate_dependents` com RLS e grants para `authenticated`.
          </p>
        </div>
      </section>
    );
  }
}

function isAuthorizedAdminAssociatesData(
  data: AdminAssociatesData,
): data is Extract<AdminAssociatesData, { access: { status: "authorized" } }> {
  return data.access.status === "authorized";
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Nao foi possível carregar os dados administrativos de associados.";
}
