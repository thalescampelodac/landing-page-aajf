"use client";

import { useActionState, useDeferredValue, useEffect, useState } from "react";
import {
  grantAssociateAccess,
  updateAssociateMembership,
  type AdminAssociatesActionState,
} from "@/app/admin/associados/actions";
import type {
  AdminAssociateMembershipRecord,
  AssociateBootstrapGrantRecord,
} from "@/lib/supabase/admin-associates";

const initialState: AdminAssociatesActionState = {};
const PAGE_SIZE = 5;

type AdminAssociatesManagerProps = {
  bootstrapGrants: AssociateBootstrapGrantRecord[];
  memberships: AdminAssociateMembershipRecord[];
};

export function AdminAssociatesManager({
  bootstrapGrants = [],
  memberships = [],
}: AdminAssociatesManagerProps) {
  const safeBootstrapGrants = Array.isArray(bootstrapGrants) ? bootstrapGrants : [];
  const safeMemberships = Array.isArray(memberships) ? memberships : [];
  const [grantState, grantAction, isGranting] = useActionState(
    grantAssociateAccess,
    initialState,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredMemberships = safeMemberships.filter((membership) => {
    const matchesQuery =
      !normalizedQuery ||
      membership.profile.email.toLowerCase().includes(normalizedQuery) ||
      (membership.profile.fullName || "").toLowerCase().includes(normalizedQuery) ||
      (membership.notes || "").toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      statusFilter === "all" || membership.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      (membership.profileSnapshot?.category || "none") === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMemberships.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedMemberships = filteredMemberships.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Associados atuais</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Quem já possui vínculo com a associação
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Esta lista já usa `associate_memberships` e o espelho inicial da
            ficha cadastral para facilitar consulta, status e preparação da área
            do associado.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.72)] p-4 lg:grid-cols-3">
              <label className="form-field">
                <span>Buscar por nome, email ou observação</span>
                <input
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Digite para filtrar"
                  value={query}
                />
              </label>

              <label className="form-field">
                <span>Status</span>
                <select
                  className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  value={statusFilter}
                >
                  <option value="all">Todos</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="suspended">suspended</option>
                </select>
              </label>

              <label className="form-field">
                <span>Categoria</span>
                <select
                  className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    setPage(1);
                  }}
                  value={categoryFilter}
                >
                  <option value="all">Todas</option>
                  <option value="Kleine Kinder">Kleine Kinder</option>
                  <option value="Gosse Kinder">Gosse Kinder</option>
                  <option value="Heimweh">Heimweh</option>
                  <option value="none">Nao definida</option>
                </select>
              </label>
            </div>

            {filteredMemberships.length ? (
              <>
                <div className="overflow-x-auto rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-white/72">
                  <div className="hidden min-w-[72rem] grid-cols-[1.2fr_1.25fr_0.85fr_1fr_1fr_1.2fr] gap-4 border-b border-[rgba(23,54,45,0.08)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-red)] lg:grid">
                    <span>Nome</span>
                    <span>Email</span>
                    <span>Categoria</span>
                    <span>Telefone</span>
                    <span>Status</span>
                    <span>Ações</span>
                  </div>

                  <div className="grid gap-0">
                    {pagedMemberships.map((membership) => (
                      <AssociateMembershipRow key={membership.id} membership={membership} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-7 text-[var(--color-muted)]">
                    Exibindo {pagedMemberships.length} de {filteredMemberships.length} associado(s).
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      className="secondary-button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      Página anterior
                    </button>
                    <span className="text-sm font-medium text-[var(--color-green-deep)]">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      className="secondary-button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      type="button"
                    >
                      Próxima página
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Nenhum associado corresponde aos filtros atuais.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-[rgba(255,248,239,0.82)] p-6">
          <p className="section-eyebrow">Conceder novo vínculo</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Autorizar associado por email
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Use este fluxo para conceder acesso de associado por email, mesmo
            que a pessoa ainda não tenha entrado no sistema. O vínculo do
            associado e o acesso administrativo permanecem independentes.
          </p>

          <form action={grantAction} className="mt-6 grid gap-4">
            <label className="form-field">
              <span>Email do associado</span>
              <input name="email" placeholder="pessoa@email.com" type="email" />
            </label>

            <label className="form-field">
              <span>Status inicial</span>
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

            <label className="form-field">
              <span>Observações administrativas</span>
              <textarea
                className="min-h-28"
                name="notes"
                placeholder="Contexto da concessão, grupo, observação interna ou referência operacional."
              />
            </label>

            <ActionFeedback state={grantState} />

            <button className="primary-button" disabled={isGranting} type="submit">
              {isGranting ? "Salvando..." : "Conceder vínculo de associado"}
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-5">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Concessões por email</p>
          <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
            Quem já foi autorizado a entrar como associado
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
            Esta lista usa `associate_bootstrap_grants` para registrar a
            autorização por email e preparar o primeiro acesso do associado.
          </p>

          <div className="mt-6 grid gap-4">
            {safeBootstrapGrants.length ? (
              safeBootstrapGrants.map((grant) => (
                <div
                  className="rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,255,255,0.7)] p-5"
                  key={grant.id}
                >
                  <p className="text-base font-semibold text-[var(--color-green-deep)]">
                    {grant.email}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <InfoChip label="Grant" value={grant.status} />
                    <InfoChip label="Vínculo previsto" value={grant.membershipStatus} />
                    <InfoChip
                      label="Claim"
                      value={grant.claimedAt ? formatDateTime(grant.claimedAt) : "Ainda não"}
                    />
                  </div>
                  {grant.notes ? (
                    <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                      {grant.notes}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Nenhuma autorização de associado por email foi registrada até o
                momento.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function AssociateMembershipRow({
  membership,
}: {
  membership: AdminAssociateMembershipRecord;
}) {
  const [state, action, isPending] = useActionState(
    updateAssociateMembership,
    initialState,
  );

  return (
    <form
      action={action}
      className="min-w-[72rem] border-b border-[rgba(23,54,45,0.08)] bg-[rgba(255,255,255,0.7)] px-5 py-5 last:border-b-0"
    >
      <input name="membershipId" type="hidden" value={membership.id} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.25fr_0.85fr_1fr_1fr_1.2fr] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-base font-semibold text-[var(--color-green-deep)]">
            {membership.profile.fullName || "Sem nome informado"}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-red)]">
            Concedido em {formatDateTime(membership.grantedAt)}
          </p>
        </div>

        <div className="text-sm leading-7 text-[var(--color-muted)]">
          {membership.profile.email}
        </div>

        <div className="text-sm leading-7 text-[var(--color-muted)]">
          {membership.profileSnapshot?.category || "Nao definida"}
        </div>

        <div className="text-sm leading-7 text-[var(--color-muted)]">
          {membership.profileSnapshot?.phone || "Nao informado"}
        </div>

        <div className="grid gap-3">
          <label className="form-field">
            <span className="lg:sr-only">Status</span>
            <select
              className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-[rgba(255,250,243,0.88)] px-4 py-3 text-[var(--color-ink)]"
              defaultValue={membership.status}
              name="status"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </label>
          <ActionFeedback state={state} />
        </div>

        <div className="grid gap-3">
          <label className="form-field">
            <span className="lg:sr-only">Observações administrativas</span>
            <textarea
              className="min-h-24"
              defaultValue={membership.notes || ""}
              name="notes"
              placeholder="Observações internas sobre este vínculo."
            />
          </label>
          <button className="secondary-button" disabled={isPending} type="submit">
            {isPending ? "Salvando..." : "Atualizar vínculo"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ActionFeedback({ state }: { state: AdminAssociatesActionState }) {
  if (state.error) {
    return <p className="text-sm font-medium text-[var(--color-red-deep)]">{state.error}</p>;
  }

  if (state.success) {
    return (
      <p className="text-sm font-medium text-[var(--color-green-deep)]">{state.success}</p>
    );
  }

  return null;
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-[rgba(23,54,45,0.12)] bg-[rgba(255,250,243,0.82)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-green-deep)]">
      {label}: {value}
    </span>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
