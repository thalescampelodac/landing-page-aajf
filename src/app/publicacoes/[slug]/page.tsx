import Image from "next/image";
import { notFound } from "next/navigation";
import {
  formatPublicationDate,
  getPublicationBySlug,
  getPublishedPublications,
} from "@/lib/supabase/publications";

export async function generateStaticParams() {
  const publications = await getPublishedPublications();

  return publications.map((publication) => ({
    slug: publication.slug,
  }));
}

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const publication = await getPublicationBySlug(slug);

  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <article className="soft-card overflow-hidden rounded-[2rem]">
        <div className="relative min-h-[280px] bg-[linear-gradient(135deg,#20452e_0%,#8b1e28_45%,#d6b06a_100%)]">
          {publication.coverImageUrl ? (
            <Image
              src={publication.coverImageUrl}
              alt={publication.coverImageAlt || publication.title}
              fill
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-red)]">
            {publication.featured ? "Publicação em destaque" : "Publicação"}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
            {publication.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted-strong)]">
            <span>{formatPublicationDate(publication.publishedAt)}</span>
            {publication.authorName ? <span>{publication.authorName}</span> : null}
            {publication.category ? <span>{publication.category}</span> : null}
          </div>

          <div className="mt-8 grid gap-5 text-base leading-8 text-[var(--color-muted)]">
            {publication.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
