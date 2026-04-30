import { render, screen } from "@testing-library/react";
import AdminPermissoesPage from "@/app/admin/permissoes/page";

const { getAdminPermissionsDataMock, redirectMock } = vi.hoisted(() => ({
  getAdminPermissionsDataMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/admin-permissions", () => ({
  getAdminPermissionsData: getAdminPermissionsDataMock,
}));

vi.mock("@/app/admin/permissoes/actions", () => ({
  grantAdminAccess: vi.fn(),
  updateAdminMembership: vi.fn(),
  createAdminBootstrapGrant: vi.fn(),
  updateAdminBootstrapGrant: vi.fn(),
}));

describe("AdminPermissoesPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    getAdminPermissionsDataMock.mockReset();
  });

  it("redireciona usuario sem sessao para o login administrativo", async () => {
    getAdminPermissionsDataMock.mockResolvedValue({
      access: { status: "unauthenticated" },
    });

    await AdminPermissoesPage();

    expect(redirectMock).toHaveBeenCalledWith("/entrar?next=/admin/permissoes");
  });

  it("renderiza modulo operacional para admin autorizado", async () => {
    getAdminPermissionsDataMock.mockResolvedValue({
      access: {
        email: "admin@example.com",
        role: "super_admin",
        status: "authorized",
      },
      bootstrapGrants: [
        {
          claimedAt: null,
          email: "novo-admin@example.com",
          id: "grant-1",
          notes: "Autorizacao inicial",
          role: "admin",
          status: "pending",
        },
      ],
      eligibleProfiles: [
        {
          email: "perfil@example.com",
          fullName: "Pessoa de Teste",
          id: "profile-1",
        },
      ],
      memberships: [
        {
          grantedAt: "2026-04-30T12:00:00.000Z",
          id: "membership-1",
          profile: {
            email: "admin@example.com",
            fullName: "Administrador",
            id: "profile-admin",
          },
          role: "super_admin",
          status: "active",
        },
      ],
    });

    render(await AdminPermissoesPage());

    expect(
      screen.getByRole("heading", {
        name: /Permissões e papéis da administração/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Quem já pode operar a administração/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Autorizar um novo email administrativo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/novo-admin@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Conceder acesso/i }),
    ).toBeInTheDocument();
  });
});
