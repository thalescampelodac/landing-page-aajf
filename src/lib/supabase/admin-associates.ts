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

export type AdminAssociateExportRow = {
  addressCity: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressNumber: string;
  addressState: string;
  addressStreet: string;
  associateResponsibleMembershipNumber: string;
  associateResponsibleName: string;
  birthDate: string;
  category: string;
  cpf: string;
  email: string;
  grantedAt: string;
  hasPhoto: "Sim" | "Nao";
  membershipNumber: string;
  name: string;
  nationality: string;
  observation: string;
  phone: string;
  rg: string;
  status: "active" | "inactive" | "suspended";
  termAccepted: "Sim" | "Nao" | "";
  type: "associado" | "dependente";
  zipCode: string;
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

export async function getAdminAssociateExportRows(): Promise<
  | { access: Extract<AdminAccess, { status: "authorized" }>; rows: AdminAssociateExportRow[] }
  | { access: Extract<AdminAccess, { status: "unconfigured" | "unauthenticated" | "denied" }> }
> {
  const result = await getAdminAssociatesData();

  if (!isAuthorizedAdminAssociatesData(result)) {
    return { access: result.access };
  }

  const rows = result.memberships.flatMap((membership) => {
    const snapshot = membership.profileSnapshot;
    const associateMembershipNumber = snapshot?.membershipNumber || "Pendente";
    const associateName =
      snapshot?.fullName || membership.profile.fullName || "Sem nome informado";

    const associateRow: AdminAssociateExportRow = {
      addressCity: snapshot?.addressCity || "",
      addressComplement: snapshot?.addressComplement || "",
      addressNeighborhood: snapshot?.addressNeighborhood || "",
      addressNumber: snapshot?.addressNumber || "",
      addressState: snapshot?.addressState || "",
      addressStreet: snapshot?.addressStreet || "",
      associateResponsibleMembershipNumber: associateMembershipNumber,
      associateResponsibleName: associateName,
      birthDate: snapshot?.birthDate || "",
      category: snapshot?.category || "",
      cpf: snapshot?.cpf || "",
      email: membership.profile.email,
      grantedAt: membership.grantedAt,
      hasPhoto: snapshot?.photoUrl ? "Sim" : "Nao",
      membershipNumber: associateMembershipNumber,
      name: associateName,
      nationality: snapshot?.nationality || "",
      observation: snapshot?.observation || membership.notes || "",
      phone: snapshot?.phone || "",
      rg: snapshot?.rg || "",
      status: membership.status,
      termAccepted: snapshot?.termAccepted ? "Sim" : "Nao",
      type: "associado",
      zipCode: snapshot?.cep || "",
    };

    const dependentRows: AdminAssociateExportRow[] =
      snapshot?.dependents.map((dependent) => ({
        addressCity: "",
        addressComplement: "",
        addressNeighborhood: "",
        addressNumber: "",
        addressState: "",
        addressStreet: "",
        associateResponsibleMembershipNumber: associateMembershipNumber,
        associateResponsibleName: associateName,
        birthDate: dependent.birthDate || "",
        category: dependent.category || "",
        cpf: dependent.cpf || "",
        email: "",
        grantedAt: membership.grantedAt,
        hasPhoto: "Nao",
        membershipNumber: dependent.membershipNumber || "Pendente",
        name: dependent.fullName,
        nationality: dependent.nationality || "",
        observation: "",
        phone: "",
        rg: dependent.rg || "",
        status: membership.status,
        termAccepted: "",
        type: "dependente",
        zipCode: "",
      })) ?? [];

    return [associateRow, ...dependentRows];
  });

  return {
    access: result.access,
    rows,
  };
}

function isAuthorizedAdminAssociatesData(
  data: AdminAssociatesData,
): data is Extract<AdminAssociatesData, { access: { status: "authorized" } }> {
  return data.access.status === "authorized";
}
