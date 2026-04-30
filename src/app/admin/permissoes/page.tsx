import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { getAdminAccess } from "@/lib/supabase/access";

export default async function AdminPermissoesPage() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin/permissoes");
  }

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription="Este módulo fica reservado para papéis administrativos, níveis de acesso e governança da operação interna."
      authorizedTitle="Permissões e papéis da administração"
    >
      <div className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
        <p className="section-eyebrow">Base do modelo</p>
        <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
          Administração preparada para validação por papel
        </h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-green-deep)]">
          O acesso administrativo já é validado via banco de dados. O próximo
          passo será expandir isso para regras mais detalhadas por função,
          escopo de ação e auditoria de concessões.
        </p>
      </div>
    </AdminAccessPanel>
  );
}
