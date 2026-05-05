import Image from "next/image";
import Link from "next/link";

type PublicationCardProps = {
  href?: string;
  title: string;
  excerpt: string;
  date: string;
  imageAlt?: string | null;
  image?: string | null;
  featured?: boolean;
};

export function PublicationCard({
  href = "/publicacoes",
  title,
  excerpt,
  date,
  imageAlt,
  image,
  featured = false,
}: PublicationCardProps) {
  return (
    <article
      className={`soft-card overflow-hidden rounded-[1.9rem] ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      {image ? (
        <div className="relative aspect-[16/10]">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-[radial-gradient(circle_at_top_left,rgba(232,188,90,0.28),transparent_38%),linear-gradient(135deg,rgba(14,23,22,0.98),rgba(129,27,31,0.94),rgba(228,190,112,0.78))]" />
      )}

      <div className="p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-red)]">
          {featured ? "Publicação em destaque" : "Publicação"}
        </p>
        <h3 className="mt-4 font-heading text-3xl leading-tight text-[var(--color-ink)]">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-strong)]">
            {date}
          </p>
          <Link className="text-sm font-semibold text-[var(--color-green-deep)]" href={href}>
            Ler publicação
          </Link>
        </div>
      </div>
    </article>
  );
}
