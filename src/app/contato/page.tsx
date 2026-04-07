import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site-content";

export default function ContatoPage() {
  return (
    <main className="section-shell mt-8 flex-1 pb-16">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="contact-card rounded-[2rem] p-8 text-[#fff7ef] shadow-2xl shadow-[#8b1f22]/12 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#f2ce7a]">
            Contato
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-6xl">
            Fale com a associação pelos canais oficiais.
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#f8eadc]">
            Reunimos aqui os links sociais oficiais, o contato institucional e um
            formulário simples que abre sua mensagem diretamente no email oficial da
            associação.
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 text-sm leading-7 text-[#fff5eb]">
            <a href={siteConfig.phoneHref} target="_blank" rel="noreferrer">
              WhatsApp: {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`}>Email: {siteConfig.email}</a>
            <p>Endereço: {siteConfig.address}</p>
            <a href={siteConfig.facebook} target="_blank" rel="noreferrer">
              Facebook oficial
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
              Instagram oficial
            </a>
          </div>
        </article>

        <article className="section-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b1f22]">
            Formulário oficial
          </p>
          <h2 className="mt-3 font-heading text-4xl text-[#163321] sm:text-5xl">
            Envie sua mensagem.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#425244]">
            Este formulário usa o email oficial da associação como destino. Ao
            enviar, o navegador abrirá sua aplicação de email com a mensagem já
            preenchida.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </article>
      </section>
    </main>
  );
}
