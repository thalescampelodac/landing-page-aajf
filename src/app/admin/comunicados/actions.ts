"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getAdminAccess } from "@/lib/supabase/access";
import type { PublicationStatus } from "@/lib/supabase/publications";
import {
  publicationCoverAcceptedMimeTypes,
  publicationCoverBucketName,
  publicationCoverMaxFileSizeInBytes,
} from "@/lib/supabase/publication-shared";
import { createClient } from "@/lib/supabase/server";

export type AdminPublicationsActionState = {
  error?: string;
  success?: string;
};

export async function savePublication(
  _previousState: AdminPublicationsActionState,
  formData: FormData,
): Promise<AdminPublicationsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem operar publicações." };
  }

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const coverImageAlt = String(formData.get("coverImageAlt") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const authorName = String(formData.get("authorName") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const seoTitle = String(formData.get("seoTitle") || "").trim();
  const seoDescription = String(formData.get("seoDescription") || "").trim();
  const publishedAtInput = String(formData.get("publishedAt") || "").trim();
  const featured = formData.get("featured") === "on";
  const coverImageFileEntry = formData.get("coverImageFile");
  const coverImageFile =
    coverImageFileEntry instanceof File && coverImageFileEntry.size > 0
      ? coverImageFileEntry
      : null;

  if (!title) {
    return { error: "Informe o título da publicação." };
  }

  if (!excerpt) {
    return { error: "Informe o resumo da publicação." };
  }

  if (!body) {
    return { error: "Informe o corpo da publicação." };
  }

  if (!isValidPublicationStatus(status)) {
    return { error: "Selecione um status válido para a publicação." };
  }

  if (
    coverImageFile &&
    !(publicationCoverAcceptedMimeTypes as readonly string[]).includes(
      coverImageFile.type,
    )
  ) {
    return { error: "Use uma imagem JPG, PNG ou WEBP para a capa da publicação." };
  }

  if (coverImageFile && coverImageFile.size > publicationCoverMaxFileSizeInBytes) {
    return { error: "A imagem de capa deve ter no máximo 5 MB." };
  }

  const baseSlug = slugify(slugInput || title);

  if (!baseSlug) {
    return { error: "Não foi possível gerar um slug válido para a publicação." };
  }

  const publishedAt =
    status === "published"
      ? normalizePublishedAt(publishedAtInput) ?? new Date().toISOString()
      : normalizePublishedAt(publishedAtInput);

  const supabase = await createClient();
  const slug = await resolveUniqueSlug(supabase, baseSlug, id || null);
  const slugWasAdjusted = slug !== baseSlug;
  const publicationId = id || crypto.randomUUID();
  const { data: existingPublication, error: existingPublicationError } = await supabase
    .schema("aajf")
    .from("publications")
    .select("cover_image_url")
    .eq("id", publicationId)
    .maybeSingle();

  if (existingPublicationError) {
    return { error: existingPublicationError.message };
  }

  let nextCoverImagePath = existingPublication?.cover_image_url?.trim() || null;

  if (coverImageFile) {
    try {
      const adminSupabase = createAdminClient();
      const extension = resolvePublicationImageExtension(coverImageFile);
      const uploadedCoverPath = `publications/${publicationId}/cover-${Date.now()}.${extension}`;
      const previousCoverPath = existingPublication?.cover_image_url?.trim() || null;

      const { error: uploadError } = await adminSupabase.storage
        .from(publicationCoverBucketName)
        .upload(uploadedCoverPath, coverImageFile, {
          cacheControl: "3600",
          contentType: coverImageFile.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      if (
        previousCoverPath &&
        previousCoverPath !== uploadedCoverPath &&
        !/^https?:\/\//i.test(previousCoverPath)
      ) {
        const { error: removePreviousCoverError } = await adminSupabase.storage
          .from(publicationCoverBucketName)
          .remove([previousCoverPath]);

        if (removePreviousCoverError) {
          return { error: removePreviousCoverError.message };
        }
      }

      nextCoverImagePath = uploadedCoverPath;
    } catch {
      return {
        error:
          "O upload da capa ainda não está disponível neste ambiente. Verifique a configuração do Storage do Supabase.",
      };
    }
  }

  if (status === "published" && !nextCoverImagePath) {
    return { error: "Publicações publicadas precisam ter uma imagem de capa." };
  }

  if (status === "published" && !coverImageAlt) {
    return {
      error:
        "Publicações publicadas precisam ter um texto alternativo para a imagem de capa.",
    };
  }

  if (featured) {
    const { error: clearFeaturedError } = await supabase
      .schema("aajf")
      .from("publications")
      .update({ featured: false })
      .neq("id", id || "00000000-0000-0000-0000-000000000000");

    if (clearFeaturedError) {
      return { error: clearFeaturedError.message };
    }
  }

  const payload = {
    author_name: authorName || null,
    body,
    category: category || null,
    cover_image_alt: coverImageAlt || null,
    cover_image_url: nextCoverImagePath,
    excerpt,
    featured,
    published_at: publishedAt,
    seo_description: seoDescription || null,
    seo_title: seoTitle || null,
    slug,
    status,
    title,
  };

  if (id) {
    const { error } = await supabase
      .schema("aajf")
      .from("publications")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .schema("aajf")
      .from("publications")
      .insert({ ...payload, id: publicationId });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/publicacoes");
  revalidatePath(`/publicacoes/${slug}`);
  revalidatePath("/admin/comunicados");

  return {
    success: buildSuccessMessage({
      isUpdate: Boolean(id),
      slug,
      slugWasAdjusted,
    }),
  };
}

function isValidPublicationStatus(status: string): status is PublicationStatus {
  return status === "draft" || status === "published" || status === "archived";
}

function normalizePublishedAt(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolvePublicationImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  currentId: string | null,
) {
  const { data, error } = await supabase
    .schema("aajf")
    .from("publications")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (error || !data?.length) {
    return baseSlug;
  }

  const conflictingSlugs = new Set(
    data
      .filter((publication) => publication.id !== currentId)
      .map((publication) => publication.slug),
  );

  if (!conflictingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;

  while (conflictingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

function buildSuccessMessage({
  isUpdate,
  slug,
  slugWasAdjusted,
}: {
  isUpdate: boolean;
  slug: string;
  slugWasAdjusted: boolean;
}) {
  const baseMessage = isUpdate
    ? "Publicação atualizada com sucesso."
    : "Publicação criada com sucesso.";

  if (!slugWasAdjusted) {
    return baseMessage;
  }

  return `${baseMessage} O link final ficou como /publicacoes/${slug}.`;
}
