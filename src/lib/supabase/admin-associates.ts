import { getAdminAccess, type AdminAccess } from "@/lib/supabase/access";
import type { AssociateCategory } from "@/lib/supabase/associate-profile-shared";
import { createClient } from "@/lib/supabase/server";

export type AdminAssociateMembershipRecord = {
  grantedAt: string;
  id: string;
  notes: string | null;
  profile: {
    email: string;
    fullName: string | null;
    id: string;
  };
  profileSnapshot: {
    category: AssociateCategory | null;
    phone: string | null;
  } | null;
  status: "active" | "inactive" | "suspended";
};

export type AssociateBootstrapGrantRecord = {
  claimedAt: string | null;
  email: string;
  id: string;
  membershipStatus: "active" | "inactive" | "suspended";
  notes: string | null;
  status: "pending" | "claimed" | "revoked";
};

export type AdminAssociatesData =
  | { access: Extract<AdminAccess, { status: "unconfigured" | "unauthenticated" | "denied" }> }
  | {
      access: Extract<AdminAccess, { status: "authorized" }>;
      bootstrapGrants: AssociateBootstrapGrantRecord[];
      memberships: AdminAssociateMembershipRecord[];
    };

export async function getAdminAssociatesData(): Promise<AdminAssociatesData> {
  const access = await getAdminAccess();

  if (access.status !== "authorized") {
    return { access };
  }

  const supabase = await createClient();
  const [
    { data: membershipsData, error: membershipsError },
    { data: grantsData, error: grantsError },
    { data: associateProfilesData, error: associateProfilesError },
  ] =
    await Promise.all([
      supabase
        .schema("aajf")
        .from("associate_memberships")
        .select(
          "id, status, granted_at, notes, profile_id, profile:profiles!associate_memberships_profile_id_fkey(id, email, full_name)",
        )
        .order("granted_at", { ascending: false }),
      supabase
        .schema("aajf")
        .from("associate_bootstrap_grants")
        .select("id, email, status, membership_status, claimed_at, notes")
        .order("created_at", { ascending: false }),
      supabase
        .schema("aajf")
        .from("associate_profiles")
        .select("profile_id, category, phone"),
    ]);

  if (membershipsError) {
    throw membershipsError;
  }

  if (grantsError) {
    throw grantsError;
  }

  if (associateProfilesError) {
    throw associateProfilesError;
  }

  const associateProfilesByProfileId = new Map(
    (associateProfilesData ?? []).map((profile) => [profile.profile_id, profile]),
  );

  const memberships: AdminAssociateMembershipRecord[] = (membershipsData ?? [])
    .map((membership) => {
      const profile = Array.isArray(membership.profile)
        ? membership.profile[0]
        : membership.profile;
      const associateProfile = associateProfilesByProfileId.get(membership.profile_id);

      if (!profile) {
        return null;
      }

      return {
        grantedAt: membership.granted_at,
        id: membership.id,
        notes: membership.notes,
        profile: {
          email: profile.email,
          fullName: profile.full_name,
          id: profile.id,
        },
        profileSnapshot: associateProfile
          ? {
              category: associateProfile.category,
              phone: associateProfile.phone,
            }
          : null,
        status: membership.status,
      } as AdminAssociateMembershipRecord;
    })
    .filter((membership): membership is AdminAssociateMembershipRecord => membership !== null);

  const bootstrapGrants: AssociateBootstrapGrantRecord[] = (grantsData ?? []).map(
    (grant) => ({
      claimedAt: grant.claimed_at,
      email: grant.email,
      id: grant.id,
      membershipStatus: grant.membership_status,
      notes: grant.notes,
      status: grant.status,
    }),
  );

  return {
    access,
    bootstrapGrants,
    memberships,
  };
}
