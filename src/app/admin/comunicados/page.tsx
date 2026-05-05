import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { AdminPublicationsManager } from "@/components/admin-publications-manager";
import {
  getAdminPublicationsData,
  type AdminPublicationsData,
} from "@/lib/supabase/admin-publications";

export default async function AdminComunicadosPage() {
  const result = await loadAdminPublicationsResult();

  if ("error" in result) {
    return <AdminPublicationsLoadError error={result.error} />;
  }

  const { data } = result;
  const { access } = data;

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin/comunicados");
  }

  const authorizedData = isAuthorizedAdminPublicationsData(data) ? data : null;

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription=""
      authorizedTitle="Publicações e notícias"
    >
      {authorizedData ? (
        <AdminPublicationsManager publications={authorizedData.publications} />
      ) : null}
    </AdminAccessPanel>
  );
}

function isAuthorizedAdminPublicationsData(
  data: AdminPublicationsData,
): data is Extract<AdminPublicationsData, { access: { status: "authorized" } }> {
  return data.access.status === "authorized";
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível carregar os dados administrativos das publicações.";
}

async function loadAdminPublicationsResult() {
  try {
    const data = await getAdminPublicationsData();
    return { data } as const;
  } catch (error) {
    return { error } as const;
  }
}

function AdminPublicationsLoadError({ error }: { error: unknown }) {
  return (
    <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
      <p className="section-eyebrow">Publicações e notícias</p>
      <h1 className="section-title mt-4 max-w-3xl">
        O módulo ainda não conseguiu acessar o acervo editorial.
      </h1>
      <p className="section-description mt-6 max-w-2xl">
        Isso costuma acontecer quando a migration da tabela de publicações ainda
        não foi aplicada no Supabase, ou quando as permissões dessa tabela ainda
        não entraram em vigor no ambiente atual.
      </p>

      <div className="mt-8 rounded-[1.5rem] border border-[rgba(154,31,43,0.12)] bg-[rgba(255,250,243,0.74)] p-5">
        <p className="text-sm font-medium text-[var(--color-red-deep)]">
          {getErrorMessage(error)}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-green-deep)]">
          Verifique principalmente a migration
          `20260504164000_create_publications.sql`, que cria `aajf.publications`
          com RLS, policies administrativas e grants para `anon` e
          `authenticated`.
        </p>
      </div>
    </section>
  );
}
