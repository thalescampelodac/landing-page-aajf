import { render, screen } from "@testing-library/react";
import AdminPage from "@/app/admin/page";

const { getAdminAccessMock, redirectMock } = vi.hoisted(() => ({
  getAdminAccessMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/access", () => ({
  getAdminAccess: getAdminAccessMock,
}));

vi.mock("@/app/entrar/actions", () => ({
  signOut: vi.fn(),
}));

describe("Admin page", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getAdminAccessMock.mockReset();
  });

  it("redireciona usuario sem sessao para o login administrativo", async () => {
    getAdminAccessMock.mockResolvedValue({ status: "unauthenticated" });

    await AdminPage();

    expect(redirectMock).toHaveBeenCalledWith("/entrar?next=/admin");
  });

  it("renderiza bloqueio para usuario autenticado sem permissao", async () => {
    getAdminAccessMock.mockResolvedValue({
      email: "pessoa@example.com",
      status: "denied",
    });

    render(await AdminPage());

    expect(
      screen.getByRole("heading", {
        name: /Acesso administrativo não autorizado/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pessoa@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sair da conta/i }),
    ).toBeInTheDocument();
  });

  it("renderiza area administrativa para admin ativo", async () => {
    getAdminAccessMock.mockResolvedValue({
      email: "admin@example.com",
      role: "super_admin",
      status: "authorized",
    });

    render(await AdminPage());

    expect(
      screen.getByRole("heading", { name: /Bem-vindo à administração/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/super_admin/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sair da conta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Associados e status/i }),
    ).toHaveAttribute("href", "/admin/associados");
    expect(
      screen.getByRole("link", { name: /Permissões/i }),
    ).toHaveAttribute("href", "/admin/permissoes");
  });
});
