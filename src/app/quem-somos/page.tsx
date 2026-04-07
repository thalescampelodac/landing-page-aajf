import { values } from "@/lib/site-content";

export default function QuemSomosPage() {
  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="section-card rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
          Quem Somos
        </p>
        <h1 className="mt-3 font-heading text-4xl text-[#163321] sm:text-6xl">
          Tradição germânica preservada com cultura, dança e convivência.
        </h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <p className="text-base leading-8 text-[#425244]">
            A Associação Alemã de Juiz de Fora/MG, oficialmente Associação Cultural
            e Recreativa Brasil-Alemanha, tem como missão preservar e difundir as
            tradições germânicas por meio da cultura, da dança e da
            confraternização.
          </p>
          <p className="text-base leading-8 text-[#425244]">
            Nosso compromisso é manter viva a rica herança alemã, promovendo a união
            entre descendentes e admiradores da cultura por meio de encontros,
            apresentações e iniciativas que valorizam essa memória.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {values.map((item) => (
          <article
            key={item.title}
            className="section-card rounded-[1.75rem] p-6 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08f39]">
              Pilar
            </p>
            <h2 className="mt-3 font-heading text-3xl text-[#163321]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#425244]">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="section-card mt-8 rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
          Grupo Schmetterling
        </p>
        <h2 className="mt-3 font-heading text-4xl text-[#163321] sm:text-5xl">
          O grande destaque da associação.
        </h2>
        <p className="mt-6 max-w-4xl text-base leading-8 text-[#425244]">
          O Grupo de Danças Folclóricas Schmetterling encanta o público com
          apresentações cheias de alegria e tradição. Através da dança, a associação
          leva a história e os costumes alemães para eventos culturais, festas
          típicas e celebrações, sempre com figurinos autênticos e coreografias
          vibrantes.
        </p>
      </section>
    </main>
  );
}
