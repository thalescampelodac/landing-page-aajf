import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { AdminPermissionsManager } from "@/components/admin-permissions-manager";
import {
  getAdminPermissionsData,
  type AdminPermissionsData,
} from "@/lib/supabase/admin-permissions";

export default async function AdminPermissoesPage() {
  const data = await getAdminPermissionsData();
  const { access } = data;

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin/permissoes");
  }

  const authorizedData = isAuthorizedAdminPermissionsData(data) ? data : null;

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription="Este módulo agora permite visualizar acessos administrativos, conceder papéis para perfis já existentes e preparar grants por email para novos administradores."
      authorizedTitle="Permissões e papéis da administração"
    >
      {authorizedData ? (
        <AdminPermissionsManager
          bootstrapGrants={authorizedData.bootstrapGrants}
          currentAdminProfileId={authorizedData.access.profileId}
          currentAdminRole={authorizedData.access.role}
          eligibleProfiles={authorizedData.eligibleProfiles}
          memberships={authorizedData.memberships}
        />
      ) : null}
    </AdminAccessPanel>
  );
}

function isAuthorizedAdminPermissionsData(
  data: AdminPermissionsData,
): data is Extract<AdminPermissionsData, { access: { status: "authorized" } }> {
  return data.access.status === "authorized";
}
