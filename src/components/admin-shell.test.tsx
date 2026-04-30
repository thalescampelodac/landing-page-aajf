import { render, screen } from "@testing-library/react";
import { AdminShell } from "@/components/admin-shell";

describe("AdminShell", () => {
  it("renderiza a navegacao administrativa base", () => {
    render(
      <AdminShell>
        <div>Conteudo interno</div>
      </AdminShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: /Um painel inicial para organizar gestão, permissões e operação interna/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /Navegação administrativa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Associados/i }),
    ).toHaveAttribute("href", "/admin/associados");
  });
});
