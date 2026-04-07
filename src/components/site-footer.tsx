import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="section-shell mt-8 pb-10">
      <div className="section-card rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#8b1f22]">
              {siteConfig.legalName}
            </p>
            <h2 className="mt-3 font-heading text-3xl text-[#163321]">
              {siteConfig.name}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#425244]">
              Preservando e difundindo as tradições germânicas por meio da cultura,
              da dança e da confraternização em Juiz de Fora/MG.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#b08f39]">
              Páginas
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[#425244]">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#b08f39]">
              Contato e redes
            </p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[#425244]">
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
