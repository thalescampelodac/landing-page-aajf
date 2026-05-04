import Link from "next/link";
import { adminNavItems } from "@/lib/admin-content";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="hero-panel rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Área Administrativa</p>
        <nav
          aria-label="Navegação administrativa"
          className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-[1.4rem] border border-[rgba(23,54,45,0.1)] bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-[rgba(154,31,43,0.2)]"
              href={item.href}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-red)]">
                {item.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {item.description}
              </p>
            </Link>
          ))}
        </nav>
      </section>

      <div className="mt-6">{children}</div>
    </main>
  );
}
