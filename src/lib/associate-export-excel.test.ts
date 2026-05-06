import { buildAssociateExcelWorkbook } from "@/lib/associate-export-excel";
import type { AdminAssociateExportRow } from "@/lib/supabase/admin-associates";

describe("associate export excel", () => {
  it("gera workbook com hierarquia de associado e dependente na mesma aba", () => {
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
        observation: "Observação <importante>",
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

    const workbook = buildAssociateExcelWorkbook(rows);

    expect(workbook).toContain('<?xml version="1.0"?>');
    expect(workbook).toContain('<Worksheet ss:Name="Associados">');
    expect(workbook).toContain("tipo_registro");
    expect(workbook).toContain("matricula_registro");
    expect(workbook).toContain("matricula_associado_responsavel");
    expect(workbook).toContain(">associado<");
    expect(workbook).toContain(">dependente<");
    expect(workbook).toContain(">000001<");
    expect(workbook).toContain(">D000001<");
    expect(workbook).toContain("Associado Exemplo");
    expect(workbook).toContain("Dependente Exemplo");
    expect(workbook).toContain("Grosse Kinder");
    expect(workbook).toContain("Observação &lt;importante&gt;");
    expect(workbook).toContain('ss:StyleID="AssociateRow"');
    expect(workbook).toContain('ss:StyleID="DependentRow"');
  });
});
