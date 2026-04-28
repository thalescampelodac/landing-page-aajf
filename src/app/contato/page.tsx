import { SectionTitle } from "@/components/section-title";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site-content";

export default function ContatoPage() {
  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="highlight-card rounded-[2rem] p-8 text-[var(--color-paper)] shadow-[0_28px_80px_rgba(17,27,25,0.16)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--color-gold-strong)]">
            Contato
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-6xl">
            Fale com a associacao pelos canais oficiais.
          </h1>
          <p className="mt-5 text-sm leading-7 text-[rgba(255,247,236,0.86)]">
            Reunimos aqui os links sociais oficiais, o contato institucional e um
            formulario simples que abre sua mensagem diretamente no email oficial da
            associacao.
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 text-sm leading-7 text-[rgba(255,247,236,0.92)]">
            <a href={siteConfig.phoneHref} target="_blank" rel="noreferrer">
              WhatsApp: {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`}>Email: {siteConfig.email}</a>
            <p>Endereco: {siteConfig.address}</p>
            <a href={siteConfig.facebook} target="_blank" rel="noreferrer">
              Facebook oficial
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
              Instagram oficial
            </a>
          </div>
        </article>

        <article className="soft-card rounded-[2rem] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Formulario oficial"
            title="Envie sua mensagem."
            description="Este formulario usa o email oficial da associacao como destino. Ao enviar, o navegador abrira sua aplicacao de email com a mensagem ja preenchida."
          />
          <div className="mt-8">
            <ContactForm />
          </div>
        </article>
      </section>
    </main>
  );
}
