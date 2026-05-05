"use client";

import { useActionState, useEffect, useState } from "react";
import {
  saveAssociateProfile,
  type AssociateProfileActionState,
} from "@/app/associado/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  associatePhotoAcceptedMimeTypes,
  associatePhotoMaxFileSizeInBytes,
  associateCategoryOptions,
  nationalityOptions,
  type AssociateAuthMethods,
  type AssociateCategory,
  type Nationality,
  type AssociateProfileRecord,
} from "@/lib/supabase/associate-profile-shared";

type DependentDraft = {
  birthDate: string;
  category: AssociateCategory | "";
  cpf: string;
  fullName: string;
  id: string;
  membershipNumber: string | null;
  nationality: Nationality | "";
  rg: string;
};

type AssociateDraft = {
  addressCity: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressNumber: string;
  addressState: string;
  addressStreet: string;
  birthDate: string;
  category: AssociateCategory | "";
  cep: string;
  cpf: string;
  dependents: DependentDraft[];
  email: string;
  fullName: string;
  membershipNumber: string | null;
  nationality: Nationality | "";
  observation: string;
  phone: string;
  photoUrl: string | null;
  rg: string;
  termAccepted: boolean;
};

type PasswordState = {
  error?: string;
  success?: string;
};

type PhotoState = {
  error?: string;
};

type CepLookupState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type AssociateAreaManagerProps = {
  authMethods: AssociateAuthMethods;
  profile: AssociateProfileRecord;
};

const initialSaveState: AssociateProfileActionState = {};

const TERM_TEXT = `Por meio deste instrumento, declaro me responsabilizar pela guarda e conservação do TRAJE FOLCLÓRICO do GRUPO DE DANÇAS FOLCLÓRICAS GERMÂNICAS SCHMETTERLING de propriedade da ASSOCIAÇÃO ALEMÃ DE JUIZ DE FORA/MG, inscrita no CNPJ 73.627.960/0001-50 pelo tempo que estiver associado a entidade e integrar o referido grupo.

Me comprometo a devolver o mencionado bem em perfeito estado de conservação, como atualmente se encontra.

Em caso de extravio ou danos que provoquem a perda total ou parcial do bem, fico obrigado a ressarcir a Associação Alemã de Juiz de Fora/MG dos prejuízos ocasionados.`;

export function AssociateAreaManager({
  authMethods,
  profile,
}: AssociateAreaManagerProps) {
  const [saveState, saveAction, isSavingProfile] = useActionState(
    saveAssociateProfile,
    initialSaveState,
  );
  const [accountMethods, setAccountMethods] = useState(authMethods);
  const [draft, setDraft] = useState<AssociateDraft>(() => createDraft(profile));
  const [passwordState, setPasswordState] = useState<PasswordState>({});
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [photoObjectUrl, setPhotoObjectUrl] = useState<string | null>(null);
  const [photoState, setPhotoState] = useState<PhotoState>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [isGeneratingCardPreview, setIsGeneratingCardPreview] = useState(false);
  const [cepLookupState, setCepLookupState] = useState<CepLookupState>({
    status: "idle",
  });
  const [lastResolvedCep, setLastResolvedCep] = useState<string>(
    normalizeCep(profile.cep),
  );

  useEffect(() => {
    setDraft(createDraft(profile));
    setLastResolvedCep(normalizeCep(profile.cep));
    setCepLookupState({ status: "idle" });
  }, [profile]);

  useEffect(() => {
    setAccountMethods(authMethods);
  }, [authMethods]);

  useEffect(() => {
    return () => {
      if (photoObjectUrl) {
        URL.revokeObjectURL(photoObjectUrl);
      }
    };
  }, [photoObjectUrl]);

  function updateDraft<K extends keyof AssociateDraft>(
    key: K,
    value: AssociateDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleOpenCardModal() {
    setIsGeneratingCardPreview(true);

    const previewUrl = await createAssociateCardPngDataUrl({
      birthDate: formatDate(draft.birthDate),
      category: draft.category || "Não informada",
      cpf: draft.cpf || "Não informado",
      fullName: draft.fullName || "Nome em atualização",
      membershipNumber: draft.membershipNumber,
      nationality: draft.nationality || "Não informada",
      photoUrl: draft.photoUrl,
      profileId: profile.profileId,
    });

    setCardPreviewUrl(previewUrl);
    setIsGeneratingCardPreview(false);
    setIsCardModalOpen(true);
  }

  function handleCepChange(value: string) {
    updateDraft("cep", formatCep(value));

    if (normalizeCep(value) !== lastResolvedCep) {
      setCepLookupState({ status: "idle" });
    }
  }

  function handleDependentChange<K extends keyof DependentDraft>(
    dependentId: string,
    key: K,
    value: DependentDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      dependents: current.dependents.map((dependent) =>
        dependent.id === dependentId ? { ...dependent, [key]: value } : dependent,
      ),
    }));
  }

  function addDependent() {
    setDraft((current) => ({
      ...current,
      dependents: [
        ...current.dependents,
        {
          birthDate: "",
          category: "",
          cpf: "",
          fullName: "",
          id: createClientId(),
          membershipNumber: null,
          nationality: "",
          rg: "",
        },
      ],
    }));
  }

  function removeDependent(dependentId: string) {
    setDraft((current) => ({
      ...current,
      dependents: current.dependents.filter((dependent) => dependent.id !== dependentId),
    }));
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !(associatePhotoAcceptedMimeTypes as readonly string[]).includes(file.type)
    ) {
      setPhotoState({
        error: "Use uma imagem JPG, PNG ou WEBP para a foto do associado.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > associatePhotoMaxFileSizeInBytes) {
      setPhotoState({
        error: "A foto deve ter no máximo 5 MB para manter o cadastro leve.",
      });
      event.target.value = "";
      return;
    }

    if (photoObjectUrl) {
      URL.revokeObjectURL(photoObjectUrl);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setPhotoState({});
    setPhotoObjectUrl(nextObjectUrl);
    updateDraft("photoUrl", nextObjectUrl);
  }

  async function handlePasswordSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setPasswordState({ error: "A senha precisa ter pelo menos 8 caracteres." });
      return;
    }

    if (password !== passwordConfirmation) {
      setPasswordState({ error: "A confirmação de senha não confere." });
      return;
    }

    setPasswordState({});
    setIsSavingPassword(true);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordState({ error: error.message });
      setIsSavingPassword(false);
      return;
    }

    setPassword("");
    setPasswordConfirmation("");
    setAccountMethods((current) => ({ ...current, hasPassword: true }));
    setPasswordState({
      success: "Senha atualizada com sucesso para os próximos acessos.",
    });
    setIsSavingPassword(false);
  }

  async function handleCepLookup() {
    const cep = normalizeCep(draft.cep);

    if (!cep) {
      setCepLookupState({ status: "idle" });
      return;
    }

    if (!isValidCep(cep)) {
      setCepLookupState({
        status: "error",
        message: "Informe um CEP com 8 dígitos para buscar o endereço.",
      });
      return;
    }

    if (cep === lastResolvedCep) {
      return;
    }

    setCepLookupState({
      status: "loading",
      message: "Consultando o endereço para o CEP informado...",
    });

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("cep-lookup-failed");
      }

      const payload = (await response.json()) as ViaCepResponse;

      if (payload.erro) {
        setCepLookupState({
          status: "error",
          message: "CEP não encontrado. Confira o número informado.",
        });
        return;
      }

      setDraft((current) => ({
        ...current,
        addressCity: payload.localidade || current.addressCity,
        addressNeighborhood: payload.bairro || current.addressNeighborhood,
        addressState: payload.uf || current.addressState,
        addressStreet: payload.logradouro || current.addressStreet,
      }));
      setLastResolvedCep(cep);
      setCepLookupState({
        status: "success",
        message:
          "Endereço preenchido automaticamente. Revise número e complemento antes de salvar.",
      });
    } catch {
      setCepLookupState({
        status: "error",
        message:
          "Não foi possível consultar o CEP agora. Você pode continuar preenchendo os campos manualmente.",
      });
    }
  }

  const dependentPayload = JSON.stringify(
    draft.dependents.map((dependent) => ({
      birthDate: dependent.birthDate,
      category: dependent.category || null,
      cpf: dependent.cpf || null,
      fullName: dependent.fullName,
      id: dependent.id,
      membershipNumber: dependent.membershipNumber,
      nationality: dependent.nationality || null,
      rg: dependent.rg || null,
    })),
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-5">
        <form action={saveAction} className="grid gap-5">
          <input name="dependentsPayload" type="hidden" value={dependentPayload} />

          <article className="soft-card rounded-[2rem] p-8 sm:p-10">
            <p className="section-eyebrow text-[0.88rem]">
              Dados do Associado
            </p>
            <div className="-mt-8 flex justify-end">
              <button
                className="secondary-button"
                onClick={handleOpenCardModal}
                type="button"
              >
                {isGeneratingCardPreview ? "Gerando prévia..." : "Visualizar carteirinha"}
              </button>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="rounded-[1.6rem] border border-[rgba(23,54,45,0.1)] bg-white/70 p-6">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,22rem)] xl:items-start">
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    <TextField
                      label="Nome completo"
                      name="fullName"
                      onChange={(value) => updateDraft("fullName", value)}
                      required
                      value={draft.fullName}
                    />
                    <ReadOnlyField label="Email" value={draft.email} />
                    <ReadOnlyField
                      label="Matrícula"
                      value={draft.membershipNumber || "Será atribuída automaticamente"}
                    />
                    <SelectField
                      label="Categoria"
                      name="category"
                      onChange={(value) =>
                        updateDraft("category", value as AssociateCategory | "")
                      }
                      options={associateCategoryOptions}
                      placeholder="Selecione uma categoria"
                      required
                      value={draft.category}
                    />
                    <TextField
                      label="CPF"
                      name="cpf"
                      inputMode="numeric"
                      maxLength={14}
                      onChange={(value) => updateDraft("cpf", formatCpf(value))}
                      required
                      value={draft.cpf}
                    />
                    <TextField
                      label="RG"
                      name="rg"
                      onChange={(value) => updateDraft("rg", value)}
                      required
                      value={draft.rg}
                    />
                    <TextField
                      label="Telefone com DDD"
                      name="phone"
                      inputMode="numeric"
                      maxLength={15}
                      onChange={(value) => updateDraft("phone", formatPhone(value))}
                      required
                      value={draft.phone}
                    />
                    <DateField
                      label="Data de nascimento"
                      name="birthDate"
                      onChange={(value) => updateDraft("birthDate", value)}
                      required
                      value={draft.birthDate}
                    />
                    <SelectField
                      label="Naturalidade"
                      name="nationality"
                      onChange={(value) =>
                        updateDraft("nationality", value as Nationality | "")
                      }
                      options={nationalityOptions}
                      placeholder="Selecione uma naturalidade"
                      required
                      value={draft.nationality}
                    />
                  </div>

                  <div className="grid content-start gap-5">
                    <div className="rounded-[1.5rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.72)] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="section-eyebrow">Foto</p>
                          <h3 className="mt-2 text-2xl font-heading text-[var(--color-green-deep)]">
                            Identificação visual
                          </h3>
                        </div>
                      </div>

                      <label className="form-field mt-5">
                        <span>Arquivo de imagem</span>
                        <input
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          name="photoFile"
                          onChange={handlePhotoChange}
                          type="file"
                        />
                      </label>

                      {photoState.error ? (
                        <p className="mt-4 text-sm leading-7 text-[var(--color-red-deep)]">
                          {photoState.error}
                        </p>
                      ) : null}

                      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                        Envie uma foto nítida, em JPG, PNG ou WEBP, com até 5 MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[rgba(23,54,45,0.1)] bg-white/70 p-6">
                <p className="section-eyebrow">Endereço</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <TextField
                    label="CEP"
                    name="cep"
                    inputMode="numeric"
                    maxLength={9}
                    onBlur={handleCepLookup}
                    onChange={handleCepChange}
                    required
                    value={draft.cep}
                  />
                  <TextField
                    label="Rua"
                    name="addressStreet"
                    onChange={(value) => updateDraft("addressStreet", value)}
                    required
                    value={draft.addressStreet}
                  />
                  <TextField
                    label="Número"
                    name="addressNumber"
                    onChange={(value) => updateDraft("addressNumber", value)}
                    required
                    value={draft.addressNumber}
                  />
                  <TextField
                    label="Complemento"
                    name="addressComplement"
                    onChange={(value) => updateDraft("addressComplement", value)}
                    required
                    value={draft.addressComplement}
                  />
                  <TextField
                    label="Bairro"
                    name="addressNeighborhood"
                    onChange={(value) => updateDraft("addressNeighborhood", value)}
                    required
                    value={draft.addressNeighborhood}
                  />
                  <TextField
                    label="Cidade"
                    name="addressCity"
                    onChange={(value) => updateDraft("addressCity", value)}
                    required
                    value={draft.addressCity}
                  />
                  <TextField
                    label="UF"
                    maxLength={2}
                    name="addressState"
                    onChange={(value) =>
                      updateDraft("addressState", value.toUpperCase())
                    }
                    required
                    value={draft.addressState}
                  />
                </div>
                {cepLookupState.status !== "idle" ? (
                  <p
                    className={`mt-4 text-sm leading-7 ${
                      cepLookupState.status === "error"
                        ? "text-[var(--color-red-deep)]"
                        : cepLookupState.status === "success"
                          ? "text-[var(--color-green-deep)]"
                          : "text-[var(--color-muted)]"
                    }`}
                  >
                    {cepLookupState.message}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                    Ao preencher o CEP e sair do campo, a rua, o bairro, a cidade e
                    a UF serão sugeridos automaticamente.
                  </p>
                )}
              </div>

              <div className="rounded-[1.6rem] border border-[rgba(23,54,45,0.1)] bg-white/70 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="section-eyebrow">Dependentes</p>
                    <h3 className="mt-2 text-2xl font-heading text-[var(--color-green-deep)]">
                      Gerencie dependentes vinculados
                    </h3>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={addDependent}
                    type="button"
                  >
                    + Adicionar dependente
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  {draft.dependents.length ? (
                    draft.dependents.map((dependent, index) => (
                      <div
                        className="rounded-[1.5rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.78)] p-5"
                        key={dependent.id}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-base font-semibold text-[var(--color-green-deep)]">
                            Dependente {index + 1}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-muted)]">
                            Matrícula: {dependent.membershipNumber || "Será atribuída automaticamente"}
                          </p>
                          <button
                            className="rounded-full border border-[rgba(154,31,43,0.2)] bg-[rgba(154,31,43,0.08)] px-5 py-2 text-sm font-semibold text-[var(--color-red-deep)] transition hover:bg-[rgba(154,31,43,0.14)]"
                            onClick={() => removeDependent(dependent.id)}
                            type="button"
                          >
                            Remover
                          </button>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <TextField
                            label="Nome completo"
                            onChange={(value) =>
                              handleDependentChange(dependent.id, "fullName", value)
                            }
                            required
                            value={dependent.fullName}
                          />
                          <SelectField
                            label="Categoria"
                            onChange={(value) =>
                              handleDependentChange(
                                dependent.id,
                                "category",
                                value as AssociateCategory | "",
                              )
                            }
                            options={associateCategoryOptions}
                            placeholder="Selecione uma categoria"
                            required
                            value={dependent.category}
                          />
                          <TextField
                            label="CPF"
                            inputMode="numeric"
                            maxLength={14}
                            onChange={(value) =>
                              handleDependentChange(
                                dependent.id,
                                "cpf",
                                formatCpf(value),
                              )
                            }
                            required
                            value={dependent.cpf}
                          />
                          <TextField
                            label="RG"
                            onChange={(value) =>
                              handleDependentChange(dependent.id, "rg", value)
                            }
                            required
                            value={dependent.rg}
                          />
                          <DateField
                            label="Data de nascimento"
                            onChange={(value) =>
                              handleDependentChange(dependent.id, "birthDate", value)
                            }
                            required
                            value={dependent.birthDate}
                          />
                          <SelectField
                            label="Naturalidade"
                            onChange={(value) =>
                              handleDependentChange(
                                dependent.id,
                                "nationality",
                                value as Nationality | "",
                              )
                            }
                            options={nationalityOptions}
                            placeholder="Selecione uma naturalidade"
                            required
                            value={dependent.nationality}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-[rgba(23,54,45,0.14)] bg-[rgba(255,250,243,0.66)] p-5 text-sm leading-7 text-[var(--color-muted)]">
                      Nenhum dependente cadastrado por enquanto. Quando houver necessidade,
                      use a caixa com o símbolo de + para iniciar essa lista.
                    </div>
                  )}

                  <button
                    className="group flex min-h-36 w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[rgba(23,54,45,0.18)] bg-[rgba(255,250,243,0.72)] p-6 text-center transition hover:border-[rgba(23,54,45,0.3)] hover:bg-[rgba(255,250,243,0.92)]"
                    onClick={addDependent}
                    type="button"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(23,54,45,0.14)] bg-white text-3xl font-light text-[var(--color-green-deep)] transition group-hover:scale-105">
                      +
                    </span>
                    <span className="mt-4 text-base font-semibold text-[var(--color-green-deep)]">
                      Adicionar dependente
                    </span>
                    <span className="mt-2 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                      Use esta área sempre que precisar incluir o primeiro dependente
                      ou acrescentar novos vínculos na ficha do associado.
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[rgba(23,54,45,0.1)] bg-white/70 p-6">
                <label className="form-field">
                  <span>Observação</span>
                  <textarea
                    className="min-h-28"
                    name="observation"
                    onChange={(event) => updateDraft("observation", event.target.value)}
                    required
                    value={draft.observation}
                  />
                </label>
              </div>
              <div className="rounded-[1.6rem] border border-[rgba(23,54,45,0.1)] bg-[rgba(255,250,243,0.72)] p-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] xl:items-start">
                  <div>
                    <p className="section-eyebrow">Termo de responsabilidade</p>
                    <h3 className="mt-3 text-3xl font-heading text-[var(--color-green-deep)]">
                      Aceite do associado
                    </h3>
                    <div className="mt-6 rounded-[1.5rem] border border-[rgba(23,54,45,0.1)] bg-white/80 p-5">
                      <p className="whitespace-pre-line text-sm leading-7 text-[var(--color-green-deep)]">
                        {TERM_TEXT}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 rounded-[1.5rem] border border-[rgba(23,54,45,0.1)] bg-white/80 p-5">
                    <label className="flex items-start gap-3">
                      <input
                        checked={draft.termAccepted}
                        name="termAccepted"
                        onChange={(event) => updateDraft("termAccepted", event.target.checked)}
                        type="checkbox"
                      />
                      <span className="text-sm leading-7 text-[var(--color-green-deep)]">
                        Declaro ter lido e estar de pleno acordo com o termo acima
                        descrito.
                      </span>
                    </label>

                    <div className="grid gap-3">
                      {saveState.error ? (
                        <p className="text-sm font-medium text-[var(--color-red-deep)]">
                          {saveState.error}
                        </p>
                      ) : null}
                      {saveState.success ? (
                        <p className="text-sm font-medium text-[var(--color-green-deep)]">
                          {saveState.success}
                        </p>
                      ) : null}

                      <div className="flex flex-col gap-3">
                        <button
                          className="primary-button"
                          disabled={isSavingProfile || !draft.termAccepted}
                          type="submit"
                        >
                          {isSavingProfile ? "Salvando..." : "Salvar dados do associado"}
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            if (photoObjectUrl) {
                              URL.revokeObjectURL(photoObjectUrl);
                            }
                            const restoredDraft = createDraft(profile);
                            setDraft(restoredDraft);
                            setLastResolvedCep(normalizeCep(restoredDraft.cep));
                            setCepLookupState({ status: "idle" });
                            setPhotoObjectUrl(null);
                            setPassword("");
                            setPasswordConfirmation("");
                            setPasswordState({});
                          }}
                          type="button"
                        >
                          Restaurar dados carregados
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </form>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <article className="soft-card rounded-[2rem] p-8">
            <p className="section-eyebrow">Segurança da Conta</p>
            <h2 className="mt-4 text-3xl font-heading text-[var(--color-green-deep)]">
              Senha e método de acesso
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Este bloco fica separado da ficha para evitar competição por espaço
              e deixar a atualização cadastral mais fluida. Se você começou com
              Google, definir uma senha aqui habilita também o login por email e
              senha.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {accountMethods.hasGoogle ? (
                <span className="badge-chip">Google habilitado</span>
              ) : null}
              {accountMethods.hasPassword ? (
                <span className="badge-chip">Email e senha habilitados</span>
              ) : (
                <span className="badge-chip">Email e senha ainda não habilitados</span>
              )}
              <span className="badge-chip">Status ativo</span>
            </div>

            <form className="mt-8 grid gap-5 lg:max-w-2xl lg:grid-cols-2" onSubmit={handlePasswordSave}>
              <label className="form-field">
                <span>Nova senha</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>

              <label className="form-field">
                <span>Confirmar senha</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                  type="password"
                  value={passwordConfirmation}
                />
              </label>

              <div className="grid gap-3 lg:col-span-2">
                {passwordState.error ? (
                  <p className="text-sm font-medium text-[var(--color-red-deep)]">
                    {passwordState.error}
                  </p>
                ) : null}
                {passwordState.success ? (
                  <p className="text-sm font-medium text-[var(--color-green-deep)]">
                    {passwordState.success}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="primary-button"
                    disabled={isSavingPassword}
                    type="submit"
                  >
                    {isSavingPassword ? "Salvando..." : "Atualizar senha"}
                  </button>
                </div>
              </div>
            </form>
          </article>

          <article className="soft-card rounded-[2rem] p-8">
            <p className="section-eyebrow">Informações complementares</p>
            <h2 className="mt-4 text-3xl font-heading text-[var(--color-green-deep)]">
              Espaço reservado para próximos módulos
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              Aqui vamos encaixar observações da associação, conteúdos
              exclusivos e detalhes adicionais do cadastro conforme as próximas
              issues forem amadurecendo.
            </p>
          </article>
        </section>
      </section>

      {isCardModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,20,0.62)] px-4 py-6">
          <div className="relative w-full max-w-[54rem] rounded-[2rem] border border-white/60 bg-[rgba(255,250,243,0.96)] p-6 shadow-[0_24px_80px_rgba(9,28,22,0.28)] backdrop-blur">
            <button
              aria-label="Fechar prévia da carteirinha"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[rgba(23,54,45,0.12)] bg-white text-lg text-[var(--color-green-deep)] transition hover:bg-[rgba(255,250,243,0.92)]"
              onClick={() => setIsCardModalOpen(false)}
              type="button"
            >
              ×
            </button>

            <div className="flex justify-center">
              {cardPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`Prévia da carteirinha de ${draft.fullName || "associado"}`}
                  className="h-auto w-full max-w-[46rem] rounded-[1.25rem] shadow-[0_18px_48px_rgba(16,46,37,0.18)]"
                  src={cardPreviewUrl}
                />
              ) : (
                <div className="grid min-h-[18rem] w-full max-w-[46rem] place-items-center rounded-[1.25rem] border border-[rgba(23,54,45,0.12)] bg-[rgba(255,250,243,0.72)] text-sm text-[var(--color-muted)]">
                  Não foi possível gerar a prévia da carteirinha.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="secondary-button"
                onClick={() => setIsCardModalOpen(false)}
                type="button"
              >
                Fechar
              </button>
              <button
                className="primary-button"
                onClick={() =>
                  downloadAssociateCardPng({
                    birthDate: formatDate(draft.birthDate),
                    category: draft.category || "Não informada",
                    cpf: draft.cpf || "Não informado",
                    fullName: draft.fullName || "Nome em atualização",
                    membershipNumber: draft.membershipNumber,
                    nationality: draft.nationality || "Não informada",
                    photoUrl: draft.photoUrl,
                    profileId: profile.profileId,
                  })
                }
                type="button"
              >
                Baixar carteirinha em PNG
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function downloadAssociateCardPng({
  birthDate,
  category,
  cpf,
  fullName,
  membershipNumber,
  nationality,
  photoUrl,
  profileId,
}: {
  birthDate: string;
  category: string;
  cpf: string;
  fullName: string;
  membershipNumber: string | null;
  nationality: string;
  photoUrl: string | null;
  profileId: string;
}) {
  const dataUrl = await createAssociateCardPngDataUrl({
    birthDate,
    category,
    cpf,
    fullName,
    membershipNumber,
    nationality,
    photoUrl,
    profileId,
  });

  if (!dataUrl) {
    return;
  }

  const downloadLink = document.createElement("a");
  downloadLink.href = dataUrl;
  downloadLink.download = `${slugifyFileName(fullName || "associado")}-carteirinha.png`;
  downloadLink.click();
}

async function createAssociateCardPngDataUrl({
  birthDate,
  category,
  cpf,
  fullName,
  membershipNumber,
  nationality,
  photoUrl,
  profileId,
}: {
  birthDate: string;
  category: string;
  cpf: string;
  fullName: string;
  membershipNumber: string | null;
  nationality: string;
  photoUrl: string | null;
  profileId: string;
}) {
  const canvas = document.createElement("canvas");
  const width = 760;
  const height = 480;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.fillStyle = "#efe1c9";
  context.fillRect(0, 0, width, height);

  drawRoundedRect(context, 14, 14, width - 28, height - 28, 34);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffaf2");
  gradient.addColorStop(1, "#f8efe1");
  context.fillStyle = gradient;
  context.fill();

  context.save();
  drawRoundedRect(context, 14, 14, width - 28, height - 28, 34);
  context.clip();
  context.fillStyle = "#173b2f";
  context.fillRect(14, 14, 258, height - 28);
  context.restore();

  context.strokeStyle = "rgba(23,59,47,0.12)";
  context.lineWidth = 1;
  drawRoundedRect(context, 24, 24, width - 48, height - 48, 26);
  context.stroke();

  context.fillStyle = "rgba(255,247,237,0.96)";
  context.beginPath();
  context.arc(83, 90, 34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#173b2f";
  context.font = '700 30px "Cormorant Garamond", Georgia, serif';
  context.textAlign = "center";
  context.fillText("AAJF", 83, 99);

  context.textAlign = "left";
  context.fillStyle = "rgba(255,247,237,0.84)";
  context.font = '700 12px "Geist", system-ui, sans-serif';
  drawMultilineText(
    context,
    "ASSOCIAÇÃO CULTURAL E RECREATIVA BRASIL-ALEMANHA",
    48,
    156,
    165,
    18,
  );

  drawMiniQr(context, 48, 330, 84);
  context.fillStyle = "rgba(255,247,237,0.74)";
  context.font = '500 11px "Geist", system-ui, sans-serif';
  drawMultilineText(
    context,
    "Documento digital de identificação do associado.",
    48,
    430,
    160,
    16,
  );

  context.fillStyle = "#d8b45f";
  context.font = '800 12px "Geist", system-ui, sans-serif';
  context.fillText("CARTEIRA DO ASSOCIADO", 316, 72);

  context.fillStyle = "#5f7268";
  context.font = '800 12px "Geist", system-ui, sans-serif';
  context.fillText("ASSOCIADO", 316, 114);

  context.textAlign = "right";
  context.fillText(formatAssociateCardId(profileId, membershipNumber), 704, 72);
  context.textAlign = "left";

  context.fillStyle = "#173b2f";
  context.font = '400 68px "Cormorant Garamond", Georgia, serif';
  drawMultilineText(context, fullName, 316, 182, 290, 66);

  await drawPhotoBlock(context, photoUrl, 610, 92, 130, 160);

  drawCardField(context, "Categoria", category, 316, 288, 150);
  drawCardField(context, "CPF", cpf, 478, 288, 126);
  drawCardField(context, "Nascimento", birthDate, 622, 288, 82);
  drawCardField(context, "Naturalidade", nationality, 316, 370, 288);
  drawCardField(context, "Validade", "31/12/2026", 622, 370, 82);

  context.strokeStyle = "rgba(23,59,47,0.22)";
  context.setLineDash([4, 5]);
  context.beginPath();
  context.moveTo(316, 408);
  context.lineTo(704, 408);
  context.stroke();
  context.setLineDash([]);

  drawStatusPill(context, 316, 430, "Associado ativo");

  context.fillStyle = "#5f7268";
  context.font = '500 11px "Geist", system-ui, sans-serif';
  context.textAlign = "right";
  drawMultilineText(
    context,
    "Uso interno da Associação Alemã de Juiz de Fora. Validação mediante QR Code.",
    704,
    438,
    180,
    16,
    "right",
  );

  return canvas.toDataURL("image/png");
}

async function drawPhotoBlock(
  context: CanvasRenderingContext2D,
  photoUrl: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  drawRoundedRect(context, x, y, width, height, 22);
  const gradient = context.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#e8dfd1");
  gradient.addColorStop(1, "#fffaf2");
  context.fillStyle = gradient;
  context.fill();

  context.save();
  drawRoundedRect(context, x, y, width, height, 22);
  context.clip();

  if (photoUrl) {
    try {
      const image = await loadImage(photoUrl);
      context.drawImage(image, x, y, width, height);
    } catch {
      // Fallback to placeholder text below.
    }
  }

  context.restore();

  context.strokeStyle = "rgba(23,59,47,0.18)";
  context.lineWidth = 1;
  drawRoundedRect(context, x, y, width, height, 22);
  context.stroke();

  context.strokeStyle = "rgba(255,255,255,0.72)";
  context.lineWidth = 6;
  drawRoundedRect(context, x + 6, y + 6, width - 12, height - 12, 18);
  context.stroke();

  if (!photoUrl) {
    context.fillStyle = "#5f7268";
    context.font = '900 18px "Geist", system-ui, sans-serif';
    context.textAlign = "center";
    drawMultilineText(context, "SEM\nFOTO", x + width / 2, y + 78, width - 26, 22, "center");
    context.textAlign = "left";
  }
}

function drawCardField(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  context.fillStyle = "#5f7268";
  context.font = '900 12px "Geist", system-ui, sans-serif';
  context.fillText(label.toUpperCase(), x, y);

  context.fillStyle = "#173b2f";
  context.font = '800 19px "Geist", system-ui, sans-serif';
  context.fillText(value, x, y + 28);

  context.strokeStyle = "rgba(23,59,47,0.16)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, y + 44);
  context.lineTo(x + width, y + 44);
  context.stroke();
}

function drawStatusPill(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
) {
  drawRoundedRect(context, x, y, 112, 34, 17);
  context.fillStyle = "rgba(23,59,47,0.08)";
  context.fill();
  context.strokeStyle = "rgba(23,59,47,0.12)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#22c55e";
  context.beginPath();
  context.arc(x + 20, y + 17, 5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#173b2f";
  context.font = '900 12px "Geist", system-ui, sans-serif';
  context.fillText(label, x + 34, y + 21);
}

function drawMiniQr(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  drawRoundedRect(context, x, y, size, size, 18);
  context.fillStyle = "#fff7ed";
  context.fill();

  context.lineWidth = 8;
  context.strokeStyle = "#fff7ed";
  context.stroke();

  const cell = 12;
  context.fillStyle = "#173b2f";
  const pattern = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];

  for (let row = 0; row < pattern.length; row += 1) {
    for (let col = 0; col < pattern[row].length; col += 1) {
      if (!pattern[row][col]) continue;
      context.fillRect(x + 10 + col * cell, y + 10 + row * cell, 8, 8);
    }
  }
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawMultilineText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "left",
) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (word.includes("\n")) {
      const parts = word.split("\n");

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        const candidate = currentLine ? `${currentLine} ${part}`.trim() : part;

        if (context.measureText(candidate).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = part;
        } else {
          currentLine = candidate;
        }

        if (index < parts.length - 1) {
          lines.push(currentLine);
          currentLine = "";
        }
      }

      continue;
    }

    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  context.textAlign = align;

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  context.textAlign = "left";
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function slugifyFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function TextField({
  label,
  inputMode,
  maxLength,
  name,
  onBlur,
  onChange,
  required,
  value,
}: {
  label: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        aria-readonly="true"
        className="cursor-default bg-[rgba(247,242,232,0.96)] text-[var(--color-green-deep)]"
        disabled
        readOnly
        tabIndex={-1}
        value={value}
      />
    </label>
  );
}

function DateField({
  label,
  name,
  onChange,
  required,
  value,
}: {
  label: string;
  name?: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type="date"
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  onChange,
  options,
  placeholder,
  required,
  value,
}: {
  label: string;
  name?: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select
        className="rounded-2xl border border-[rgba(23,54,45,0.12)] bg-[rgba(255,250,243,0.88)] px-4 py-3 text-[var(--color-ink)]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function createDraft(profile: AssociateProfileRecord): AssociateDraft {
  return {
    addressCity: profile.addressCity,
    addressComplement: profile.addressComplement,
    addressNeighborhood: profile.addressNeighborhood,
    addressNumber: profile.addressNumber,
    addressState: profile.addressState,
    addressStreet: profile.addressStreet,
    birthDate: profile.birthDate,
    category: profile.category ?? "",
    cep: profile.cep,
    cpf: profile.cpf,
    dependents: profile.dependents.map((dependent) => ({
      birthDate: dependent.birthDate,
      category: dependent.category ?? "",
      cpf: dependent.cpf ?? "",
      fullName: dependent.fullName,
      id: dependent.id,
      membershipNumber: dependent.membershipNumber ?? null,
      nationality: dependent.nationality ?? "",
      rg: dependent.rg ?? "",
    })),
    email: profile.email,
    fullName: profile.fullName,
    membershipNumber: profile.membershipNumber ?? null,
    nationality: profile.nationality ?? "",
    observation: profile.observation,
    phone: profile.phone,
    photoUrl: profile.photoUrl,
    rg: profile.rg,
    termAccepted: profile.termAccepted,
  };
}

function createClientId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `dependent-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDate(value: string) {
  if (!value) {
    return "Não informado";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatAssociateCardId(profileId: string, membershipNumber: string | null) {
  if (membershipNumber) {
    return `AAJF-${membershipNumber}`;
  }

  const suffix = profileId.replace(/-/g, "").slice(-6).toUpperCase();
  return `AAJF-${suffix || "TEMP"}`;
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type ViaCepResponse = {
  bairro?: string;
  erro?: boolean;
  localidade?: string;
  logradouro?: string;
  uf?: string;
};

function formatCep(value: string) {
  const digits = normalizeCep(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCep(value: string) {
  return /^\d{8}$/.test(value);
}
