import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { getAdminAccess } from "@/lib/supabase/access";

export default async function AdminAssociadosPage() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin/associados");
  }

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription="Este módulo prepara a futura gestão de associados, concessão de acesso, leitura de status e vínculo com a área do associado."
      authorizedTitle="Gestão de associados e status"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Próximo passo</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Concessão de acesso
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            O objetivo aqui é permitir que a administração conceda e revise o
            acesso de associados com base no cadastro interno da associação.
          </p>
        </article>

        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Próximo passo</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Status do vínculo
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            A estrutura administrativa já reserva espaço para controlar estados
            como ativo, inativo e suspenso antes da implementação final.
          </p>
        </article>
      </div>
    </AdminAccessPanel>
  );
}
