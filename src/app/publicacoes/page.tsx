import Image from "next/image";
import { SectionTitle } from "@/components/section-title";
import {
  formatPublicationDate,
  getPublishedPublications,
} from "@/lib/supabase/publications";

export default async function PublicacoesPage() {
  const posts = await getPublishedPublications();

  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10">
        <SectionTitle
          eyebrow="Publicacoes"
          title="Noticias e conteudos da associacao."
          description="Esta area organiza os conteudos institucionais ja presentes no site atual e abre caminho para um acervo mais completo com memoria, agenda, noticias e cobertura de eventos."
        />
      </section>

      <section className="mt-8 grid gap-6">
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className="soft-card overflow-hidden rounded-[2rem] lg:grid lg:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="relative min-h-[260px] bg-[linear-gradient(135deg,#20452e_0%,#8b1e28_45%,#d6b06a_100%)]">
              {post.coverImageUrl ? (
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : null}
            </div>

            <div className="p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-red)]">
                {post.featured ? "Destaque" : "Publicacao"}
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-tight text-[var(--color-ink)]">
                {post.title}
              </h2>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-strong)]">
                {formatPublicationDate(post.publishedAt)}
              </p>
              <div className="mt-6 grid gap-4 text-base leading-8 text-[var(--color-muted)]">
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
