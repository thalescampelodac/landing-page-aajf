type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="soft-card h-full rounded-[1.75rem] p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-deep)]">
        Essência
      </p>
      <h3 className="mt-4 font-heading text-3xl text-[var(--color-ink)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{description}</p>
    </article>
  );
}
