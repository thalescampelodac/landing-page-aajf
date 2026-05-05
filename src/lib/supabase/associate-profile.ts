import "server-only";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { associatePhotoBucketName } from "@/lib/supabase/associate-profile-shared";
import type {
  AssociateAreaData,
  AssociateAuthMethods,
  AssociateDependentRecord,
} from "@/lib/supabase/associate-profile-shared";
import { createClient } from "@/lib/supabase/server";

export async function getAssociateAreaData(): Promise<AssociateAreaData> {
  if (!getSupabaseConfig()) {
    return { access: { status: "unconfigured" } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { access: { status: "unauthenticated" } };
  }

  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];
  const authMethods: AssociateAuthMethods = {
    hasGoogle: providers.includes("google"),
    hasPassword: providers.includes("email"),
  };

  const { data: membership, error: membershipError } = await supabase
    .schema("aajf")
    .from("associate_memberships")
    .select("status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return { access: { status: "denied", email: user.email } };
  }

  if (membership.status !== "active") {
    return {
      access: {
        status: "denied",
        email: user.email,
        membershipStatus: membership.status,
      },
    };
  }

  const [{ data: profileData, error: profileError }, { data: associateProfileData, error: associateProfileError }] =
    await Promise.all([
      supabase
        .schema("aajf")
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .schema("aajf")
        .from("associate_profiles")
        .select(
          "id, membership_number, photo_url, full_name, category, cpf, rg, phone, birth_date, nationality, cep, street, number, complement, neighborhood, city, state, observation, term_accepted, associate_dependents(id, membership_number, full_name, category, cpf, rg, birth_date, nationality)",
        )
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (associateProfileError) {
    throw associateProfileError;
  }

  const dependents: AssociateDependentRecord[] = (
    associateProfileData?.associate_dependents ?? []
  ).map((dependent) => ({
    birthDate: dependent.birth_date ?? "",
    category: dependent.category,
    cpf: dependent.cpf,
    fullName: dependent.full_name,
    id: dependent.id,
    membershipNumber: dependent.membership_number ?? null,
    nationality: dependent.nationality,
    rg: dependent.rg,
  }));

  const photoUrl = await resolveAssociatePhotoUrl(associateProfileData?.photo_url ?? null);

  return {
    access: {
      status: "authorized",
      email: profileData?.email ?? user.email,
      profileId: user.id,
    },
    authMethods,
    profile: {
      addressCity: associateProfileData?.city ?? "",
      addressComplement: associateProfileData?.complement ?? "",
      addressNeighborhood: associateProfileData?.neighborhood ?? "",
      addressNumber: associateProfileData?.number ?? "",
      addressState: associateProfileData?.state ?? "",
      addressStreet: associateProfileData?.street ?? "",
      birthDate: associateProfileData?.birth_date ?? "",
      category: associateProfileData?.category ?? null,
      cep: associateProfileData?.cep ?? "",
      cpf: associateProfileData?.cpf ?? "",
      dependents,
      email: profileData?.email ?? user.email ?? "",
      fullName: associateProfileData?.full_name ?? profileData?.full_name ?? "",
      membershipNumber: associateProfileData?.membership_number ?? null,
      nationality: associateProfileData?.nationality ?? null,
      observation: associateProfileData?.observation ?? "",
      phone: associateProfileData?.phone ?? "",
      photoUrl,
      profileId: user.id,
      rg: associateProfileData?.rg ?? "",
      termAccepted: associateProfileData?.term_accepted ?? false,
    },
  };
}

async function resolveAssociatePhotoUrl(photoPath: string | null) {
  if (!photoPath) {
    return null;
  }

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.storage
      .from(associatePhotoBucketName)
      .createSignedUrl(photoPath, 60 * 60);

    if (error) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
