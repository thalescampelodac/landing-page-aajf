import Image from "next/image";
import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <header className="section-shell pt-5 sm:pt-8">
      <div className="hero-card rounded-[2rem] px-6 py-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/60 bg-white shadow-lg shadow-[#143421]/10 sm:h-20 sm:w-20">
              <Image
                src="/images/brand/logo.png"
                alt={`Logo da ${siteConfig.name}`}
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>

            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#8b1f22] sm:text-xs">
                {siteConfig.legalName}
              </p>
              <p className="mt-2 max-w-xl font-heading text-2xl leading-none text-[#163321] sm:text-4xl">
                {siteConfig.name}
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-3 text-sm font-medium text-[#23402c]">
            {navItems.map((item) => (
              <Link key={item.href} className="nav-pill" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
