"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getRequestSiteUrl } from "@/lib/site-url";
import { getAdminAccess } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";

export type AdminPermissionsActionState = {
  error?: string;
  manualLink?: string;
  manualLinkLabel?: string;
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

export async function removeAdminUser(
  _previousState: AdminPermissionsActionState,
  formData: FormData,
): Promise<AdminPermissionsActionState> {
  const access = await getAdminAccess();

  if (access.status !== "authorized" || access.role !== "super_admin") {
    return { error: "Apenas super_admin pode remover usuários administrativos." };
  }

  const membershipId = String(formData.get("membershipId") || "").trim();

  if (!membershipId) {
    return { error: "Registro administrativo inválido." };
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
    .select("profile_id, profile:profiles!admin_memberships_profile_id_fkey(email)")
    .eq("id", membershipId)
    .maybeSingle();

  if (targetMembershipError) {
    return { error: targetMembershipError.message };
  }

  const targetProfile = Array.isArray(targetMembership?.profile)
    ? targetMembership.profile[0]
    : targetMembership?.profile;

  if (!targetMembership?.profile_id || !targetProfile?.email) {
    return { error: "Não foi possível localizar o usuário administrativo alvo." };
  }

  if (targetMembership.profile_id === user.id) {
    return {
      error:
        "Por segurança, a conta atual não pode remover a própria conta administrativa por este módulo.",
    };
  }

  const normalizedEmail = targetProfile.email.toLowerCase().trim();

  const { error: grantsError } = await supabase
    .schema("aajf")
    .from("admin_bootstrap_grants")
    .delete()
    .eq("normalized_email", normalizedEmail);

  if (grantsError) {
    return { error: grantsError.message };
  }

  try {
    const adminSupabase = createAdminClient();
    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(
      targetMembership.profile_id,
    );

    if (deleteUserError) {
      return { error: deleteUserError.message };
    }
  } catch (adminClientError) {
    return {
      error:
        adminClientError instanceof Error
          ? adminClientError.message
          : "Não foi possível remover o usuário administrativo.",
    };
  }

  revalidatePath("/admin/permissoes");

  return { success: "Usuário administrativo removido com sucesso." };
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
    const next = "/primeiro-acesso?next=%2Fadmin";
    const redirectTo = `${siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`;
    const { data: inviteData, error: inviteError } =
      await adminSupabase.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          data: {
            admin_role: role,
          },
          redirectTo,
        },
      });

    if (!inviteError) {
      revalidatePath("/admin/permissoes");

      return {
        manualLink: buildManualFirstAccessLink(
          siteUrl,
          inviteData.properties.hashed_token,
          inviteData.properties.verification_type,
          next,
        ),
        manualLinkLabel: "Link provisório de primeiro acesso",
        success:
          "Autorização por email registrada e link provisório de primeiro acesso gerado com sucesso.",
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

    revalidatePath("/admin/permissoes");

    return {
      manualLink: buildManualFirstAccessLink(
        siteUrl,
        recoveryData.properties.hashed_token,
        recoveryData.properties.verification_type,
        next,
      ),
      manualLinkLabel: "Link provisório para definir ou renovar a senha",
      success:
        "A autorização foi mantida e um link provisório para definir ou renovar a senha foi gerado com sucesso.",
    };
  } catch (adminClientError) {
    return {
      error:
        adminClientError instanceof Error
          ? adminClientError.message
          : "Não foi possível preparar o link administrativo.",
    };
  }
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

function buildManualFirstAccessLink(
  siteUrl: string,
  tokenHash: string,
  verificationType: string,
  next: string,
) {
  return `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(
    tokenHash,
  )}&type=${encodeURIComponent(verificationType)}&next=${encodeURIComponent(next)}`;
}
