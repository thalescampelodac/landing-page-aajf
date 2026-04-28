import { SectionTitle } from "@/components/section-title";
import { aboutContent, essenceItems, schmetterlingContent } from "@/lib/site-content";

export default function QuemSomosPage() {
  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10">
        <SectionTitle
          eyebrow="Quem Somos"
          title="Tradicao germanica preservada com cultura, danca e convivencia."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-[var(--color-muted)]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {essenceItems.slice(0, 3).map((item) => (
          <article
            key={item.title}
            className="soft-card rounded-[1.75rem] p-6 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold-deep)]">
              Pilar
            </p>
            <h2 className="mt-3 font-heading text-3xl text-[var(--color-ink)]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="soft-card mt-8 rounded-[2rem] p-8 sm:p-10">
        <SectionTitle
          eyebrow={schmetterlingContent.eyebrow}
          title="O grande destaque da associacao."
          description={schmetterlingContent.description}
        />
        <p className="mt-6 max-w-4xl text-base leading-8 text-[var(--color-muted)]">
          {schmetterlingContent.points.join(" ")}
        </p>
      </section>
    </main>
  );
}
