"use client";

import { useActionState, useDeferredValue, useState } from "react";
import {
  grantAssociateAccess,
  updateAssociateMembership,
  type AdminAssociatesActionState,
} from "@/app/admin/associados/actions";
import type { AdminAssociateMembershipRecord } from "@/lib/supabase/admin-associates";

const initialState: AdminAssociatesActionState = {};
const PAGE_SIZE = 5;

type AdminAssociatesManagerProps = {
  memberships: AdminAssociateMembershipRecord[];
};

export function AdminAssociatesManager({
  memberships = [],
}: AdminAssociatesManagerProps) {
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
      (membership.profileSnapshot?.membershipNumber || "")
        .toLowerCase()
        .includes(normalizedQuery);

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

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
          <p className="section-eyebrow">Associados atuais</p>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.72)] p-4 lg:grid-cols-3">
              <label className="form-field">
                <span>Buscar por nome, email ou matrícula</span>
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
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Kleine Kinder">Kleine Kinder</option>
                  <option value="Grosse Kinder">Grosse Kinder</option>
                  <option value="Jugendliche">Jugendliche</option>
                  <option value="Erwachsene">Erwachsene</option>
                  <option value="Heimweh">Heimweh</option>
                  <option value="Senioren">Senioren</option>
                  <option value="Männertanz">Männertanz</option>
                  <option value="none">Nao definida</option>
                </select>
              </label>
            </div>

            {filteredMemberships.length ? (
              <>
                <div className="rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-white/72">
                  <div className="hidden grid-cols-[minmax(11rem,1.3fr)_minmax(12rem,1.25fr)_minmax(7rem,0.8fr)_minmax(8rem,0.9fr)_minmax(9rem,0.9fr)_minmax(8.5rem,0.95fr)] gap-4 border-b border-[rgba(23,54,45,0.08)] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-red)] lg:grid">
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <form
        action={action}
        className="border-b border-[rgba(23,54,45,0.08)] bg-[rgba(255,255,255,0.7)] px-5 py-4 last:border-b-0"
      >
        <input name="membershipId" type="hidden" value={membership.id} />
        <input name="notes" type="hidden" value={membership.notes || ""} />

        <div className="grid gap-4 lg:grid-cols-[minmax(11rem,1.3fr)_minmax(12rem,1.25fr)_minmax(7rem,0.8fr)_minmax(8rem,0.9fr)_minmax(9rem,0.9fr)_minmax(8.5rem,0.95fr)] lg:items-start">
          <div className="min-w-0">
              <p className="text-[1.05rem] font-semibold leading-7 text-[var(--color-green-deep)]">
              {membership.profile.fullName || "Sem nome informado"}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
              Matrícula: {membership.profileSnapshot?.membershipNumber || "Pendente"}
            </p>
            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--color-red)]">
              Concedido em {formatDateTime(membership.grantedAt)}
            </p>
          </div>

          <div className="min-w-0 break-words text-[0.95rem] leading-7 text-[var(--color-muted)]">
            {membership.profile.email}
          </div>

          <div className="text-[0.95rem] leading-7 text-[var(--color-muted)]">
            {membership.profileSnapshot?.category || "Nao definida"}
          </div>

          <div className="text-[0.95rem] leading-7 text-[var(--color-muted)]">
            {membership.profileSnapshot?.phone || "Nao informado"}
          </div>

          <div className="grid gap-2">
            <label className="form-field">
              <span className="lg:sr-only">Status</span>
              <select
                className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-[rgba(255,250,243,0.88)] px-3 py-2.5 text-[0.95rem] text-[var(--color-ink)]"
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

          <div className="grid gap-2">
            <button
              className="rounded-full border border-[rgba(23,54,45,0.14)] bg-white px-4 py-2.5 text-[0.95rem] font-medium text-[var(--color-green-deep)] transition hover:bg-[rgba(255,250,243,0.92)]"
              onClick={() => setIsDetailsOpen(true)}
              type="button"
            >
              Ver dados
            </button>
            <button
              className="rounded-full border border-[rgba(23,54,45,0.14)] bg-white px-4 py-2.5 text-[0.95rem] font-medium text-[var(--color-green-deep)] transition hover:bg-[rgba(255,250,243,0.92)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Salvando..." : "Atualizar vínculo"}
            </button>
          </div>
        </div>
      </form>

      {isDetailsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,20,0.62)] px-4 py-6">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-[rgba(255,250,243,0.98)] p-6 shadow-[0_24px_80px_rgba(9,28,22,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Dados do associado</p>
                <h3 className="mt-3 text-3xl font-heading text-[var(--color-green-deep)]">
                  {membership.profile.fullName || "Sem nome informado"}
                </h3>
              </div>
              <button
                aria-label="Fechar dados do associado"
                className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(23,54,45,0.12)] bg-white text-lg text-[var(--color-green-deep)] transition hover:bg-[rgba(255,250,243,0.92)]"
                onClick={() => setIsDetailsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-[rgba(23,54,45,0.1)] bg-white/80 p-5">
              <div className="grid gap-6 text-sm leading-7 text-[var(--color-green-deep)]">
                <div className="grid gap-2">
                  <p><strong>Email:</strong> {membership.profile.email}</p>
                  <p><strong>Matrícula do associado:</strong> {membership.profileSnapshot?.membershipNumber || "Pendente"}</p>
                  <p><strong>Status do vínculo:</strong> {membership.status}</p>
                  <p><strong>Concedido em:</strong> {formatDateTime(membership.grantedAt)}</p>
                  <p><strong>Observações administrativas:</strong> {membership.notes || "Nenhuma observação registrada."}</p>
                </div>

                <div className="grid gap-2">
                  <p><strong>Nome completo:</strong> {membership.profileSnapshot?.fullName || membership.profile.fullName || "Não informado"}</p>
                  <p><strong>Categoria:</strong> {membership.profileSnapshot?.category || "Não definida"}</p>
                  <p><strong>CPF:</strong> {membership.profileSnapshot?.cpf || "Não informado"}</p>
                  <p><strong>RG:</strong> {membership.profileSnapshot?.rg || "Não informado"}</p>
                  <p><strong>Telefone:</strong> {membership.profileSnapshot?.phone || "Não informado"}</p>
                  <p><strong>Data de nascimento:</strong> {formatDate(membership.profileSnapshot?.birthDate)}</p>
                  <p><strong>Nacionalidade:</strong> {membership.profileSnapshot?.nationality || "Não informada"}</p>
                </div>

                <div className="grid gap-2">
                  <p><strong>CEP:</strong> {membership.profileSnapshot?.cep || "Não informado"}</p>
                  <p><strong>Rua:</strong> {membership.profileSnapshot?.addressStreet || "Não informada"}</p>
                  <p><strong>Número:</strong> {membership.profileSnapshot?.addressNumber || "Não informado"}</p>
                  <p><strong>Complemento:</strong> {membership.profileSnapshot?.addressComplement || "Não informado"}</p>
                  <p><strong>Bairro:</strong> {membership.profileSnapshot?.addressNeighborhood || "Não informado"}</p>
                  <p><strong>Cidade:</strong> {membership.profileSnapshot?.addressCity || "Não informada"}</p>
                  <p><strong>UF:</strong> {membership.profileSnapshot?.addressState || "Não informada"}</p>
                </div>

                <div className="grid gap-2">
                  <p><strong>Observação do associado:</strong> {membership.profileSnapshot?.observation || "Nenhuma observação informada."}</p>
                  <p><strong>Termo aceito:</strong> {membership.profileSnapshot?.termAccepted ? "Sim" : "Não"}</p>
                  <p><strong>Foto cadastrada:</strong> {membership.profileSnapshot?.photoUrl ? "Sim" : "Não"}</p>
                </div>

                <div className="grid gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-red)]">
                    Dependentes
                  </p>

                  {membership.profileSnapshot?.dependents.length ? (
                    <div className="grid gap-4">
                      {membership.profileSnapshot.dependents.map((dependent, index) => (
                        <div
                          className="rounded-[1.2rem] border border-[rgba(23,54,45,0.08)] bg-[rgba(255,250,243,0.7)] p-4"
                          key={dependent.id}
                        >
                          <div className="space-y-2">
                            <p><strong>Dependente {index + 1}:</strong> {dependent.fullName}</p>
                            <p><strong>Matrícula:</strong> {dependent.membershipNumber || "Pendente"}</p>
                            <p><strong>Categoria:</strong> {dependent.category || "Não definida"}</p>
                            <p><strong>CPF:</strong> {dependent.cpf || "Não informado"}</p>
                            <p><strong>RG:</strong> {dependent.rg || "Não informado"}</p>
                            <p><strong>Data de nascimento:</strong> {formatDate(dependent.birthDate)}</p>
                            <p><strong>Nacionalidade:</strong> {dependent.nationality || "Não informada"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Nenhum dependente cadastrado.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="secondary-button"
                onClick={() => setIsDetailsOpen(false)}
                type="button"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Não informada";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
