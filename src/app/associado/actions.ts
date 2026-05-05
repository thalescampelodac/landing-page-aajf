"use server";

import { revalidatePath } from "next/cache";
import {
  associatePhotoAcceptedMimeTypes,
  associatePhotoBucketName,
  associatePhotoMaxFileSizeInBytes,
  associateCategoryOptions,
  nationalityOptions,
} from "@/lib/supabase/associate-profile-shared";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

export type AssociateProfileActionState = {
  error?: string;
  success?: string;
};

type DependentPayload = {
  birthDate: string;
  category: string | null;
  cpf: string | null;
  fullName: string;
  id: string;
  nationality: string | null;
  rg: string | null;
};

export async function saveAssociateProfile(
  _previousState: AssociateProfileActionState,
  formData: FormData,
): Promise<AssociateProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão indisponível para atualizar os dados do associado." };
  }

  const { data: membership, error: membershipError } = await supabase
    .schema("aajf")
    .from("associate_memberships")
    .select("status")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError || !membership) {
    return { error: "A conta atual não possui vínculo ativo de associado." };
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const cpf = String(formData.get("cpf") || "").trim();
  const rg = String(formData.get("rg") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const birthDate = String(formData.get("birthDate") || "").trim();
  const nationality = String(formData.get("nationality") || "").trim();
  const cep = String(formData.get("cep") || "").trim();
  const street = String(formData.get("addressStreet") || "").trim();
  const number = String(formData.get("addressNumber") || "").trim();
  const complement = String(formData.get("addressComplement") || "").trim();
  const neighborhood = String(formData.get("addressNeighborhood") || "").trim();
  const city = String(formData.get("addressCity") || "").trim();
  const state = String(formData.get("addressState") || "").trim();
  const observation = String(formData.get("observation") || "").trim();
  const termAccepted = String(formData.get("termAccepted") || "") === "on";
  const dependentsPayload = String(formData.get("dependentsPayload") || "[]");
  const photoFileEntry = formData.get("photoFile");
  const photoFile =
    photoFileEntry instanceof File && photoFileEntry.size > 0 ? photoFileEntry : null;

  if (!fullName) {
    return { error: "Informe o nome completo do associado." };
  }

  if (!category) {
    return { error: "Selecione a categoria do associado." };
  }

  if (!cpf) {
    return { error: "Informe o CPF do associado." };
  }

  if (!rg) {
    return { error: "Informe o RG do associado." };
  }

  if (!phone) {
    return { error: "Informe o telefone com DDD do associado." };
  }

  if (!birthDate) {
    return { error: "Informe a data de nascimento do associado." };
  }

  if (!nationality) {
    return { error: "Selecione a naturalidade do associado." };
  }

  if (!cep) {
    return { error: "Informe o CEP do associado." };
  }

  if (!street) {
    return { error: "Informe a rua do associado." };
  }

  if (!number) {
    return { error: "Informe o número do endereço." };
  }

  if (!complement) {
    return { error: "Informe o complemento do endereço." };
  }

  if (!neighborhood) {
    return { error: "Informe o bairro do associado." };
  }

  if (!city) {
    return { error: "Informe a cidade do associado." };
  }

  if (!state) {
    return { error: "Informe a UF do associado." };
  }

  if (!observation) {
    return { error: "Informe a observação do associado." };
  }

  if (!termAccepted) {
    return {
      error:
        "O aceite do termo de responsabilidade é obrigatório para salvar a ficha do associado.",
    };
  }

  if (category && !associateCategoryOptions.includes(category as (typeof associateCategoryOptions)[number])) {
    return { error: "Selecione uma categoria válida para o associado." };
  }

  if (cpf && !isValidCpf(cpf)) {
    return { error: "Informe um CPF válido para o associado." };
  }

  if (!isValidPhone(phone)) {
    return { error: "Informe um telefone válido com DDD." };
  }

  if (
    nationality &&
    !nationalityOptions.includes(nationality as (typeof nationalityOptions)[number])
  ) {
    return { error: "Selecione uma naturalidade válida para o associado." };
  }

  if (
    photoFile &&
    !(associatePhotoAcceptedMimeTypes as readonly string[]).includes(photoFile.type)
  ) {
    return { error: "Use uma imagem JPG, PNG ou WEBP para a foto do associado." };
  }

  if (photoFile && photoFile.size > associatePhotoMaxFileSizeInBytes) {
    return { error: "A foto do associado deve ter no máximo 5 MB." };
  }

  let dependents: DependentPayload[] = [];

  try {
    dependents = JSON.parse(dependentsPayload) as DependentPayload[];
  } catch {
    return { error: "Não foi possível interpretar a lista de dependentes." };
  }

  for (const dependent of dependents) {
    if (!dependent.fullName.trim()) {
      return { error: "Todo dependente precisa ter nome completo." };
    }

    if (!dependent.category) {
      return { error: "Todo dependente precisa ter categoria." };
    }

    if (dependent.cpf && !isValidCpf(dependent.cpf)) {
      return { error: "Foi encontrado um CPF inválido em dependentes." };
    }

    if (!dependent.cpf) {
      return { error: "Todo dependente precisa ter CPF." };
    }

    if (!dependent.rg?.trim()) {
      return { error: "Todo dependente precisa ter RG." };
    }

    if (!dependent.birthDate) {
      return { error: "Todo dependente precisa ter data de nascimento." };
    }

    if (!dependent.nationality) {
      return { error: "Todo dependente precisa ter naturalidade." };
    }

    if (
      dependent.category &&
      !associateCategoryOptions.includes(
        dependent.category as (typeof associateCategoryOptions)[number],
      )
    ) {
      return { error: "Foi encontrada uma categoria inválida em dependentes." };
    }

    if (
      dependent.nationality &&
      !nationalityOptions.includes(
        dependent.nationality as (typeof nationalityOptions)[number],
      )
    ) {
      return { error: "Foi encontrada uma naturalidade inválida em dependentes." };
    }
  }

  const { data: existingAssociateProfile, error: existingAssociateProfileError } =
    await supabase
      .schema("aajf")
      .from("associate_profiles")
      .select("id, photo_url")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (existingAssociateProfileError) {
    return { error: existingAssociateProfileError.message };
  }

  let nextPhotoPath = existingAssociateProfile?.photo_url ?? null;

  if (photoFile) {
    try {
      const adminSupabase = createAdminClient();
      const nextExtension = resolvePhotoExtension(photoFile);
      const uploadedPhotoPath = `profiles/${user.id}/associate-card.${nextExtension}`;
      const existingPhotoPath = existingAssociateProfile?.photo_url ?? null;

      const { error: uploadPhotoError } = await adminSupabase.storage
        .from(associatePhotoBucketName)
        .upload(uploadedPhotoPath, photoFile, {
          cacheControl: "3600",
          contentType: photoFile.type,
          upsert: true,
        });

      if (uploadPhotoError) {
        return { error: uploadPhotoError.message };
      }

      if (existingPhotoPath && existingPhotoPath !== uploadedPhotoPath) {
        const { error: removePreviousPhotoError } = await adminSupabase.storage
          .from(associatePhotoBucketName)
          .remove([existingPhotoPath]);

        if (removePreviousPhotoError) {
          return { error: removePreviousPhotoError.message };
        }
      }

      nextPhotoPath = uploadedPhotoPath;
    } catch {
      return {
        error:
          "O upload da foto ainda não está disponível neste ambiente. Verifique a configuração do Storage do Supabase.",
      };
    }
  }

  const { data: profileRecord, error: profileUpsertError } = await supabase
    .schema("aajf")
    .from("associate_profiles")
    .upsert(
      {
        birth_date: birthDate || null,
        category: category || null,
        cep: cep || null,
        city: city || null,
        complement: complement || null,
        cpf: cpf || null,
        full_name: fullName,
        nationality: nationality || null,
        neighborhood: neighborhood || null,
        number: number || null,
        observation: observation || null,
        phone: phone || null,
        photo_url: nextPhotoPath,
        profile_id: user.id,
        rg: rg || null,
        state: state || null,
        street: street || null,
        term_accepted: termAccepted,
        term_accepted_at: termAccepted ? new Date().toISOString() : null,
      },
      { onConflict: "profile_id" },
    )
    .select("id")
    .single();

  if (profileUpsertError || !profileRecord) {
    return { error: profileUpsertError?.message ?? "Não foi possível salvar a ficha do associado." };
  }

  const { error: baseProfileUpdateError } = await supabase
    .schema("aajf")
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (baseProfileUpdateError) {
    return { error: baseProfileUpdateError.message };
  }

  const { data: existingDependents, error: existingDependentsError } = await supabase
    .schema("aajf")
    .from("associate_dependents")
    .select("id")
    .eq("associate_profile_id", profileRecord.id);

  if (existingDependentsError) {
    return { error: existingDependentsError.message };
  }

  const submittedDependentIds = new Set(dependents.map((dependent) => dependent.id));
  const dependentIdsToDelete = (existingDependents ?? [])
    .map((dependent) => dependent.id)
    .filter((dependentId) => !submittedDependentIds.has(dependentId));

  if (dependentIdsToDelete.length) {
    const { error: deleteDependentsError } = await supabase
      .schema("aajf")
      .from("associate_dependents")
      .delete()
      .in("id", dependentIdsToDelete);

    if (deleteDependentsError) {
      return { error: deleteDependentsError.message };
    }
  }

  if (dependents.length) {
    const { error: upsertDependentsError } = await supabase
      .schema("aajf")
      .from("associate_dependents")
      .upsert(
        dependents.map((dependent) => ({
          id: dependent.id,
          associate_profile_id: profileRecord.id,
          birth_date: dependent.birthDate || null,
          category: dependent.category || null,
          cpf: dependent.cpf || null,
          full_name: dependent.fullName.trim(),
          nationality: dependent.nationality || null,
          rg: dependent.rg || null,
        })),
        { onConflict: "id" },
      );

    if (upsertDependentsError) {
      return { error: upsertDependentsError.message };
    }
  }

  revalidatePath("/associado");
  revalidatePath("/admin/associados");

  return { success: "Dados do associado atualizados com sucesso." };
}

function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  let remainder = (sum * 10) % 11;

  if (remainder === 10) {
    remainder = 0;
  }

  if (remainder !== Number(digits[9])) {
    return false;
  }

  sum = 0;

  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10) {
    remainder = 0;
  }

  return remainder === Number(digits[10]);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function resolvePhotoExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}
