import { redirect } from "next/navigation";
import { AdminAccessPanel } from "@/components/admin-access-panel";
import { getAdminAccess } from "@/lib/supabase/access";

export default async function AdminComunicadosPage() {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/entrar?next=/admin/comunicados");
  }

  return (
    <AdminAccessPanel
      access={access}
      authorizedDescription="Este módulo organiza o espaço futuro para avisos internos, publicações administrativas e comunicação com associados."
      authorizedTitle="Comunicados e publicações internas"
    >
      <div className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
        <p className="section-eyebrow">Módulo futuro</p>
        <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
          Um espaço para operar a comunicação da associação
        </h3>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-green-deep)]">
          Aqui vamos concentrar os fluxos futuros de comunicados, avisos e
          publicações que precisarem de uma camada administrativa antes de
          chegarem às áreas públicas ou restritas.
        </p>
      </div>
    </AdminAccessPanel>
  );
}
