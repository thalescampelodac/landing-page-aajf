import Link from "next/link";
import { adminHighlights, adminNavItems } from "@/lib/admin-content";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="hero-panel rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.9fr)] lg:items-start">
          <div>
            <p className="section-eyebrow">Área Administrativa</p>
            <h1 className="section-title mt-4 max-w-3xl">
              Um painel inicial para organizar gestão, permissões e operação
              interna.
            </h1>
            <p className="section-description mt-6 max-w-2xl">
              Esta área administrativa agora tem estrutura própria, navegação
              interna e espaço reservado para os módulos que vão sustentar a
              operação da associação.
            </p>
          </div>

          <div className="grid gap-3">
            {adminHighlights.map((item) => (
              <div key={item} className="metric-card">
                <p className="metric-label">Direção</p>
                <p className="metric-value">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <nav
          aria-label="Navegação administrativa"
          className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
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
