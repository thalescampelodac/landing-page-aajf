import { GET } from "@/app/admin/associados/export/pdf/route";

const { buildAssociatePdfDocumentMock, getAdminAssociateExportRowsMock } =
  vi.hoisted(() => ({
    buildAssociatePdfDocumentMock: vi.fn(),
    getAdminAssociateExportRowsMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/admin-associates", () => ({
  getAdminAssociateExportRows: getAdminAssociateExportRowsMock,
}));

vi.mock("@/lib/associate-export-pdf", () => ({
  buildAssociatePdfDocument: buildAssociatePdfDocumentMock,
}));

describe("admin associados pdf export route", () => {
  beforeEach(() => {
    buildAssociatePdfDocumentMock.mockReset();
    getAdminAssociateExportRowsMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna 401 quando o usuario nao esta autenticado", async () => {
    getAdminAssociateExportRowsMock.mockResolvedValue({
      access: { status: "unauthenticated" },
    });

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toMatch(/faça login/i);
  });

  it("retorna 403 quando o usuario nao tem permissao administrativa", async () => {
    getAdminAssociateExportRowsMock.mockResolvedValue({
      access: { status: "denied", email: "pessoa@example.com" },
    });

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toMatch(/administradores autorizados/i);
  });

  it("retorna documento pdf com headers de download para admin autorizado", async () => {
    getAdminAssociateExportRowsMock.mockResolvedValue({
      access: {
        email: "admin@example.com",
        profileId: "profile-1",
        role: "super_admin",
        status: "authorized",
      },
      rows: [
        {
          addressCity: "Juiz de Fora",
          addressComplement: "",
          addressNeighborhood: "Centro",
          addressNumber: "100",
          addressState: "MG",
          addressStreet: "Rua Principal",
          associateResponsibleMembershipNumber: "000001",
          associateResponsibleName: "Associado Exemplo",
          birthDate: "1982-07-19",
          category: "Heimweh",
          cpf: "057.807.496-63",
          email: "associado@example.com",
          grantedAt: "2026-05-05T12:00:00.000Z",
          hasPhoto: "Sim",
          membershipNumber: "000001",
          name: "Associado Exemplo",
          nationality: "Brasileira",
          observation: "",
          phone: "(32) 99999-0000",
          rg: "8056162",
          status: "active",
          termAccepted: "Sim",
          type: "associado",
          zipCode: "36021-690",
        },
      ],
    });
    buildAssociatePdfDocumentMock.mockReturnValue(
      new Uint8Array([37, 80, 68, 70]),
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(buildAssociatePdfDocumentMock).toHaveBeenCalledTimes(1);
    expect(response.headers.get("Content-Type")).toContain("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      'attachment; filename="associados-2026-05-05.pdf"',
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([37, 80, 68, 70]),
    );
  });
});
