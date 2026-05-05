import "server-only";

import { notFound } from "next/navigation";
import { publicationSeedPosts } from "@/lib/publications-content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { publicationCoverBucketName } from "@/lib/supabase/publication-shared";
import { createClient } from "@/lib/supabase/server";

export type PublicationStatus = "draft" | "published" | "archived";

export type PublicationRecord = {
  authorName: string | null;
  body: string[];
  category: string | null;
  coverImageAlt: string | null;
  coverImageUrl: string | null;
  createdAt: string | null;
  excerpt: string;
  featured: boolean;
  id: string;
  publishedAt: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: PublicationStatus;
  title: string;
  updatedAt: string | null;
};

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeSeedPosts(): PublicationRecord[] {
  return publicationSeedPosts.map((post, index) => ({
    authorName: "Associação Alemã de Juiz de Fora",
    body: [...post.body],
    category: null,
    coverImageAlt: post.title,
    coverImageUrl: post.image,
    createdAt: null,
    excerpt: post.excerpt,
    featured: post.featured,
    id: `seed-${index + 1}`,
    publishedAt: "2023-01-18T00:00:00.000Z",
    seoDescription: null,
    seoTitle: null,
    slug: post.slug,
    status: "published",
    title: post.title,
    updatedAt: null,
  }));
}

function formatBody(body: string | string[] | null): string[] {
  if (Array.isArray(body)) {
    return body.filter(Boolean);
  }

  if (!body) {
    return [];
  }

  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function resolvePublicationCoverUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coverImageValue: string | null | undefined,
) {
  const normalized = normalizeOptionalText(coverImageValue);

  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const { data } = supabase.storage
    .from(publicationCoverBucketName)
    .getPublicUrl(normalized);

  return data.publicUrl;
}

async function fetchDatabasePublications() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("aajf")
      .from("publications")
      .select(
        "id, slug, title, excerpt, body, cover_image_url, cover_image_alt, published_at, featured, status, author_name, category, seo_title, seo_description, created_at, updated_at",
      )
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return null;
    }

    return (data ?? []).map((publication) => ({
      authorName: normalizeOptionalText(publication.author_name),
      body: formatBody(publication.body),
      category: normalizeOptionalText(publication.category),
      coverImageAlt:
        normalizeOptionalText(publication.cover_image_alt) ?? publication.title,
      coverImageUrl: resolvePublicationCoverUrl(
        supabase,
        publication.cover_image_url,
      ),
      createdAt: publication.created_at,
      excerpt: publication.excerpt,
      featured: publication.featured ?? false,
      id: publication.id,
      publishedAt: publication.published_at,
      seoDescription: normalizeOptionalText(publication.seo_description),
      seoTitle: normalizeOptionalText(publication.seo_title),
      slug: publication.slug,
      status: publication.status as PublicationStatus,
      title: publication.title,
      updatedAt: publication.updated_at,
    })) satisfies PublicationRecord[];
  } catch {
    return null;
  }
}

export async function getPublishedPublications(): Promise<PublicationRecord[]> {
  const dbPublications = await fetchDatabasePublications();

  if (dbPublications && dbPublications.length) {
    return dbPublications;
  }

  return normalizeSeedPosts();
}

export async function getPublicationBySlug(slug: string): Promise<PublicationRecord> {
  const publications = await getPublishedPublications();
  const publication = publications.find((item) => item.slug === slug);

  if (!publication) {
    notFound();
  }

  return publication;
}

export function formatPublicationDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(value));
}
