import Link from "next/link";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="section-title mt-4 max-w-3xl">{title}</h1>
        <p className="section-description mt-6 max-w-2xl">{description}</p>
        <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
          Área em construção. Em breve, este espaço estará disponível.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="primary-button" href="/">
            Voltar para a pagina inicial
          </Link>
          <Link className="secondary-button" href="/contato">
            Falar com a associacao
          </Link>
        </div>
      </section>
    </main>
  );
}
