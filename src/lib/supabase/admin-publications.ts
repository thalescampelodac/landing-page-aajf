import { getAdminAccess, type AdminAccess } from "@/lib/supabase/access";
import type { PublicationStatus } from "@/lib/supabase/publications";
import { publicationCoverBucketName } from "@/lib/supabase/publication-shared";
import { createClient } from "@/lib/supabase/server";

export type AdminPublicationRecord = {
  authorName: string | null;
  body: string;
  category: string | null;
  coverImageAlt: string | null;
  coverImagePath: string | null;
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

export type AdminPublicationsData =
  | {
      access: Extract<
        AdminAccess,
        { status: "unconfigured" | "unauthenticated" | "denied" }
      >;
    }
  | {
      access: Extract<AdminAccess, { status: "authorized" }>;
      publications: AdminPublicationRecord[];
    };

export async function getAdminPublicationsData(): Promise<AdminPublicationsData> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { access };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("aajf")
    .from("publications")
    .select(
      "id, slug, title, excerpt, body, cover_image_url, cover_image_alt, published_at, featured, status, author_name, category, seo_title, seo_description, created_at, updated_at",
    )
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return {
    access,
    publications: (data ?? []).map((publication) => ({
      authorName: publication.author_name,
      body: publication.body ?? "",
      category: publication.category,
      coverImageAlt: publication.cover_image_alt,
      coverImagePath: publication.cover_image_url,
      coverImageUrl: resolvePublicationCoverUrl(supabase, publication.cover_image_url),
      createdAt: publication.created_at,
      excerpt: publication.excerpt,
      featured: publication.featured ?? false,
      id: publication.id,
      publishedAt: publication.published_at,
      seoDescription: publication.seo_description,
      seoTitle: publication.seo_title,
      slug: publication.slug,
      status: publication.status as PublicationStatus,
      title: publication.title,
      updatedAt: publication.updated_at,
    })),
  };
}

function resolvePublicationCoverUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coverImageValue: string | null | undefined,
) {
  const normalized = coverImageValue?.trim();

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
