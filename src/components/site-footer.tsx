import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="section-shell pb-10 pt-6">
      <div className="site-frame rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="section-eyebrow">{siteConfig.legalName}</p>
            <h2 className="mt-4 font-heading text-3xl text-[var(--color-ink)] sm:text-4xl">
              {siteConfig.name}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
              Preservando e difundindo as tradições germânicas por meio da cultura,
              da dança e da confraternização em Juiz de Fora/MG.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-deep)]">
              Navegação
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-gold-deep)]">
              Contato e redes
            </p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-muted)]">
              <a href={siteConfig.phoneHref} target="_blank" rel="noreferrer">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              <p>{siteConfig.address}</p>
              <a href={siteConfig.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
