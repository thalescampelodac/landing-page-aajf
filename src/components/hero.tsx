import Image from "next/image";
import Link from "next/link";
import {
  communityMetrics,
  heroHighlights,
  siteConfig,
} from "@/lib/site-content";
import type { PublicationRecord } from "@/lib/supabase/publications";

export function Hero({ featuredPost }: { featuredPost: PublicationRecord }) {
  const coverImageUrl = featuredPost.coverImageUrl?.trim() || null;
  const coverImageAlt = featuredPost.coverImageAlt?.trim() || featuredPost.title;

  return (
    <section id="inicio" className="section-shell pt-6 sm:pt-8">
      <div className="hero-panel overflow-hidden rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              {heroHighlights.map((item) => (
                <span key={item} className="badge-chip">
                  {item}
                </span>
              ))}
            </div>

            <p className="section-eyebrow mt-7">Associação Cultural e Recreativa Brasil-Alemanha</p>
            <h1 className="hero-title mt-4">
              Celebrando a cultura alemã com dança, história e união.
            </h1>
            <p className="section-description mt-6 max-w-2xl">
              A {siteConfig.name} convida familias, descendentes e admiradores a
              viver uma experiência cultural acolhedora, elegante e cheia de
              memória compartilhada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="primary-button" href="/#quem-somos">
                Conheça a associação
              </Link>
              <Link className="secondary-button" href="/contato">
                Quero participar
              </Link>
              <Link className="secondary-button" href="/publicacoes">
                Ver publicacoes
              </Link>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {communityMetrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 hidden h-36 w-36 rounded-full bg-[rgba(183,31,42,0.14)] blur-3xl lg:block" />
            <div className="absolute -right-6 bottom-4 hidden h-36 w-36 rounded-full bg-[rgba(228,190,112,0.2)] blur-3xl lg:block" />

            <div className="relative overflow-hidden rounded-[2.1rem] border border-white/55 bg-[rgba(255,250,245,0.74)] p-4 shadow-[0_32px_80px_rgba(19,29,28,0.16)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.7rem]">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
                    alt={coverImageAlt}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,188,90,0.24),transparent_36%),linear-gradient(135deg,rgba(14,23,22,0.98),rgba(129,27,31,0.92),rgba(228,190,112,0.72))]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,27,25,0.04),rgba(18,27,25,0.78))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-gold-strong)]">
                    {featuredPost.featured ? "Publicação em destaque" : "Publicação"}
                  </p>
                  <h2 className="mt-3 font-heading text-3xl leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[rgba(255,247,238,0.9)]">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.5rem] bg-[rgba(255,247,238,0.88)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-red)]">
                    Missão
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    Preservar e difundir tradições germânicas por meio da cultura,
                    da dança e da confraternização.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--color-green-deep)] p-5 text-[var(--color-paper)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold-strong)]">
                    Convite
                  </p>
                  <p className="mt-3 text-sm leading-7">
                    Um lugar para quem deseja pertencer, apoiar e celebrar a
                    cultura alemã em comunidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
