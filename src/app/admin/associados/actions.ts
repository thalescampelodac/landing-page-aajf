"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getRequestSiteUrl } from "@/lib/site-url";
import { getAdminAccess } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";

export type AdminAssociatesActionState = {
  error?: string;
  manualLink?: string;
  manualLinkLabel?: string;
  success?: string;
};

export async function grantAssociateAccess(
  _previousState: AdminAssociatesActionState,
  formData: FormData,
): Promise<AdminAssociatesActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem conceder vínculo de associado." };
  }

  const email = String(formData.get("email") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Informe um email válido para conceder o vínculo de associado." };
  }

  if (!isValidAssociateStatus(status)) {
    return { error: "Selecione um status válido para o associado." };
  }

  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  const { error: grantError } = await supabase
    .schema("aajf")
    .from("associate_bootstrap_grants")
    .upsert(
      {
        email,
        membership_status: status,
        notes: notes || null,
        status: "pending",
      },
      { onConflict: "normalized_email" },
    );

  if (grantError) {
    return { error: grantError.message };
  }

  try {
    const adminSupabase = createAdminClient();
    const next = "/primeiro-acesso?next=%2Fassociado";
    const redirectTo = `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`;
    const { data: inviteData, error: inviteError } =
      await adminSupabase.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          redirectTo,
        },
      });

    if (!inviteError) {
      revalidatePath("/admin/associados");
      revalidatePath("/associado");

      return {
        manualLink: buildManualFirstAccessLink(
          siteUrl,
          inviteData.properties.hashed_token,
          "invite",
          next,
        ),
        manualLinkLabel: "Link provisório de primeiro acesso do associado",
        success:
          "Vínculo de associado autorizado por email e link provisório de primeiro acesso gerado com sucesso.",
      };
    }

    const isAlreadyRegisteredError =
      inviteError.message.toLowerCase().includes("already been registered") ||
      inviteError.message.toLowerCase().includes("already registered");

    if (!isAlreadyRegisteredError) {
      return { error: inviteError.message };
    }

    const { data: recoveryData, error: recoveryError } =
      await adminSupabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo,
        },
      });

    if (recoveryError) {
      return { error: recoveryError.message };
    }

    revalidatePath("/admin/associados");
    revalidatePath("/associado");

    return {
      manualLink: buildManualFirstAccessLink(
        siteUrl,
        recoveryData.properties.hashed_token,
        "recovery",
        next,
      ),
      manualLinkLabel: "Link provisório para liberar o acesso do associado",
      success:
        "O vínculo foi autorizado e um link provisório para entrar ou renovar a senha do associado foi gerado com sucesso.",
    };
  } catch (adminClientError) {
    return {
      error:
        adminClientError instanceof Error
          ? adminClientError.message
          : "Não foi possível preparar o link do associado.",
    };
  }
}

export async function updateAssociateMembership(
  _previousState: AdminAssociatesActionState,
  formData: FormData,
): Promise<AdminAssociatesActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem alterar associados." };
  }

  const membershipId = String(formData.get("membershipId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!membershipId) {
    return { error: "Registro de associado inválido." };
  }

  if (!isValidAssociateStatus(status)) {
    return { error: "Selecione um status válido para o associado." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("aajf")
    .from("associate_memberships")
    .update({ notes: notes || null, status })
    .eq("id", membershipId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/associados");
  revalidatePath("/associado");

  return { success: "Vínculo de associado atualizado." };
}

function isValidAssociateStatus(
  status: string,
): status is "active" | "inactive" | "suspended" {
  return status === "active" || status === "inactive" || status === "suspended";
}

function buildManualFirstAccessLink(
  siteUrl: string,
  tokenHash: string,
  type: "invite" | "recovery",
  next: string,
) {
  return `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`;
}
