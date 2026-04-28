type TestimonialCardProps = {
  name: string;
  quote: string;
};

export function TestimonialCard({ name, quote }: TestimonialCardProps) {
  return (
    <blockquote className="soft-card rounded-[1.6rem] p-6 sm:p-7">
      <p className="text-base leading-8 text-[var(--color-muted)]">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-green-deep)]">
        {name}
      </footer>
    </blockquote>
  );
}
