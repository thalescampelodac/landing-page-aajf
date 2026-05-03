-- Limpeza manual do ambiente de teste do schema aajf.
-- Mantém apenas o super admin preservado e remove os demais registros ligados ao app.
-- Uso recomendado: SQL Editor no Supabase, apenas em desenvolvimento/teste.
--
-- Como usar:
-- 1. Troque o email abaixo pelo email do super admin que deve permanecer.
-- 2. Execute o script inteiro.
--
-- O que este script faz:
-- - preserva o usuário de auth.users ligado ao email informado
-- - preserva o profile, membership e grants desse super admin
-- - remove os demais registros do schema aajf
-- - remove de auth.users apenas usuários que tenham vínculo com o aajf e não sejam o preservado

begin;

with preserved_email as (
  select lower(trim('thalescampelo@gmail.com')) as email
),
preserved_profile as (
  select profiles.id, lower(trim(profiles.email)) as email
  from aajf.profiles as profiles
  join preserved_email on lower(trim(profiles.email)) = preserved_email.email
),
aajf_guard as (
  select count(*) as preserved_count
  from preserved_profile
),
aajf_user_ids as (
  select id from aajf.profiles
  union
  select claimed_by from aajf.admin_bootstrap_grants where claimed_by is not null
),
deleted_supporter_profiles as (
  delete from aajf.supporter_profiles
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and profile_id not in (select id from preserved_profile)
  returning id
),
deleted_associate_memberships as (
  delete from aajf.associate_memberships
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and profile_id not in (select id from preserved_profile)
  returning id
),
deleted_admin_memberships as (
  delete from aajf.admin_memberships
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and profile_id not in (select id from preserved_profile)
    and coalesce(granted_by, '00000000-0000-0000-0000-000000000000'::uuid) not in (
      select id from preserved_profile
    )
  returning id
),
deleted_bootstrap_grants as (
  delete from aajf.admin_bootstrap_grants
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and normalized_email not in (select email from preserved_profile)
    and coalesce(claimed_by, '00000000-0000-0000-0000-000000000000'::uuid) not in (
      select id from preserved_profile
    )
  returning id
),
deleted_profiles as (
  delete from aajf.profiles
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and id not in (select id from preserved_profile)
  returning id
),
deleted_auth_users as (
  delete from auth.users
  where exists (select 1 from aajf_guard where preserved_count > 0)
    and id in (select id from aajf_user_ids)
    and id not in (select id from preserved_profile)
  returning id
)
select
  (select email from preserved_email) as preserved_super_admin_email,
  (select count(*) from preserved_profile) as preserved_profiles_found,
  (select count(*) from deleted_supporter_profiles) as supporter_profiles_deleted,
  (select count(*) from deleted_associate_memberships) as associate_memberships_deleted,
  (select count(*) from deleted_admin_memberships) as admin_memberships_deleted,
  (select count(*) from deleted_bootstrap_grants) as admin_bootstrap_grants_deleted,
  (select count(*) from deleted_profiles) as profiles_deleted,
  (select count(*) from deleted_auth_users) as auth_users_deleted;

commit;
