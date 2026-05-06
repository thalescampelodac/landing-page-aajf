import { buildAssociatePdfDocument } from "@/lib/associate-export-pdf";
import type { AdminAssociateExportRow } from "@/lib/supabase/admin-associates";

describe("associate export pdf", () => {
  it("gera documento pdf com hierarquia de associado e dependente", () => {
    const rows: AdminAssociateExportRow[] = [
      {
        addressCity: "Juiz de Fora",
        addressComplement: "Apto 101",
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
        observation: "Observacao importante",
        phone: "(32) 99999-0000",
        rg: "8056162",
        status: "active",
        termAccepted: "Sim",
        type: "associado",
        zipCode: "36021-690",
      },
      {
        addressCity: "",
        addressComplement: "",
        addressNeighborhood: "",
        addressNumber: "",
        addressState: "",
        addressStreet: "",
        associateResponsibleMembershipNumber: "000001",
        associateResponsibleName: "Associado Exemplo",
        birthDate: "2013-10-18",
        category: "Grosse Kinder",
        cpf: "057.807.496-63",
        email: "",
        grantedAt: "2026-05-05T12:00:00.000Z",
        hasPhoto: "Nao",
        membershipNumber: "D000001",
        name: "Dependente Exemplo",
        nationality: "Brasileira",
        observation: "",
        phone: "",
        rg: "8056162",
        status: "active",
        termAccepted: "",
        type: "dependente",
        zipCode: "",
      },
    ];

    const pdfBytes = buildAssociatePdfDocument(rows);
    const pdfText = Buffer.from(pdfBytes).toString("latin1");

    expect(pdfBytes.byteLength).toBeGreaterThan(1000);
    expect(pdfText).toContain("%PDF-1.4");
    expect(pdfText).toContain("/Type /Catalog");
    expect(pdfText).toContain("/Type /Page");
    expect(pdfText).toContain("/Helvetica");
    expect(pdfText).toContain("AAJF");
    expect(pdfText).toContain("000001");
    expect(pdfText).toContain("D000001");
    expect(pdfText).toContain("Grosse Kinder");
    expect(pdfText).toContain("/Helvetica-Bold");
    expect(pdfText).toContain("stream");
    expect(pdfText).toContain("xref");
    expect(pdfText).toContain("%%EOF");
  });
});
