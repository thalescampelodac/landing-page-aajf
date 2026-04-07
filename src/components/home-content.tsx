import Image from "next/image";
import Link from "next/link";
import {
  heroBadges,
  posts,
  siteConfig,
  testimonials,
  values,
} from "@/lib/site-content";

export function HomeContent() {
  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <main className="flex-1 pb-16 text-[#233127]">
      <section className="section-shell mt-8">
        <div className="hero-card overflow-hidden rounded-[2rem]">
          <div className="grid gap-10 px-6 pb-8 pt-8 sm:px-8 sm:pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-12">
            <div className="pt-2">
              <div className="flex flex-wrap gap-3">
                {heroBadges.map((badge, index) => (
                  <span
                    key={badge}
                    className={
                      index === 0
                        ? "flag-pill border-[#2f6843]/15 bg-[#eef6ef] text-[#2f6843]"
                        : index === 1
                          ? "flag-pill border-[#b08f39]/20 bg-[#fff7dd] text-[#896813]"
                          : "flag-pill border-[#9e2020]/15 bg-[#fff0ef] text-[#8b1f22]"
                    }
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.32em] text-[#8b1f22]">
                Seja bem-vindo
              </p>
              <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.94] text-[#163321] sm:text-6xl lg:text-7xl">
                Celebrando a cultura alemã com dança, história e união.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#425244] sm:text-lg">
                A {siteConfig.name} tem como missão preservar e difundir as tradições
                germânicas por meio da cultura, da dança e da confraternização,
                aproximando gerações e admiradores dessa herança.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/publicacoes" className="primary-button">
                  Ver publicações
                </Link>
                <Link href="/quem-somos" className="secondary-button">
                  Conhecer a associação
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="metric-card">
                  <p className="metric-label">Destaque cultural</p>
                  <p className="metric-value">Grupo Schmetterling</p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Atuação</p>
                  <p className="metric-value">Juiz de Fora/MG</p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Essência</p>
                  <p className="metric-value">Tradição e convivência</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2rem] bg-[linear-gradient(135deg,rgba(22,51,33,0.10),rgba(221,179,95,0.16),rgba(139,31,34,0.12))]" />
              <div className="overflow-hidden rounded-[2rem] border border-white/65 bg-[#fffaf4] shadow-2xl shadow-[#163321]/10">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={featuredPost.image!}
                    alt="Grupo Schmetterling em apresentação cultural"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,27,21,0)_25%,rgba(16,27,21,0.72)_100%)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-[#fff8ef]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f0cb78]">
                      Publicação em destaque
                    </p>
                    <h2 className="mt-3 font-heading text-3xl leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-[#f5ead7]">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="section-card rounded-[2rem] p-8 sm:p-10">
            <p className="ornament text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
              Quem Somos
            </p>
            <h2 className="mt-8 font-heading text-4xl text-[#163321] sm:text-5xl">
              Uma associação dedicada a manter viva a herança alemã.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#425244]">
              A {siteConfig.name}, oficialmente {siteConfig.legalName}, preserva e
              difunde as tradições germânicas por meio da cultura, da dança e da
              confraternização. Nosso compromisso é fortalecer a união entre
              descendentes e admiradores da cultura alemã.
            </p>
            <p className="mt-4 text-base leading-8 text-[#425244]">
              Um dos grandes destaques da associação é o Grupo de Danças Folclóricas
              Schmetterling, que encanta o público com apresentações marcadas por
              alegria, autenticidade e respeito às tradições.
            </p>
            <Link href="/quem-somos" className="secondary-button mt-8 inline-flex">
              Saber mais
            </Link>
          </article>

          <div className="grid gap-6">
            {values.map((item) => (
              <article
                key={item.title}
                className="section-card rounded-[1.75rem] p-6 sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08f39]">
                  Pilar
                </p>
                <h3 className="mt-3 font-heading text-3xl text-[#163321]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#425244]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="section-card rounded-[2rem] p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b08f39]">
                Publicações
              </p>
              <h2 className="mt-3 font-heading text-4xl text-[#163321] sm:text-5xl">
                Conteúdo institucional com mais presença visual.
              </h2>
            </div>
            <Link href="/publicacoes" className="secondary-button">
              Ver todas
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <article className="overflow-hidden rounded-[1.8rem] border border-[#24402c]/10 bg-[#fffdf8]">
              <div className="relative aspect-[16/10]">
                <Image
                  src={featuredPost.image!}
                  alt="Integrantes do Grupo Schmetterling"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b1f22]">
                  Em destaque
                </p>
                <h3 className="mt-3 font-heading text-3xl leading-tight text-[#163321]">
                  {featuredPost.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#425244]">
                  {featuredPost.excerpt}
                </p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8b7d]">
                  {featuredPost.date}
                </p>
              </div>
            </article>

            {secondaryPosts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col justify-between rounded-[1.8rem] border border-[#24402c]/10 bg-[linear-gradient(180deg,#fffdf8_0%,#f8f0e6_100%)] p-6 sm:p-7"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b1f22]">
                    Publicação
                  </p>
                  <h3 className="mt-3 font-heading text-3xl leading-tight text-[#163321]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#425244]">
                    {post.excerpt}
                  </p>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8b7d]">
                  {post.date}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="section-card rounded-[2rem] p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
              Depoimentos
            </p>
            <h2 className="mt-3 font-heading text-4xl text-[#163321] sm:text-5xl">
              Experiências que reforçam pertencimento.
            </h2>
            <div className="mt-8 grid gap-4">
              {testimonials.map((item) => (
                <blockquote
                  key={item.name}
                  className="rounded-[1.5rem] border border-[#284531]/10 bg-[#fffdf8] p-5"
                >
                  <p className="text-sm leading-7 text-[#425244]">"{item.quote}"</p>
                  <footer className="mt-3 text-sm font-semibold text-[#163321]">
                    {item.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </article>

          <article className="contact-card rounded-[2rem] p-8 text-[#fff7ef] shadow-2xl shadow-[#8b1f22]/12 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f2ce7a]">
              Contato
            </p>
            <h2 className="mt-3 font-heading text-4xl sm:text-5xl">
              Presença cultural, acolhimento e diálogo.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#f8eadc]">
              A nova estrutura já integra os canais oficiais da associação e está
              pronta para crescer com novas páginas, galeria e conteúdos futuros.
            </p>

            <div className="mt-8 space-y-4 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 text-sm leading-7 text-[#fff5eb]">
              <a href={siteConfig.phoneHref} target="_blank" rel="noreferrer">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              <p>{siteConfig.address}</p>
              <a href={siteConfig.facebook} target="_blank" rel="noreferrer">
                Facebook oficial
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
                Instagram oficial
              </a>
            </div>

            <Link href="/contato" className="primary-button mt-6 inline-flex">
              Ir para contato
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
