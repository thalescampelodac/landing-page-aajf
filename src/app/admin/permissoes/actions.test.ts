import {
  createAdminBootstrapGrant,
  grantAdminAccess,
  updateAdminBootstrapGrant,
  updateAdminMembership,
} from "@/app/admin/permissoes/actions";

const {
  getAdminAccessMock,
  getUserMock,
  upsertMock,
  updateMock,
  eqMock,
  maybeSingleMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  eqMock: vi.fn(),
  getAdminAccessMock: vi.fn(),
  getUserMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  updateMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/access", () => ({
  getAdminAccess: getAdminAccessMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
    schema: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === "admin_memberships") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: maybeSingleMock,
              })),
            })),
            update: vi.fn(() => ({
              eq: eqMock,
            })),
            upsert: upsertMock,
          };
        }

        if (table === "admin_bootstrap_grants") {
          return {
            update: vi.fn(() => ({
              eq: eqMock,
            })),
            upsert: upsertMock,
          };
        }

        return {};
      }),
    })),
  })),
}));

describe("admin permissões actions", () => {
  beforeEach(() => {
    eqMock.mockReset();
    getAdminAccessMock.mockReset();
    getUserMock.mockReset();
    maybeSingleMock.mockReset();
    revalidatePathMock.mockReset();
    updateMock.mockReset();
    upsertMock.mockReset();
  });

  it("bloqueia concessao quando usuario nao e admin autorizado", async () => {
    getAdminAccessMock.mockResolvedValue({ status: "denied", email: "pessoa@example.com" });

    const result = await grantAdminAccess(
      {},
      buildFormData({
        profileId: "profile-1",
        role: "admin",
        status: "active",
      }),
    );

    expect(result.error).toMatch(/Apenas administradores ativos/i);
  });

  it("impede que a conta atual altere o proprio membership", async () => {
    getAdminAccessMock.mockResolvedValue({
      status: "authorized",
      email: "admin@example.com",
      role: "super_admin",
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: "profile-admin" } },
    });
    maybeSingleMock.mockResolvedValue({
      data: { profile_id: "profile-admin" },
      error: null,
    });

    const result = await updateAdminMembership(
      {},
      buildFormData({
        membershipId: "membership-1",
        role: "admin",
        status: "inactive",
      }),
    );

    expect(result.error).toMatch(/não pode alterar o próprio acesso/i);
  });

  it("revalida a pagina apos criar grant administrativo", async () => {
    getAdminAccessMock.mockResolvedValue({
      status: "authorized",
      email: "admin@example.com",
      role: "super_admin",
    });
    upsertMock.mockResolvedValue({ error: null });

    const result = await createAdminBootstrapGrant(
      {},
      buildFormData({
        email: "novo-admin@example.com",
        notes: "Primeira autorizacao",
        role: "admin",
      }),
    );

    expect(result.success).toMatch(/Autorização por email registrada/i);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/permissoes");
  });

  it("revalida a pagina apos atualizar grant administrativo", async () => {
    getAdminAccessMock.mockResolvedValue({
      status: "authorized",
      email: "admin@example.com",
      role: "super_admin",
    });
    eqMock.mockResolvedValue({ error: null });

    const result = await updateAdminBootstrapGrant(
      {},
      buildFormData({
        grantId: "grant-1",
        status: "revoked",
      }),
    );

    expect(result.success).toMatch(/Grant administrativo atualizado/i);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/permissoes");
  });
});

function buildFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
