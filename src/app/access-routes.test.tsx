import { render, screen } from "@testing-library/react";
import AdminPage from "@/app/admin/page";
import ApoiadorPage from "@/app/apoiador/page";
import AssociadoPage from "@/app/associado/page";

describe("placeholder routes", () => {
  it("renderiza a area do associado", () => {
    render(<AssociadoPage />);
    expect(screen.getByText(/Área em construção/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /vida da associação/i }),
    ).toBeInTheDocument();
  });

  it("renderiza a area administrativa", () => {
    render(<AdminPage />);
    expect(
      screen.getByRole("heading", { name: /Gestão interna pronta/i }),
    ).toBeInTheDocument();
  });

  it("renderiza a area do apoiador", () => {
    render(<ApoiadorPage />);
    expect(
      screen.getByRole("heading", {
        name: /Um ponto de entrada para quem deseja apoiar/i,
      }),
    ).toBeInTheDocument();
  });
});
