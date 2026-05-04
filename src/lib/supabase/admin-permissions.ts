import { getAdminAccess, type AdminAccess } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";

export type AdminMembershipRecord = {
  grantedAt: string;
  id: string;
  profile: {
    email: string;
    fullName: string | null;
    id: string;
  };
  role: "super_admin" | "admin";
  status: "active" | "inactive" | "suspended";
};

export type AdminBootstrapGrantRecord = {
  claimedAt: string | null;
  email: string;
  id: string;
  notes: string | null;
  role: "super_admin" | "admin";
  status: "pending" | "claimed" | "revoked";
};

export type AdminPermissionsData =
  | { access: Extract<AdminAccess, { status: "unconfigured" | "unauthenticated" | "denied" }> }
  | {
      access: Extract<AdminAccess, { status: "authorized" }>;
      bootstrapGrants: AdminBootstrapGrantRecord[];
      memberships: AdminMembershipRecord[];
    };

export async function getAdminPermissionsData(): Promise<AdminPermissionsData> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { access };
  }

  const supabase = await createClient();

  const [{ data: membershipsData, error: membershipsError }, { data: grantsData, error: grantsError }] =
    await Promise.all([
      supabase
        .schema("aajf")
        .from("admin_memberships")
        .select("id, role, status, granted_at, profile:profiles!admin_memberships_profile_id_fkey(id, email, full_name)")
        .order("granted_at", { ascending: false }),
      supabase
        .schema("aajf")
        .from("admin_bootstrap_grants")
        .select("id, email, role, status, claimed_at, notes")
        .order("created_at", { ascending: false }),
    ]);

  if (membershipsError) {
    throw membershipsError;
  }

  if (grantsError) {
    throw grantsError;
  }

  const memberships: AdminMembershipRecord[] = (membershipsData ?? [])
    .map((membership) => {
      const profile = Array.isArray(membership.profile)
        ? membership.profile[0]
        : membership.profile;

      if (!profile) {
        return null;
      }

      return {
        grantedAt: membership.granted_at,
        id: membership.id,
        profile: {
          email: profile.email,
          fullName: profile.full_name,
          id: profile.id,
        },
        role: membership.role,
        status: membership.status,
      } as AdminMembershipRecord;
    })
    .filter((membership): membership is AdminMembershipRecord => membership !== null);

  const bootstrapGrants: AdminBootstrapGrantRecord[] = (grantsData ?? []).map(
    (grant) => ({
      claimedAt: grant.claimed_at,
      email: grant.email,
      id: grant.id,
      notes: grant.notes,
      role: grant.role,
      status: grant.status,
    }),
  );

  return {
    access,
    bootstrapGrants,
    memberships,
  };
}
