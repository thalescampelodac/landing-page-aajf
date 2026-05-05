import { getAdminAccess, type AdminAccess } from "@/lib/supabase/access";
import type {
  AssociateCategory,
  AssociateDependentRecord,
  AssociateProfileRecord,
  Nationality,
} from "@/lib/supabase/associate-profile-shared";
import { createClient } from "@/lib/supabase/server";

type AdminAssociateProfileSnapshot = Omit<
  AssociateProfileRecord,
  "email" | "profileId"
>;

export type AdminAssociateMembershipRecord = {
  grantedAt: string;
  id: string;
  notes: string | null;
  profile: {
    email: string;
    fullName: string | null;
    id: string;
  };
  profileSnapshot: AdminAssociateProfileSnapshot | null;
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
    { data: associateProfilesData, error: associateProfilesError },
    { data: associateDependentsData, error: associateDependentsError },
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
        .from("associate_profiles")
        .select(
          "id, profile_id, membership_number, full_name, category, cpf, rg, phone, birth_date, nationality, cep, street, number, complement, neighborhood, city, state, observation, term_accepted, photo_url",
        ),
      supabase
        .schema("aajf")
        .from("associate_dependents")
        .select(
          "id, associate_profile_id, membership_number, full_name, category, cpf, rg, birth_date, nationality",
        ),
    ]);

  if (membershipsError) {
    throw membershipsError;
  }

  if (associateProfilesError) {
    throw associateProfilesError;
  }

  if (associateDependentsError) {
    throw associateDependentsError;
  }

  const dependentsByAssociateProfileId = new Map<string, AssociateDependentRecord[]>();

  for (const dependent of associateDependentsData ?? []) {
    const entry = dependentsByAssociateProfileId.get(dependent.associate_profile_id) ?? [];
    entry.push({
      birthDate: dependent.birth_date ?? "",
      category: dependent.category as AssociateCategory | null,
      cpf: dependent.cpf,
      fullName: dependent.full_name,
      id: dependent.id,
      membershipNumber: dependent.membership_number ?? null,
      nationality: dependent.nationality as Nationality | null,
      rg: dependent.rg,
    });
    dependentsByAssociateProfileId.set(dependent.associate_profile_id, entry);
  }

  const associateProfilesByProfileId = new Map(
    (associateProfilesData ?? []).map((profile) => [
      profile.profile_id,
      {
        addressCity: profile.city ?? "",
        addressComplement: profile.complement ?? "",
        addressNeighborhood: profile.neighborhood ?? "",
        addressNumber: profile.number ?? "",
        addressState: profile.state ?? "",
        addressStreet: profile.street ?? "",
        birthDate: profile.birth_date ?? "",
        category: profile.category as AssociateCategory | null,
        cep: profile.cep ?? "",
        cpf: profile.cpf ?? "",
        dependents: dependentsByAssociateProfileId.get(profile.id) ?? [],
        fullName: profile.full_name ?? "",
        membershipNumber: profile.membership_number ?? null,
        nationality: profile.nationality as Nationality | null,
        observation: profile.observation ?? "",
        phone: profile.phone ?? "",
        photoUrl: profile.photo_url,
        rg: profile.rg ?? "",
        termAccepted: profile.term_accepted ?? false,
      } satisfies AdminAssociateProfileSnapshot,
    ]),
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
        profileSnapshot: associateProfile ?? null,
        status: membership.status,
      } as AdminAssociateMembershipRecord;
    })
    .filter((membership): membership is AdminAssociateMembershipRecord => membership !== null);

  return {
    access,
    bootstrapGrants: [],
    memberships,
  };
}
