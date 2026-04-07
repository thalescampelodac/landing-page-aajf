import Image from "next/image";
import { posts } from "@/lib/site-content";

export default function PublicacoesPage() {
  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="section-card rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
          Publicações
        </p>
        <h1 className="mt-3 font-heading text-4xl text-[#163321] sm:text-6xl">
          Notícias e conteúdos da associação.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[#425244]">
          Esta área organiza os conteúdos institucionais já presentes no site atual e
          abre caminho para um acervo mais completo com memória, agenda, notícias e
          cobertura de eventos.
        </p>
      </section>

      <section className="mt-8 grid gap-6">
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className="section-card overflow-hidden rounded-[2rem] lg:grid lg:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="relative min-h-[260px] bg-[linear-gradient(135deg,#20452e_0%,#8b1e28_45%,#d6b06a_100%)]">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : null}
            </div>

            <div className="p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b1f22]">
                {post.featured ? "Destaque" : "Publicação"}
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-tight text-[#163321]">
                {post.title}
              </h2>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8b7d]">
                {post.date}
              </p>
              <div className="mt-6 grid gap-4 text-base leading-8 text-[#425244]">
                {post.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
