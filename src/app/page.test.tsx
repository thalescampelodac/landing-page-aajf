import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

vi.mock("@/lib/supabase/publications", () => ({
  formatPublicationDate: vi.fn(() => "18 de janeiro de 2023"),
  getPublishedPublications: vi.fn(async () => [
    {
      authorName: "Associação Alemã de Juiz de Fora",
      body: ["Texto de teste"],
      category: null,
      coverImageUrl: "/images/publicacoes/1/162257-jpg.webp",
      createdAt: null,
      excerpt: "Resumo de teste",
      featured: true,
      id: "seed-1",
      publishedAt: "2023-01-18T00:00:00.000Z",
      seoDescription: null,
      seoTitle: null,
      slug: "tradicao-em-movimento",
      status: "published",
      title: "Grupo Schmetterling",
      updatedAt: null,
    },
    {
      authorName: "Associação Alemã de Juiz de Fora",
      body: ["Texto secundário"],
      category: null,
      coverImageUrl: null,
      createdAt: null,
      excerpt: "Outro resumo",
      featured: false,
      id: "seed-2",
      publishedAt: "2023-01-18T00:00:00.000Z",
      seoDescription: null,
      seoTitle: null,
      slug: "outra-publicacao",
      status: "published",
      title: "Outra publicação",
      updatedAt: null,
    },
  ]),
}));

describe("Home page", () => {
  it("renderiza os principais blocos da landing", async () => {
    render(await Home());

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
