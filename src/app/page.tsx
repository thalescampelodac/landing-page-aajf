export default function Home() {
  const highlights = [
    {
      title: "Danca folclorica com presenca viva",
      text: "O Grupo Schmetterling segue como o coracao da associacao, levando figurinos, memoria e alegria para eventos culturais da cidade.",
    },
    {
      title: "Memoria e identidade em Juiz de Fora",
      text: "A proposta da nova landing valoriza a heranca alema sem parecer datada, aproximando historia, comunidade e futuros associados.",
    },
    {
      title: "Base pronta para crescer",
      text: "A estrutura em Next.js permite evoluir com paginas de publicacoes, agenda, galeria, formulario e SEO local sem refazer o projeto.",
    },
  ];

  const posts = [
    "Tradicao em Movimento: Conheca o Grupo Schmetterling",
    "Preservando a Cultura Alema em Juiz de Fora",
    "Faca Parte da Nossa Historia",
  ];

  const testimonials = [
    {
      name: "Mariana Kohler",
      quote:
        "Participar da associacao me reconectou com minhas raizes e criou amizades que hoje fazem parte da minha rotina.",
    },
    {
      name: "Fernando Bauer",
      quote:
        "Os eventos conseguem equilibrar tradicao, acolhimento e orgulho cultural de um jeito muito bonito.",
    },
    {
      name: "Carla Stein",
      quote:
        "A danca, a convivio e o cuidado com a historia fazem a gente sentir que faz parte de algo maior.",
    },
  ];

  return (
    <main className="flex-1 pb-16 text-[#1f2a1f]">
      <section className="section-shell pt-6 sm:pt-8">
        <div className="section-card overflow-hidden rounded-[2rem]">
          <header className="flex flex-col gap-5 border-b border-[#284531]/10 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b1e28]">
                Associacao Cultural e Recreativa Brasil-Alemanha
              </p>
              <h1 className="mt-3 font-heading text-3xl leading-none text-[#16331d] sm:text-4xl">
                Associacao Alema de Juiz de Fora
              </h1>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm text-[#284531]">
              <a className="rounded-full border border-[#284531]/10 px-4 py-2" href="#quem-somos">
                Quem somos
              </a>
              <a className="rounded-full border border-[#284531]/10 px-4 py-2" href="#publicacoes">
                Publicacoes
              </a>
              <a className="rounded-full border border-[#284531]/10 px-4 py-2" href="#contato">
                Contato
              </a>
            </nav>
          </header>

          <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#b48a3f]">
                Cultura, memoria e comunidade
              </p>
              <h2 className="max-w-3xl font-heading text-5xl leading-[0.95] text-[#16331d] sm:text-6xl lg:text-7xl">
                Uma nova fase digital para celebrar as tradicoes germanicas em Juiz de Fora.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#3d4c3e] sm:text-lg">
                Esta releitura parte do conteudo do site atual, mas adota uma presenca
                visual mais elegante, calorosa e preparada para crescer com agenda,
                publicacoes, galeria e captacao de novos participantes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#publicacoes"
                  className="rounded-full bg-[#16331d] px-6 py-3 text-center text-sm font-semibold text-[#fffaf1] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Ver estrutura da landing
                </a>
                <a
                  href="#contato"
                  className="rounded-full border border-[#16331d]/15 bg-[#fffaf1]/70 px-6 py-3 text-center text-sm font-semibold text-[#16331d]"
                >
                  Planejar proximos blocos
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] bg-[#16331d] p-6 text-[#fff7ea] shadow-2xl shadow-[#16331d]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-[#ddb35f]">
                  Direcao recomendada
                </p>
                <p className="mt-4 font-heading text-3xl">
                  Next.js + Tailwind + TypeScript
                </p>
                <p className="mt-4 text-sm leading-7 text-[#e7dac1]">
                  Melhor equilibrio entre performance, SEO local, manutencao e evolucao
                  editorial para uma associacao com conteudo institucional.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-[#284531]/10 bg-[#fff7ea] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#8b1e28]">
                  Proximo passo natural
                </p>
                <p className="mt-3 text-sm leading-7 text-[#3d4c3e]">
                  Integrar imagens reais, formularios de contato e uma area de publicacoes
                  conectada a CMS ou Markdown, sem trocar a base do projeto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quem-somos" className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="section-card rounded-[2rem] p-8 sm:p-10">
            <p className="ornament text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1e28]">
              Quem Somos
            </p>
            <h3 className="mt-8 font-heading text-4xl text-[#16331d] sm:text-5xl">
              Preservar a cultura alema com presenca contemporanea.
            </h3>
            <p className="mt-6 text-base leading-8 text-[#3d4c3e]">
              A associacao nasce do encontro entre memoria cultural, danca folclorica,
              convivio e formacao de comunidade. Nesta nova versao, o discurso institucional
              ganha mais clareza, hierarquia visual e espaco para contar a historia da entidade.
            </p>
          </article>

          <div className="grid gap-6">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="section-card rounded-[1.75rem] p-6 sm:p-8"
              >
                <h4 className="font-heading text-3xl text-[#16331d]">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-[#405241]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="publicacoes" className="section-shell mt-8">
        <div className="section-card rounded-[2rem] p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b48a3f]">
                Publicacoes
              </p>
              <h3 className="mt-3 font-heading text-4xl text-[#16331d] sm:text-5xl">
                Conteudo editorial com mais relevancia e leitura melhor.
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#405241]">
              O site atual ja traz tres entradas institucionais. Aqui, elas viram uma grade
              inicial que pode crescer para noticias, agenda, memoria e cobertura de eventos.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post}
                className="overflow-hidden rounded-[1.75rem] border border-[#284531]/10 bg-[#fffdf8]"
              >
                <div className="h-44 bg-[linear-gradient(135deg,#20452e_0%,#8b1e28_45%,#d6b06a_100%)]" />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b1e28]">
                    Publicacao 0{index + 1}
                  </p>
                  <h4 className="mt-3 font-heading text-3xl leading-tight text-[#16331d]">
                    {post}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-[#405241]">
                    Bloco pronto para resumo, imagem destacada e CTA de leitura, mantendo o
                    foco em descoberta e SEO.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="section-card rounded-[2rem] p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1e28]">
              Depoimentos
            </p>
            <h3 className="mt-3 font-heading text-4xl text-[#16331d] sm:text-5xl">
              Vozes que reforcam pertencimento.
            </h3>
            <div className="mt-8 grid gap-4">
              {testimonials.map((item) => (
                <blockquote
                  key={item.name}
                  className="rounded-[1.5rem] border border-[#284531]/10 bg-[#fffdf8] p-5"
                >
                  <p className="text-sm leading-7 text-[#405241]">"{item.quote}"</p>
                  <footer className="mt-3 text-sm font-semibold text-[#16331d]">
                    {item.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </article>

          <article
            id="contato"
            className="rounded-[2rem] bg-[#8b1e28] p-8 text-[#fff5eb] shadow-2xl shadow-[#8b1e28]/15 sm:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f0c773]">
              Contato
            </p>
            <h3 className="mt-3 font-heading text-4xl sm:text-5xl">
              Base pronta para a proxima iteracao.
            </h3>
            <p className="mt-5 text-sm leading-7 text-[#f8e7d5]">
              Ja deixamos o projeto montado para receber conteudo real, imagens da associacao,
              mapa, links sociais e formulario institucional.
            </p>

            <div className="mt-8 space-y-4 text-sm leading-7 text-[#fff5eb]">
              <p>(32) 99904-0629</p>
              <p>contato@associacaoalemajfmg.com.br</p>
              <p>Rua Braz Xavier Bastos Junior, 23, Borboleta, Juiz de Fora/MG</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f0c773]">
                Sugestao tecnica alternativa
              </p>
              <p className="mt-3 text-sm leading-7 text-[#fbeee3]">
                Se quisermos algo ainda mais simples e estatico, poderiamos usar Astro.
                Mesmo assim, para este projeto eu manteria Next.js pela facilidade de crescer
                sem migracao futura.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
