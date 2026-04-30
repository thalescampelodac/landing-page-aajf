"use client";

import { useActionState } from "react";
import {
  createAdminBootstrapGrant,
  grantAdminAccess,
  type AdminPermissionsActionState,
  updateAdminBootstrapGrant,
  updateAdminMembership,
} from "@/app/admin/permissoes/actions";
import type {
  AdminBootstrapGrantRecord,
  AdminMembershipRecord,
  EligibleAdminProfileRecord,
} from "@/lib/supabase/admin-permissions";

const initialState: AdminPermissionsActionState = {};

type AdminPermissionsManagerProps = {
  bootstrapGrants: AdminBootstrapGrantRecord[];
  eligibleProfiles: EligibleAdminProfileRecord[];
  memberships: AdminMembershipRecord[];
};

export function AdminPermissionsManager({
  bootstrapGrants,
  eligibleProfiles,
  memberships,
}: AdminPermissionsManagerProps) {
  const [grantAccessState, grantAccessAction, isGrantingAccess] = useActionState(
    grantAdminAccess,
    initialState,
  );
  const [bootstrapState, bootstrapAction, isCreatingBootstrap] = useActionState(
    createAdminBootstrapGrant,
    initialState,
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Acessos atuais</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Quem já pode operar a administração
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Os registros abaixo já possuem perfil autenticado no sistema e
            podem ter papel e status alterados diretamente.
          </p>

          <div className="mt-6 grid gap-4">
            {memberships.length ? (
              memberships.map((membership) => (
                <AdminMembershipRow key={membership.id} membership={membership} />
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Nenhum acesso administrativo ativo ou histórico foi encontrado.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-[rgba(255,248,239,0.82)] p-6">
          <p className="section-eyebrow">Promover perfil existente</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Conceder acesso a quem já entrou no sistema
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Use este fluxo quando a pessoa já entrou no sistema e já possui
            perfil em `aajf.profiles`. Para novos administradores que ainda não
            entraram, use o convite por email no bloco ao lado.
          </p>

          <form action={grantAccessAction} className="mt-6 grid gap-4">
            <label className="form-field">
              <span>Perfil existente</span>
              <select
                className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                defaultValue=""
                name="profileId"
              >
                <option value="" disabled>
                  Selecione um perfil
                </option>
                {eligibleProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.fullName ? `${profile.fullName} - ` : ""}
                    {profile.email}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-field">
                <span>Papel</span>
                <select
                  className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                  defaultValue="admin"
                  name="role"
                >
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </label>

              <label className="form-field">
                <span>Status</span>
                <select
                  className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                  defaultValue="active"
                  name="status"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="suspended">suspended</option>
                </select>
              </label>
            </div>

            <ActionFeedback state={grantAccessState} />

            <button className="primary-button" disabled={isGrantingAccess} type="submit">
              {isGrantingAccess ? "Salvando..." : "Conceder acesso"}
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Convites por email</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Quem vai receber o primeiro acesso por email
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Esta lista usa `admin_bootstrap_grants` para preparar autorização
            antecipada e registrar quem ainda deve concluir o primeiro acesso.
          </p>

          <div className="mt-6 grid gap-4">
            {bootstrapGrants.length ? (
              bootstrapGrants.map((grant) => (
                <AdminBootstrapGrantRow key={grant.id} grant={grant} />
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Nenhum grant administrativo foi registrado até agora.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-[rgba(255,248,239,0.82)] p-6">
          <p className="section-eyebrow">Convidar novo administrador</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Enviar convite para primeiro acesso
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Use este fluxo quando a pessoa ainda não entrou no sistema. O email
            será autorizado e o Supabase enviará o convite para que ela defina
            a própria senha no primeiro acesso.
          </p>

          <form action={bootstrapAction} className="mt-6 grid gap-4">
            <label className="form-field">
              <span>Email</span>
              <input name="email" placeholder="pessoa@email.com" type="email" />
            </label>

            <label className="form-field">
              <span>Papel inicial</span>
              <select
                className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                defaultValue="admin"
                name="role"
              >
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
            </label>

            <label className="form-field">
              <span>Observações</span>
              <textarea
                className="min-h-28"
                name="notes"
                placeholder="Contexto da autorização, área responsável ou observação interna."
              />
            </label>

            <ActionFeedback state={bootstrapState} />

            <button
              className="primary-button"
              disabled={isCreatingBootstrap}
              type="submit"
            >
              {isCreatingBootstrap ? "Salvando..." : "Autorizar e enviar convite"}
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}

function AdminMembershipRow({
  membership,
}: {
  membership: AdminMembershipRecord;
}) {
  const [state, action, isPending] = useActionState(
    updateAdminMembership,
    initialState,
  );

  return (
    <form
      action={action}
      className="rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,255,255,0.7)] p-5"
    >
      <input name="membershipId" type="hidden" value={membership.id} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-base font-semibold text-[var(--color-green-deep)]">
            {membership.profile.fullName || "Sem nome informado"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {membership.profile.email}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-red)]">
            Concedido em {formatDateTime(membership.grantedAt)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[20rem]">
          <label className="form-field">
            <span>Papel</span>
            <select
              className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
              defaultValue={membership.role}
              name="role"
            >
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </label>

          <label className="form-field">
            <span>Status</span>
            <select
              className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
              defaultValue={membership.status}
              name="status"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ActionFeedback state={state} />
        <button className="secondary-button" disabled={isPending} type="submit">
          {isPending ? "Atualizando..." : "Atualizar acesso"}
        </button>
      </div>
    </form>
  );
}

function AdminBootstrapGrantRow({
  grant,
}: {
  grant: AdminBootstrapGrantRecord;
}) {
  const [state, action, isPending] = useActionState(
    updateAdminBootstrapGrant,
    initialState,
  );

  return (
    <form
      action={action}
      className="rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,255,255,0.7)] p-5"
    >
      <input name="grantId" type="hidden" value={grant.id} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-base font-semibold text-[var(--color-green-deep)]">
            {grant.email}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Papel planejado: {grant.role}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-red)]">
            Status atual: {grant.status}
          </p>
          {grant.notes ? (
            <p className="mt-3 text-sm leading-7 text-[var(--color-green-deep)]">
              {grant.notes}
            </p>
          ) : null}
          {grant.claimedAt ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-red)]">
              Claim em {formatDateTime(grant.claimedAt)}
            </p>
          ) : null}
        </div>

        <label className="form-field lg:min-w-[12rem]">
          <span>Status do grant</span>
          <select
            className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
            defaultValue={grant.status}
            name="status"
          >
            <option value="pending">pending</option>
            <option value="claimed">claimed</option>
            <option value="revoked">revoked</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ActionFeedback state={state} />
        <button className="secondary-button" disabled={isPending} type="submit">
          {isPending ? "Atualizando..." : "Atualizar grant"}
        </button>
      </div>
    </form>
  );
}

function ActionFeedback({ state }: { state: AdminPermissionsActionState }) {
  if (state.error) {
    return <p className="text-sm font-medium text-[var(--color-red-deep)]">{state.error}</p>;
  }

  if (state.success) {
    return (
      <p className="text-sm font-medium text-[var(--color-green-deep)]">
        {state.success}
      </p>
    );
  }

  return <div />;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
