export default function AssociadoPage() {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Área do Associado</p>
        <h1 className="section-title mt-4 max-w-3xl">
          Um espaço futuro para acompanhar a vida da associação.
        </h1>
        <p className="section-description mt-6 max-w-2xl">
          Esta rota foi preparada para reunir autenticação, dados cadastrais,
          comunicados e recursos exclusivos para associados.
        </p>
        <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
          Área em construção. Em breve, este espaço estará disponível.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.6rem] border border-[rgba(26,61,46,0.12)] bg-white/70 p-6">
            <p className="section-eyebrow">Dados do Associado</p>
            <h2 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
              Cadastro e informações da conta
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
              Aqui vamos definir os campos do perfil do associado, histórico de
              vínculo, formas de contato e demais dados que a associação decidir
              manter neste ambiente.
            </p>
          </article>

          <article className="rounded-[1.6rem] border border-[rgba(26,61,46,0.12)] bg-white/70 p-6">
            <p className="section-eyebrow">Segurança da Conta</p>
            <h2 className="mt-3 text-2xl font-heading text-[var(--color-green-deep)]">
              Alteração de senha
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-green-deep)]">
              A alteração de senha ficará junto dos dados do associado. Esse
              espaço também deve concentrar orientações de acesso, recuperação e
              reforço de segurança da conta.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
