export const associatePhotoBucketName = "associate-profile-photos";
export const associatePhotoAcceptedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const associatePhotoMaxFileSizeInBytes = 5 * 1024 * 1024;

export const associateCategoryOptions = [
  "Kleine Kinder",
  "Gosse Kinder",
  "Heimweh",
] as const;

export const nationalityOptions = [
  "Brasileira",
  "Alemã",
  "Portuguesa",
  "Italiana",
  "Outra",
] as const;

export type AssociateCategory = (typeof associateCategoryOptions)[number];
export type Nationality = (typeof nationalityOptions)[number];

export type AssociateDependentRecord = {
  birthDate: string;
  category: AssociateCategory | null;
  cpf: string | null;
  fullName: string;
  id: string;
  nationality: Nationality | null;
  rg: string | null;
};

export type AssociateProfileRecord = {
  addressCity: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressNumber: string;
  addressState: string;
  addressStreet: string;
  birthDate: string;
  category: AssociateCategory | null;
  cep: string;
  cpf: string;
  dependents: AssociateDependentRecord[];
  email: string;
  fullName: string;
  nationality: Nationality | null;
  observation: string;
  phone: string;
  photoUrl: string | null;
  profileId: string;
  rg: string;
  termAccepted: boolean;
};

export type AssociateAuthMethods = {
  hasGoogle: boolean;
  hasPassword: boolean;
};

export type AssociateAccess =
  | { status: "unconfigured" }
  | { status: "unauthenticated" }
  | { email?: string; membershipStatus?: "inactive" | "suspended"; status: "denied" }
  | { email?: string; profileId: string; status: "authorized" };

export type AssociateAreaData =
  | { access: Exclude<AssociateAccess, { status: "authorized" }> }
  | {
      access: Extract<AssociateAccess, { status: "authorized" }>;
      authMethods: AssociateAuthMethods;
      profile: AssociateProfileRecord;
    };
