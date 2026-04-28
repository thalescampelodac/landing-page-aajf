import Image from "next/image";
import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site-content";

export function Header() {
  return (
    <header className="section-shell pt-4 sm:pt-6">
      <div className="site-frame rounded-[2rem] px-5 py-5 sm:px-7 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/60 bg-white/85 shadow-[0_18px_35px_rgba(16,25,24,0.12)] sm:h-[4.5rem] sm:w-[4.5rem]">
                <Image
                  src="/images/brand/logo.png"
                  alt={`Logo da ${siteConfig.name}`}
                  fill
                  className="object-contain p-1.5"
                  priority
                  sizes="72px"
                />
              </div>

              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-red)] sm:text-xs">
                  {siteConfig.legalName}
                </p>
                <p className="mt-2 max-w-xl font-heading text-2xl leading-none text-[var(--color-ink)] sm:text-[2rem]">
                  {siteConfig.name}
                </p>
              </div>
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link className="secondary-button" href="/associado">
                ASSOCIADO
              </Link>
              <Link className="secondary-button" href="/admin">
                ADMINISTRAÇÃO
              </Link>
              <Link className="primary-button" href="/apoiador">
                APOIADOR
              </Link>
            </div>
          </div>

          <nav aria-label="Navegacao principal" className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link key={item.href} className="nav-chip" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
