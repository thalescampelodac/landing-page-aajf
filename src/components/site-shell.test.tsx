import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/site-footer";
import { Header } from "@/components/site-header";
import { footerLinks, navItems, siteConfig } from "@/lib/site-content";

describe("site shell components", () => {
  it("renderiza o header com identidade e navegacao principal", () => {
    render(<Header />);

    expect(
      screen.getByRole("img", { name: `Logo da ${siteConfig.name}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ASSOCIADO" }),
    ).toHaveAttribute("href", "/associado");

    for (const item of navItems) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  it("renderiza o footer com links institucionais e contatos", () => {
    render(<Footer />);

    expect(screen.getByText(siteConfig.legalName)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: siteConfig.phone }),
    ).toHaveAttribute("href", siteConfig.phoneHref);
    expect(
      screen.getByRole("link", { name: siteConfig.email }),
    ).toHaveAttribute("href", `mailto:${siteConfig.email}`);

    for (const item of footerLinks) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });
});
