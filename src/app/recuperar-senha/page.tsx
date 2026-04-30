import Link from "next/link";

export default function RecuperarSenhaPage() {
  return (
    <main className="section-shell flex-1 pb-16 pt-8">
      <section className="soft-card rounded-[2rem] p-8 sm:p-10 lg:p-12">
        <p className="section-eyebrow">Recuperação de Senha</p>
        <h1 className="section-title mt-4 max-w-3xl">
          Um espaço reservado para recuperar o acesso da conta.
        </h1>
        <p className="section-description mt-6 max-w-2xl">
          Esta tela vai receber o fluxo de redefinição de senha por email,
          integrado ao Supabase Auth, para atender associados que usam acesso
          por email e senha.
        </p>
        <p className="mt-5 text-base font-medium text-[var(--color-green-deep)]">
          Fluxo em definição. A recuperação por email será implementada aqui.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="primary-button" href="/entrar">
            Voltar para o login
          </Link>
          <Link className="secondary-button" href="/contato">
            Falar com a associacao
          </Link>
        </div>
      </section>
    </main>
  );
}
