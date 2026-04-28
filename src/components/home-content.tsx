import Link from "next/link";
import { AccessAreaCard } from "@/components/access-area-card";
import { FeatureCard } from "@/components/feature-card";
import { Hero } from "@/components/hero";
import { PublicationCard } from "@/components/publication-card";
import { SectionTitle } from "@/components/section-title";
import { TestimonialCard } from "@/components/testimonial-card";
import {
  aboutContent,
  accessAreas,
  essenceItems,
  posts,
  schmetterlingContent,
  siteConfig,
  testimonials,
} from "@/lib/site-content";

export function HomeContent() {
  const [featuredPost, ...otherPosts] = posts;

  return (
    <main className="flex-1 pb-20">
      <Hero />

      <section id="essencia" className="section-shell section-spacing">
        <SectionTitle
          eyebrow="Nossa essência"
          title="Cultura, tradição e convivência apresentadas com leveza e orgulho."
          description="A nova landing destaca os pilares que tornam a associação um espaço de memória, comunidade e celebração da cultura alemã."
          align="center"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {essenceItems.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <section id="quem-somos" className="section-shell section-spacing">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="soft-card rounded-[2rem] p-7 sm:p-9 lg:p-10">
            <SectionTitle
              eyebrow={aboutContent.eyebrow}
              title={aboutContent.title}
            />

            <div className="mt-6 grid gap-4 text-base leading-8 text-[var(--color-muted)]">
              {aboutContent.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <Link className="primary-button mt-8 inline-flex" href="/quem-somos">
              Conhecer a história da associação
            </Link>
          </article>

          <article className="highlight-card rounded-[2rem] p-7 text-[var(--color-paper)] sm:p-9 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold-strong)]">
              O que nos move
            </p>
            <div className="mt-6 grid gap-4">
              {aboutContent.pillars.map((pillar) => (
                <div
                  key={pillar}
                  className="rounded-[1.4rem] border border-white/12 bg-white/6 px-5 py-4"
                >
                  <p className="text-sm leading-7 text-[rgba(255,247,236,0.92)]">
                    {pillar}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="schmetterling" className="section-shell section-spacing">
        <div className="soft-card grid gap-8 rounded-[2rem] p-7 sm:p-9 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div>
            <SectionTitle
              eyebrow={schmetterlingContent.eyebrow}
              title={schmetterlingContent.title}
              description={schmetterlingContent.description}
            />
          </div>

          <div className="grid gap-4">
            {schmetterlingContent.points.map((point) => (
              <article
                key={point}
                className="rounded-[1.5rem] border border-[rgba(22,45,36,0.08)] bg-[rgba(255,250,244,0.85)] px-5 py-5"
              >
                <p className="text-sm leading-7 text-[var(--color-muted)]">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="acessos" className="section-shell section-spacing">
        <SectionTitle
          eyebrow="Áreas de acesso"
          title="Entradas preparadas para associados, gestão interna e apoiadores."
          description="Os acessos já deixam a plataforma pronta para futuras evoluções com autenticação, permissão por perfil e gestão de conteúdo."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {accessAreas.map((area) => (
            <AccessAreaCard
              key={area.href}
              title={area.title}
              description={area.description}
              href={area.href}
            />
          ))}
        </div>
      </section>

      <section id="publicacoes" className="section-shell section-spacing">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Publicações"
            title="Conteúdos institucionais com cara de revista cultural."
            description="A home passa a tratar as publicações como destaque editorial, com leitura mais arejada e mais espaço para o conteúdo crescer."
          />
          <Link className="secondary-button w-full sm:w-auto" href="/publicacoes">
            Ver todas
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          <PublicationCard
            title={featuredPost.title}
            excerpt={featuredPost.excerpt}
            date={featuredPost.date}
            image={featuredPost.image}
            featured
          />
          {otherPosts.map((post) => (
            <PublicationCard
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              image={post.image}
            />
          ))}
        </div>
      </section>

      <section id="comunidade" className="section-shell section-spacing">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="soft-card rounded-[2rem] p-7 sm:p-9 lg:p-10">
            <SectionTitle
              eyebrow="Depoimentos"
              title="Vínculos reais fortalecem a vida cultural da associação."
              description="Os relatos ajudam a comunicar pertencimento, acolhimento e a experiência de viver essa herança de forma ativa."
            />
          </article>

          <div className="grid gap-5">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                name={testimonial.name}
                quote={testimonial.quote}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-spacing">
        <div className="highlight-card rounded-[2.1rem] px-7 py-8 text-[var(--color-paper)] sm:px-9 sm:py-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-gold-strong)]">
                Faça parte dessa história
              </p>
              <h2 className="mt-4 font-heading text-4xl sm:text-5xl">
                Um convite para viver cultura, amizade e tradição em comunidade.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-[rgba(255,247,236,0.88)]">
                Entre em contato, acompanhe as publicações e aproxime-se da
                associação para participar de encontros, eventos e novos capítulos
                dessa história cultural em Juiz de Fora.
              </p>
            </div>

            <div id="contato" className="grid gap-4 rounded-[1.7rem] border border-white/12 bg-white/6 p-6">
              <a href={siteConfig.phoneHref} target="_blank" rel="noreferrer" className="contact-link">
                WhatsApp: {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="contact-link">
                Email: {siteConfig.email}
              </a>
              <p className="contact-link">{siteConfig.address}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className="ghost-button" href="/contato">
                  Ir para contato
                </Link>
                <Link className="ghost-button" href="/apoiador">
                  Quero apoiar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
