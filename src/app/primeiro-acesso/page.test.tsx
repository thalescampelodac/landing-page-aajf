import { render, screen } from "@testing-library/react";
import PrimeiroAcessoPage from "@/app/primeiro-acesso/page";

vi.mock("@/components/first-access-password-form", () => ({
  FirstAccessPasswordForm: () => <div>Formulario de primeiro acesso</div>,
}));

describe("PrimeiroAcessoPage", () => {
  it("explica o fluxo de definicao de senha do convite", () => {
    render(<PrimeiroAcessoPage />);

    expect(
      screen.getByRole("heading", {
        name: /Defina sua senha para concluir o acesso administrativo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Formulario de primeiro acesso/i)).toBeInTheDocument();
  });
});
