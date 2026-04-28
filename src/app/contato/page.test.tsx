import { render, screen } from "@testing-library/react";
import ContatoPage from "@/app/contato/page";
import { siteConfig } from "@/lib/site-content";

describe("Contato page", () => {
  it("renderiza os canais oficiais e o formulario", () => {
    render(<ContatoPage />);

    expect(
      screen.getByRole("heading", {
        name: /Fale com a associacao pelos canais oficiais\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `WhatsApp: ${siteConfig.phone}` }),
    ).toHaveAttribute("href", siteConfig.phoneHref);
    expect(
      screen.getByRole("link", { name: `Email: ${siteConfig.email}` }),
    ).toHaveAttribute("href", `mailto:${siteConfig.email}`);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Enviar para o email oficial/i }),
    ).toBeInTheDocument();
  });
});
