import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ApoiadorPage from "@/app/apoiador/page";
import AssociadoPage from "@/app/associado/page";

vi.mock("@/lib/supabase/associate-profile", async () => {
  return {
    getAssociateAreaData: vi.fn(async () => ({
      access: {
        email: "associado@example.com",
        profileId: "associate-profile-id",
        status: "authorized",
      },
      authMethods: {
        hasGoogle: true,
        hasPassword: false,
      },
      profile: {
        addressCity: "Juiz de Fora",
        addressComplement: "",
        addressNeighborhood: "Borboleta",
        addressNumber: "23",
        addressState: "MG",
        addressStreet: "Rua Braz Xavier Bastos Júnior",
        birthDate: "1993-08-14",
        category: "Heimweh",
        cep: "36035-160",
        cpf: "000.000.000-00",
        dependents: [],
        email: "associado@example.com",
        fullName: "Associado de Exemplo",
        nationality: "Brasileira",
        observation: "Observação de teste",
        phone: "(32) 99999-0000",
        photoUrl: null,
        profileId: "associate-profile-id",
        rg: "MG-00.000.000",
        termAccepted: true,
      },
    })),
  };
});

describe("placeholder routes", () => {
  it("renderiza a area do associado", async () => {
    render(await AssociadoPage());
    expect(
      screen.getByText(/^Dados do Associado$/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Senha e método de acesso/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Visualizar carteirinha/i }),
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
