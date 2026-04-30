"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getRequestSiteUrl } from "@/lib/site-url";
import { getAdminAccess } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";

export type AdminPermissionsActionState = {
  error?: string;
  success?: string;
};

export async function grantAdminAccess(
  _previousState: AdminPermissionsActionState,
  formData: FormData,
): Promise<AdminPermissionsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem conceder acesso." };
  }

  const profileId = String(formData.get("profileId") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!profileId) {
    return { error: "Selecione um perfil válido para conceder acesso." };
  }

  if (!isValidAdminRole(role)) {
    return { error: "Selecione um papel administrativo válido." };
  }

  if (!isValidAdminStatus(status)) {
    return { error: "Selecione um status administrativo válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão indisponível para concluir a ação." };
  }

  const { error } = await supabase.schema("aajf").from("admin_memberships").upsert(
    {
      granted_by: user.id,
      profile_id: profileId,
      role,
      status,
    },
    { onConflict: "profile_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/permissoes");

  return { success: "Acesso administrativo atualizado com sucesso." };
}

export async function updateAdminMembership(
  _previousState: AdminPermissionsActionState,
  formData: FormData,
): Promise<AdminPermissionsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem alterar permissões." };
  }

  const membershipId = String(formData.get("membershipId") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!membershipId) {
    return { error: "Registro administrativo inválido." };
  }

  if (!isValidAdminRole(role)) {
    return { error: "Selecione um papel administrativo válido." };
  }

  if (!isValidAdminStatus(status)) {
    return { error: "Selecione um status administrativo válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão indisponível para concluir a ação." };
  }

  const { data: targetMembership, error: targetMembershipError } = await supabase
    .schema("aajf")
    .from("admin_memberships")
    .select("profile_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (targetMembershipError) {
    return { error: targetMembershipError.message };
  }

  if (targetMembership?.profile_id === user.id) {
    return {
      error:
        "Por segurança, a conta atual não pode alterar o próprio acesso administrativo por este módulo.",
    };
  }

  const { error } = await supabase
    .schema("aajf")
    .from("admin_memberships")
    .update({ role, status })
    .eq("id", membershipId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/permissoes");

  return { success: "Permissão administrativa atualizada." };
}

export async function createAdminBootstrapGrant(
  _previousState: AdminPermissionsActionState,
  formData: FormData,
): Promise<AdminPermissionsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem autorizar novos emails." };
  }

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Informe um email válido para autorização administrativa." };
  }

  if (!isValidAdminRole(role)) {
    return { error: "Selecione um papel administrativo válido." };
  }

  const siteUrl = await getRequestSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.schema("aajf").from("admin_bootstrap_grants").upsert(
    {
      email,
      notes: notes || null,
      role,
      status: "pending",
    },
    { onConflict: "normalized_email" },
  );

  if (error) {
    return { error: error.message };
  }

  try {
    const adminSupabase = createAdminClient();
    const redirectTo = `${siteUrl}/auth/confirm?next=${encodeURIComponent(
      "/primeiro-acesso?next=%2Fadmin",
    )}`;
    const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        admin_role: role,
      },
      redirectTo,
    });

    if (inviteError) {
      const isAlreadyRegisteredError =
        inviteError.message.toLowerCase().includes("already been registered") ||
        inviteError.message.toLowerCase().includes("already registered");

      if (!isAlreadyRegisteredError) {
        return { error: inviteError.message };
      }

      const { error: recoveryError } = await adminSupabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        },
      );

      if (recoveryError) {
        return { error: recoveryError.message };
      }

      revalidatePath("/admin/permissoes");

      return {
        success:
          "A autorização foi mantida e um email para definir ou renovar a senha foi enviado com sucesso.",
      };
    }
  } catch (adminClientError) {
    return {
      error:
        adminClientError instanceof Error
          ? adminClientError.message
          : "Não foi possível preparar o convite administrativo.",
    };
  }

  revalidatePath("/admin/permissoes");

  return { success: "Autorização por email registrada e convite enviado com sucesso." };
}

export async function updateAdminBootstrapGrant(
  _previousState: AdminPermissionsActionState,
  formData: FormData,
): Promise<AdminPermissionsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { error: "Apenas administradores ativos podem alterar grants pendentes." };
  }

  const grantId = String(formData.get("grantId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!grantId) {
    return { error: "Grant administrativo inválido." };
  }

  if (!isValidBootstrapGrantStatus(status)) {
    return { error: "Selecione um status válido para o grant." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("aajf")
    .from("admin_bootstrap_grants")
    .update({ status })
    .eq("id", grantId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/permissoes");

  return { success: "Grant administrativo atualizado." };
}

function isValidAdminRole(role: string): role is "super_admin" | "admin" {
  return role === "super_admin" || role === "admin";
}

function isValidAdminStatus(
  status: string,
): status is "active" | "inactive" | "suspended" {
  return status === "active" || status === "inactive" || status === "suspended";
}

function isValidBootstrapGrantStatus(
  status: string,
): status is "pending" | "claimed" | "revoked" {
  return status === "pending" || status === "claimed" || status === "revoked";
}
