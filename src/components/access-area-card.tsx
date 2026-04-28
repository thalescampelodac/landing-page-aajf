import Link from "next/link";

type AccessAreaCardProps = {
  title: string;
  description: string;
  href: string;
};

export function AccessAreaCard({
  title,
  description,
  href,
}: AccessAreaCardProps) {
  return (
    <article className="highlight-card flex h-full flex-col justify-between rounded-[1.75rem] p-6 sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-strong)]">
          Preparado para evoluir
        </p>
        <h3 className="mt-4 font-heading text-3xl text-white">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-[rgba(255,247,236,0.85)]">
          {description}
        </p>
      </div>
      <Link className="ghost-button mt-8 inline-flex w-fit" href={href}>
        Acessar área
      </Link>
    </article>
  );
}
