import { getAdminAssociateExportRows } from "@/lib/supabase/admin-associates";
import { buildAssociatePdfDocument } from "@/lib/associate-export-pdf";

export const dynamic = "force-dynamic";

function hasAuthorizedRows(
  result: Awaited<ReturnType<typeof getAdminAssociateExportRows>>,
): result is Extract<
  Awaited<ReturnType<typeof getAdminAssociateExportRows>>,
  { access: { status: "authorized" } }
> {
  return result.access.status === "authorized";
}

export async function GET() {
  const result = await getAdminAssociateExportRows();

  if (result.access.status === "unconfigured") {
    return new Response("Supabase ainda não está configurado neste ambiente.", {
      status: 503,
    });
  }

  if (result.access.status === "unauthenticated") {
    return new Response("Faça login para exportar os associados.", {
      status: 401,
    });
  }

  if (result.access.status === "denied") {
    return new Response("Apenas administradores autorizados podem exportar os associados.", {
      status: 403,
    });
  }

  if (!hasAuthorizedRows(result)) {
    return new Response("Não foi possível preparar a exportação dos associados.", {
      status: 500,
    });
  }

  const document = buildAssociatePdfDocument(result.rows);
  const filename = `associados-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new Response(document, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
    status: 200,
  });
}
