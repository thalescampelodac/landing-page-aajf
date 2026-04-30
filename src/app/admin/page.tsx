import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { getAdminAccess } from "@/lib/supabase/access";

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin");
  }

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription={`Seu acesso administrativo está ativo como ${access.status === "authorized" ? access.role : "administrador"}. Esta área agora funciona como hub inicial para gerir associados, status, permissões e comunicação interna.`}
      authorizedTitle="Bem-vindo à administração."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6 transition hover:-translate-y-0.5"
            href="/admin/associados"
          >
            <p className="section-eyebrow">Módulo</p>
            <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
              Associados e status
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
              Preparado para concessão de acesso, leitura de vínculo e gestão
              do estado de cada associado.
            </p>
          </Link>

          <Link
            className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6 transition hover:-translate-y-0.5"
            href="/admin/permissoes"
          >
            <p className="section-eyebrow">Módulo</p>
            <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
              Permissões
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
              Reservado para papéis administrativos, regras de governança e
              expansão da autorização por perfil.
            </p>
          </Link>
        </div>

        <aside className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-[rgba(255,248,239,0.82)] p-6">
          <p className="section-eyebrow">Estado Inicial</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Painel pronto para expansão
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            A área administrativa já possui ponto de entrada dedicado,
            navegação interna e contexto para receber os próximos módulos do
            sistema sem depender da landing page pública.
          </p>
        </aside>
      </div>
    </AdminAccessPanel>
  );
}
