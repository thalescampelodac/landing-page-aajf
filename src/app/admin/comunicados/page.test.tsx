import { render, screen } from "@testing-library/react";
import AdminComunicadosPage from "@/app/admin/comunicados/page";

const { getAdminPublicationsDataMock, redirectMock } = vi.hoisted(() => ({
  getAdminPublicationsDataMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/admin-publications", () => ({
  getAdminPublicationsData: getAdminPublicationsDataMock,
}));

vi.mock("@/components/admin-publications-manager", () => ({
  AdminPublicationsManager: ({
    publications,
  }: {
    publications: Array<{ title: string }>;
  }) => (
    <div>
      <p>Manager mock</p>
      {publications.map((publication) => (
        <span key={publication.title}>{publication.title}</span>
      ))}
    </div>
  ),
}));

describe("AdminComunicadosPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getAdminPublicationsDataMock.mockReset();
  });

  it("redireciona usuario sem sessao para o login administrativo", async () => {
    getAdminPublicationsDataMock.mockResolvedValue({
      access: { status: "unauthenticated" },
    });

    await AdminComunicadosPage();

    expect(redirectMock).toHaveBeenCalledWith("/entrar?next=/admin/comunicados");
  });

  it("renderiza modulo de publicacoes para admin autorizado", async () => {
    getAdminPublicationsDataMock.mockResolvedValue({
      access: {
        email: "admin@example.com",
        profileId: "profile-admin",
        role: "super_admin",
        status: "authorized",
      },
      publications: [
        {
          authorName: "Equipe AAJF",
          body: "Corpo da notícia",
          category: "Eventos",
          coverImageAlt: "Capa da notícia",
          coverImagePath: "publications/cover.png",
          coverImageUrl: "https://example.com/cover.png",
          createdAt: "2026-05-05T10:00:00.000Z",
          excerpt: "Resumo curto",
          featured: true,
          id: "publication-1",
          publishedAt: "2026-05-05T10:00:00.000Z",
          seoDescription: "SEO description",
          seoTitle: "SEO title",
          slug: "festa-de-maio",
          status: "published",
          title: "Festa de Maio",
          updatedAt: "2026-05-05T12:00:00.000Z",
        },
      ],
    });

    render(await AdminComunicadosPage());

    expect(
      screen.getByRole("heading", {
        name: /Publicações e notícias/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Manager mock/i)).toBeInTheDocument();
    expect(screen.getByText(/Festa de Maio/i)).toBeInTheDocument();
  });

  it("renderiza fallback amigavel quando o acervo falha ao carregar", async () => {
    getAdminPublicationsDataMock.mockRejectedValue(
      new Error("permission denied for table publications"),
    );

    render(await AdminComunicadosPage());

    expect(
      screen.getByRole("heading", {
        name: /O módulo ainda não conseguiu acessar o acervo editorial/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/permission denied for table publications/i),
    ).toBeInTheDocument();
  });
});
