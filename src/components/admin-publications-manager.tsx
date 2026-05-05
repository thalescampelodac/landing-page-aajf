"use client";

import { useActionState, useMemo, useState, type ChangeEvent } from "react";
import {
  savePublication,
  type AdminPublicationsActionState,
} from "@/app/admin/comunicados/actions";
import type { AdminPublicationRecord } from "@/lib/supabase/admin-publications";
import {
  publicationCoverAcceptedMimeTypes,
  publicationCoverMaxFileSizeInBytes,
  publicationCoverMinimumHeight,
  publicationCoverMinimumWidth,
  publicationCoverRecommendedRatio,
} from "@/lib/supabase/publication-shared";

const initialState: AdminPublicationsActionState = {};

type AdminPublicationsManagerProps = {
  publications: AdminPublicationRecord[];
};

export function AdminPublicationsManager({
  publications,
}: AdminPublicationsManagerProps) {
  const [state, action, isPending] = useActionState(savePublication, initialState);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(
    publications[0]?.id ?? null,
  );
  const selectedPublication =
    publications.find((publication) => publication.id === selectedPublicationId) ?? null;

  const formKey = selectedPublication?.id ?? "new-publication";

  const publicationCounts = useMemo(
    () => ({
      archived: publications.filter((publication) => publication.status === "archived")
        .length,
      drafts: publications.filter((publication) => publication.status === "draft").length,
      published: publications.filter(
        (publication) => publication.status === "published",
      ).length,
    }),
    [publications],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(21rem,0.98fr)]">
      <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-white/72 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-eyebrow">Acervo editorial</p>
            <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
              Publicações registradas
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Clique em uma publicação da lista para carregar os dados no editor.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={() => setSelectedPublicationId(null)}
            type="button"
          >
            Nova publicação
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard label="Rascunhos" value={publicationCounts.drafts} />
          <StatCard label="Publicadas" value={publicationCounts.published} />
          <StatCard label="Arquivadas" value={publicationCounts.archived} />
        </div>

        <div className="mt-6 grid gap-4">
          {publications.length ? (
            publications.map((publication) => (
              <button
                className={`w-full rounded-[1.4rem] border p-5 text-left transition ${
                  selectedPublicationId === publication.id
                    ? "border-[rgba(23,54,45,0.24)] bg-[rgba(255,250,243,0.92)] shadow-[0_18px_36px_rgba(15,32,24,0.08)]"
                    : "border-[rgba(23,54,45,0.1)] bg-white/72 hover:bg-[rgba(255,250,243,0.82)]"
                }`}
                key={publication.id}
                onClick={() => setSelectedPublicationId(publication.id)}
                type="button"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[var(--color-green-deep)]">
                      {publication.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      /publicacoes/{publication.slug}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-green-deep)]">
                      {publication.excerpt}
                    </p>
                  </div>

                  <div className="grid gap-2 text-xs uppercase tracking-[0.14em] text-[var(--color-red)]">
                    {selectedPublicationId === publication.id ? (
                      <span className="text-[var(--color-green-deep)]">
                        Selecionada para edição
                      </span>
                    ) : (
                      <span>Selecionar para editar</span>
                    )}
                    <span>{formatStatusLabel(publication.status)}</span>
                    {publication.featured ? <span>Destaque na home</span> : null}
                    {publication.publishedAt ? (
                      <span>{formatDateTime(publication.publishedAt)}</span>
                    ) : (
                      <span>Sem publicação</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              Nenhuma publicação foi criada no acervo administrativo ainda.
            </p>
          )}
        </div>
      </article>

      <article className="rounded-[1.6rem] border border-[rgba(23,61,46,0.12)] bg-[rgba(255,248,239,0.82)] p-6">
        <PublicationEditorForm
          action={action}
          isPending={isPending}
          key={formKey}
          publication={selectedPublication}
          state={state}
        />
      </article>
    </div>
  );
}

function PublicationEditorForm({
  action,
  isPending,
  publication,
  state,
}: {
  action: (formData: FormData) => void;
  isPending: boolean;
  publication: AdminPublicationRecord | null;
  state: AdminPublicationsActionState;
}) {
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(
    publication?.coverImageUrl ?? null,
  );
  const [coverValidationText, setCoverValidationText] = useState<string>(
    publication?.coverImagePath
      ? "A capa atual será mantida se nenhum arquivo novo for enviado."
      : `Use JPG, PNG ou WEBP com até 5 MB. Recomendação: ${publicationCoverRecommendedRatio}, no mínimo ${publicationCoverMinimumWidth}x${publicationCoverMinimumHeight}.`,
  );

  async function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setCoverPreviewUrl(publication?.coverImageUrl ?? null);
      setCoverValidationText(
        publication?.coverImagePath
          ? "A capa atual será mantida se nenhum arquivo novo for enviado."
          : `Use JPG, PNG ou WEBP com até 5 MB. Recomendação: ${publicationCoverRecommendedRatio}, no mínimo ${publicationCoverMinimumWidth}x${publicationCoverMinimumHeight}.`,
      );
      return;
    }

    if (
      !(publicationCoverAcceptedMimeTypes as readonly string[]).includes(file.type)
    ) {
      setCoverPreviewUrl(publication?.coverImageUrl ?? null);
      setCoverValidationText("Formato inválido. Use JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > publicationCoverMaxFileSizeInBytes) {
      setCoverPreviewUrl(publication?.coverImageUrl ?? null);
      setCoverValidationText("A capa deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const isHorizontal = image.width > image.height;
      const meetsMinimumSize =
        image.width >= publicationCoverMinimumWidth &&
        image.height >= publicationCoverMinimumHeight;

      if (!isHorizontal) {
        setCoverValidationText(
          "A imagem precisa ser horizontal para funcionar bem nos cards e na home.",
        );
      } else if (!meetsMinimumSize) {
        setCoverValidationText(
          `A imagem está abaixo do mínimo recomendado de ${publicationCoverMinimumWidth}x${publicationCoverMinimumHeight}.`,
        );
      } else {
        setCoverValidationText(
          `Imagem pronta para envio. Recomendação editorial: proporção próxima de ${publicationCoverRecommendedRatio}.`,
        );
      }

      setCoverPreviewUrl(objectUrl);
    };

    image.onerror = () => {
      setCoverPreviewUrl(publication?.coverImageUrl ?? null);
      setCoverValidationText("Não foi possível ler a prévia dessa imagem.");
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  }

  return (
    <>
      <p className="section-eyebrow">Editor</p>
      <h3 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
        {publication ? "Editar publicação" : "Criar publicação"}
      </h3>

      <form action={action} className="mt-6 grid gap-4">
        <input name="id" type="hidden" value={publication?.id ?? ""} />

        <label className="form-field">
          <span>Título</span>
          <input
            defaultValue={publication?.title ?? ""}
            name="title"
            placeholder="Título da notícia"
            required
          />
        </label>

        <label className="form-field">
          <span className="flex items-center gap-2">
            Link da publicação
            <span className="relative inline-flex">
              <button
                aria-label="Explicação sobre o link da publicação"
                className="grid h-5 w-5 place-items-center rounded-full border border-[rgba(23,54,45,0.18)] text-[0.72rem] font-semibold leading-none text-[var(--color-green-deep)] transition hover:bg-[rgba(255,250,243,0.92)]"
                title="Este texto será usado no endereço da página. Exemplo: /publicacoes/festa-de-maio-2026. Se deixar em branco, o sistema cria automaticamente a partir do título."
                type="button"
              >
                i
              </button>
            </span>
          </span>
          <input
            defaultValue={publication?.slug ?? ""}
            name="slug"
            placeholder="deixe em branco para gerar automaticamente"
          />
        </label>

        <label className="form-field">
          <span>Resumo</span>
          <textarea
            className="min-h-24"
            defaultValue={publication?.excerpt ?? ""}
            name="excerpt"
            placeholder="Resumo curto para home e listagem"
            required
          />
        </label>

        <label className="form-field">
          <span>Corpo</span>
          <textarea
            className="min-h-48"
            defaultValue={publication?.body ?? ""}
            name="body"
            placeholder="Texto completo da publicação"
            required
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="form-field">
            <span>Categoria</span>
            <input
              defaultValue={publication?.category ?? ""}
              name="category"
              placeholder="Notícia, evento, memória..."
            />
          </label>

          <label className="form-field">
            <span>Autor</span>
            <input
              defaultValue={publication?.authorName ?? ""}
              name="authorName"
              placeholder="Nome institucional ou pessoa responsável"
            />
          </label>
        </div>

        <div className="grid gap-4 rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-white/72 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="grid gap-4">
              <label className="form-field">
                <span>Imagem de capa</span>
                <input
                  accept={publicationCoverAcceptedMimeTypes.join(",")}
                  name="coverImageFile"
                  onChange={handleCoverFileChange}
                  type="file"
                />
              </label>

              <label className="form-field">
                <span>Texto alternativo da imagem</span>
                <input
                  defaultValue={publication?.coverImageAlt ?? ""}
                  name="coverImageAlt"
                  placeholder="Descreva a imagem de capa"
                />
              </label>

              <p className="text-sm leading-7 text-[var(--color-muted)]">
                {coverValidationText}
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-[rgba(23,54,45,0.08)] bg-[rgba(255,250,243,0.74)] p-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-red)]">
                Prévia
              </p>
              <div className="mt-3 overflow-hidden rounded-[1rem] border border-[rgba(23,54,45,0.08)] bg-[linear-gradient(135deg,#20452e_0%,#8b1e28_45%,#d6b06a_100%)]">
                {coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={publication?.coverImageAlt || "Prévia da capa"}
                    className="aspect-[16/10] h-auto w-full object-cover"
                    src={coverPreviewUrl}
                  />
                ) : (
                  <div className="aspect-[16/10] w-full" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="form-field">
            <span>Status</span>
            <select
              className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-white/88 px-4 py-3 text-[var(--color-ink)]"
              defaultValue={publication?.status ?? "draft"}
              name="status"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>

          <label className="form-field">
            <span>Publicada em</span>
            <input
              defaultValue={formatDatetimeLocalValue(publication?.publishedAt ?? null)}
              name="publishedAt"
              type="datetime-local"
            />
          </label>
        </div>

        <label className="form-field">
          <span>SEO title</span>
          <input
            defaultValue={publication?.seoTitle ?? ""}
            name="seoTitle"
            placeholder="Opcional"
          />
        </label>

        <label className="form-field">
          <span>SEO description</span>
          <textarea
            className="min-h-20"
            defaultValue={publication?.seoDescription ?? ""}
            name="seoDescription"
            placeholder="Opcional"
          />
        </label>

        <label className="flex items-center gap-3 rounded-[1.2rem] border border-[rgba(23,54,45,0.1)] bg-white/72 px-4 py-3 text-sm font-medium text-[var(--color-green-deep)]">
          <input
            defaultChecked={publication?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Marcar como destaque principal da home
        </label>

        <ActionFeedback state={state} />

        <button className="primary-button" disabled={isPending} type="submit">
          {isPending
            ? "Salvando..."
            : publication
              ? "Salvar publicação"
              : "Criar publicação"}
        </button>
      </form>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.2rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.72)] px-4 py-3">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-red)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-green-deep)]">
        {value}
      </p>
    </div>
  );
}

function ActionFeedback({ state }: { state: AdminPublicationsActionState }) {
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

function formatStatusLabel(status: string) {
  if (status === "published") {
    return "Publicada";
  }

  if (status === "archived") {
    return "Arquivada";
  }

  return "Rascunho";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
