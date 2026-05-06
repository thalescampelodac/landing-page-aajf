import type { AdminAssociateExportRow } from "@/lib/supabase/admin-associates";

const EXCEL_HEADERS: Array<{
  key: keyof AdminAssociateExportRow;
  label: string;
  width: number;
}> = [
  { key: "type", label: "tipo_registro", width: 16 },
  { key: "membershipNumber", label: "matricula_registro", width: 18 },
  {
    key: "associateResponsibleMembershipNumber",
    label: "matricula_associado_responsavel",
    width: 26,
  },
  {
    key: "associateResponsibleName",
    label: "nome_associado_responsavel",
    width: 34,
  },
  { key: "name", label: "nome_completo", width: 34 },
  { key: "email", label: "email", width: 34 },
  { key: "category", label: "categoria", width: 18 },
  { key: "status", label: "status_vinculo", width: 16 },
  { key: "phone", label: "telefone", width: 18 },
  { key: "cpf", label: "cpf", width: 18 },
  { key: "rg", label: "rg", width: 18 },
  { key: "birthDate", label: "data_nascimento", width: 18 },
  { key: "nationality", label: "nacionalidade", width: 18 },
  { key: "zipCode", label: "cep", width: 14 },
  { key: "addressStreet", label: "rua", width: 28 },
  { key: "addressNumber", label: "numero", width: 12 },
  { key: "addressComplement", label: "complemento", width: 18 },
  { key: "addressNeighborhood", label: "bairro", width: 22 },
  { key: "addressCity", label: "cidade", width: 22 },
  { key: "addressState", label: "uf", width: 10 },
  { key: "observation", label: "observacao", width: 32 },
  { key: "termAccepted", label: "termo_aceito", width: 14 },
  { key: "hasPhoto", label: "possui_foto", width: 14 },
  { key: "grantedAt", label: "data_concessao", width: 22 },
];

export function buildAssociateExcelWorkbook(rows: AdminAssociateExportRow[]) {
  const headerRow = xmlRow(
    EXCEL_HEADERS.map((column) =>
      xmlCell(column.label, "Header"),
    ),
  );

  const bodyRows = rows
    .map((row) =>
      xmlRow(
        EXCEL_HEADERS.map((column) =>
          xmlCell(
            formatCellValue(row[column.key]),
            row.type === "associado" ? "AssociateRow" : "DependentRow",
          ),
        ),
      ),
    )
    .join("");

  const columns = EXCEL_HEADERS.map(
    (column) => `<Column ss:AutoFitWidth="0" ss:Width="${column.width * 6.4}"/>`,
  ).join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#17362d"/>
      <Interior ss:Color="#fffaf3" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#d8d4ca"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#d8d4ca"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#d8d4ca"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#d8d4ca"/>
      </Borders>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#9a1f2b"/>
      <Interior ss:Color="#f7f1e7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="AssociateRow">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#17362d"/>
      <Interior ss:Color="#fffdf8" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="DependentRow">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#42564f"/>
      <Interior ss:Color="#f9f4ec" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Associados">
    <Table>
      ${columns}
      ${headerRow}
      ${bodyRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <Panes>
        <Pane>
          <Number>3</Number>
        </Pane>
      </Panes>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;
}

function xmlRow(cells: string[]) {
  return `<Row>${cells.join("")}</Row>`;
}

function xmlCell(value: string, styleId: string) {
  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatCellValue(value: string) {
  return value.trim();
}
