import {
  createAdminBootstrapGrant,
  grantAdminAccess,
  updateAdminBootstrapGrant,
  updateAdminMembership,
} from "@/app/admin/permissoes/actions";

const {
  createAdminClientMock,
  getAdminAccessMock,
  generateLinkMock,
  getRequestSiteUrlMock,
  getUserMock,
  upsertMock,
  eqMock,
  maybeSingleMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createAdminClientMock: vi.fn(),
  eqMock: vi.fn(),
  generateLinkMock: vi.fn(),
  getAdminAccessMock: vi.fn(),
  getRequestSiteUrlMock: vi.fn(),
  getUserMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/access", () => ({
  getAdminAccess: getAdminAccessMock,
}));

vi.mock("@/lib/site-url", () => ({
  getRequestSiteUrl: getRequestSiteUrlMock,
}));

vi.mock("@/lib/supabase/admin-client", () => ({
  createAdminClient: createAdminClientMock,
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
    createAdminClientMock.mockReset();
    eqMock.mockReset();
    generateLinkMock.mockReset();
    getAdminAccessMock.mockReset();
    getRequestSiteUrlMock.mockReset();
    getUserMock.mockReset();
    maybeSingleMock.mockReset();
    revalidatePathMock.mockReset();
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
    createAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          generateLink: generateLinkMock,
        },
      },
    });
    getRequestSiteUrlMock.mockResolvedValue("http://localhost:3000");
    generateLinkMock.mockResolvedValue({
      data: {
        properties: {
          hashed_token: "token-invite",
          verification_type: "invite",
        },
      },
      error: null,
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

    expect(result.success).toMatch(/link provisório/i);
    expect(result.manualLink).toBe(
      "http://localhost:3000/auth/confirm?token_hash=token-invite&type=invite&next=%2Fprimeiro-acesso%3Fnext%3D%252Fadmin",
    );
    expect(generateLinkMock).toHaveBeenCalledWith({
      email: "novo-admin@example.com",
      options: {
        data: {
          admin_role: "admin",
        },
        redirectTo:
          "http://localhost:3000/auth/confirm?next=%2Fprimeiro-acesso%3Fnext%3D%252Fadmin",
      },
      type: "invite",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/permissoes");
  });

  it("usa recovery quando o email ja existe no Supabase", async () => {
    getAdminAccessMock.mockResolvedValue({
      status: "authorized",
      email: "admin@example.com",
      role: "super_admin",
    });
    createAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          generateLink: generateLinkMock,
        },
      },
    });
    getRequestSiteUrlMock.mockResolvedValue("http://localhost:3000");
    generateLinkMock
      .mockResolvedValueOnce({
        error: {
          message: "A user with this email address has already been registered",
        },
      })
      .mockResolvedValueOnce({
        data: {
          properties: {
            hashed_token: "token-recovery",
            verification_type: "recovery",
          },
        },
        error: null,
      });
    upsertMock.mockResolvedValue({ error: null });

    const result = await createAdminBootstrapGrant(
      {},
      buildFormData({
        email: "admin-existente@example.com",
        notes: "Reenvio de acesso",
        role: "admin",
      }),
    );

    expect(result.success).toMatch(/link provisório/i);
    expect(result.manualLink).toBe(
      "http://localhost:3000/auth/confirm?token_hash=token-recovery&type=recovery&next=%2Fprimeiro-acesso%3Fnext%3D%252Fadmin",
    );
    expect(generateLinkMock).toHaveBeenNthCalledWith(2, {
      email: "admin-existente@example.com",
      options: {
        redirectTo:
          "http://localhost:3000/auth/confirm?next=%2Fprimeiro-acesso%3Fnext%3D%252Fadmin",
      },
      type: "recovery",
    });
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
