import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  it("renderiza os principais blocos da landing", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /Celebrando a cultura alemã com dança, história e união\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Grupo Schmetterling/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: /Um convite para viver cultura, amizade e tradição em comunidade\./i,
      }),
    ).toBeInTheDocument();
  });
});
