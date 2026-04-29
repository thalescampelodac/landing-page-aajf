-- Bootstrap administrative access for AAJF.
-- Emails are granted manually in the database before the first admin signs in.

create table if not exists aajf.admin_bootstrap_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text generated always as (lower(trim(email))) stored,
  role text not null default 'super_admin',
  status text not null default 'pending',
  claimed_by uuid references aajf.profiles (id) on delete set null,
  claimed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_bootstrap_grants_role_check
    check (role in ('super_admin', 'admin')),
  constraint admin_bootstrap_grants_status_check
    check (status in ('pending', 'claimed', 'revoked')),
  constraint admin_bootstrap_grants_normalized_email_unique unique (normalized_email)
);

grant select on aajf.admin_memberships to authenticated;
grant select on aajf.profiles to authenticated;

create index if not exists admin_bootstrap_grants_status_idx
  on aajf.admin_bootstrap_grants (status);

drop trigger if exists set_admin_bootstrap_grants_updated_at
  on aajf.admin_bootstrap_grants;

create trigger set_admin_bootstrap_grants_updated_at
before update on aajf.admin_bootstrap_grants
for each row execute function aajf.set_updated_at();

alter table aajf.admin_bootstrap_grants enable row level security;

drop policy if exists "admin_bootstrap_grants_select_admin_only"
  on aajf.admin_bootstrap_grants;

create policy "admin_bootstrap_grants_select_admin_only"
on aajf.admin_bootstrap_grants
for select
to authenticated
using (app_private.is_active_admin(auth.uid()));

drop policy if exists "admin_bootstrap_grants_write_admin_only"
  on aajf.admin_bootstrap_grants;

create policy "admin_bootstrap_grants_write_admin_only"
on aajf.admin_bootstrap_grants
for all
to authenticated
using (app_private.is_active_admin(auth.uid()))
with check (app_private.is_active_admin(auth.uid()));

create or replace function app_private.apply_admin_bootstrap_to_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user record;
  bootstrap_grant record;
  target_email text;
  target_full_name text;
begin
  select
    users.id,
    users.email,
    users.raw_user_meta_data
  into target_user
  from auth.users
  where users.id = target_user_id;

  if target_user.id is null or target_user.email is null then
    return;
  end if;

  target_email := lower(trim(target_user.email));
  target_full_name := coalesce(
    target_user.raw_user_meta_data ->> 'full_name',
    target_user.raw_user_meta_data ->> 'name'
  );

  insert into aajf.profiles (id, email, full_name)
  values (target_user.id, target_user.email, target_full_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, aajf.profiles.full_name),
        updated_at = now();

  select *
  into bootstrap_grant
  from aajf.admin_bootstrap_grants
  where normalized_email = target_email
    and status = 'pending'
  limit 1;

  if bootstrap_grant.id is null then
    return;
  end if;

  insert into aajf.admin_memberships (profile_id, role, status)
  values (target_user.id, bootstrap_grant.role, 'active')
  on conflict (profile_id) do update
    set role = excluded.role,
        status = 'active',
        updated_at = now();

  update aajf.admin_bootstrap_grants
  set status = 'claimed',
      claimed_by = target_user.id,
      claimed_at = now()
  where id = bootstrap_grant.id;
end;
$$;

revoke all on function app_private.apply_admin_bootstrap_to_user(uuid)
  from public, anon, authenticated;

create or replace function app_private.handle_auth_user_admin_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.apply_admin_bootstrap_to_user(new.id);
  return new;
end;
$$;

revoke all on function app_private.handle_auth_user_admin_bootstrap()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_admin_bootstrap on auth.users;

create trigger on_auth_user_admin_bootstrap
after insert or update of email on auth.users
for each row execute function app_private.handle_auth_user_admin_bootstrap();

create or replace function app_private.handle_admin_bootstrap_grant_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_user_id uuid;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select users.id
  into existing_user_id
  from auth.users
  where lower(trim(users.email)) = new.normalized_email
  limit 1;

  if existing_user_id is not null then
    perform app_private.apply_admin_bootstrap_to_user(existing_user_id);
  end if;

  return new;
end;
$$;

revoke all on function app_private.handle_admin_bootstrap_grant_change()
  from public, anon, authenticated;

drop trigger if exists on_admin_bootstrap_grant_change
  on aajf.admin_bootstrap_grants;

create trigger on_admin_bootstrap_grant_change
after insert or update of email, status on aajf.admin_bootstrap_grants
for each row execute function app_private.handle_admin_bootstrap_grant_change();
