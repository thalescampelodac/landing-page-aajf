-- Bootstrap associate access by email.
-- Associate and admin access remain separate. A person can be one, the other,
-- or both, and each grant path is managed independently.

create table if not exists aajf.associate_bootstrap_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text generated always as (lower(trim(email))) stored,
  status text not null default 'pending',
  membership_status text not null default 'active',
  claimed_by uuid references aajf.profiles (id) on delete set null,
  claimed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint associate_bootstrap_grants_status_check
    check (status in ('pending', 'claimed', 'revoked')),
  constraint associate_bootstrap_grants_membership_status_check
    check (membership_status in ('active', 'inactive', 'suspended')),
  constraint associate_bootstrap_grants_normalized_email_unique unique (normalized_email)
);

create index if not exists associate_bootstrap_grants_status_idx
  on aajf.associate_bootstrap_grants (status);

drop trigger if exists set_associate_bootstrap_grants_updated_at
  on aajf.associate_bootstrap_grants;

create trigger set_associate_bootstrap_grants_updated_at
before update on aajf.associate_bootstrap_grants
for each row execute function aajf.set_updated_at();

alter table aajf.associate_bootstrap_grants enable row level security;

create policy "associate_bootstrap_grants_select_admin_only"
on aajf.associate_bootstrap_grants
for select
to authenticated
using (app_private.is_active_admin(auth.uid()));

create policy "associate_bootstrap_grants_write_admin_only"
on aajf.associate_bootstrap_grants
for all
to authenticated
using (app_private.is_active_admin(auth.uid()))
with check (app_private.is_active_admin(auth.uid()));

grant select, insert, update, delete
  on table aajf.associate_bootstrap_grants
  to authenticated;

create or replace function app_private.apply_associate_bootstrap_to_user(target_user_id uuid)
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
  from aajf.associate_bootstrap_grants
  where normalized_email = target_email
    and status = 'pending'
  limit 1;

  if bootstrap_grant.id is null then
    return;
  end if;

  insert into aajf.associate_memberships (profile_id, status, notes)
  values (target_user.id, bootstrap_grant.membership_status, bootstrap_grant.notes)
  on conflict (profile_id) do update
    set status = excluded.status,
        notes = excluded.notes,
        updated_at = now();

  insert into aajf.associate_profiles (profile_id, full_name)
  values (
    target_user.id,
    coalesce(target_full_name, split_part(target_user.email, '@', 1))
  )
  on conflict (profile_id) do update
    set full_name = coalesce(aajf.associate_profiles.full_name, excluded.full_name),
        updated_at = now();

  update aajf.associate_bootstrap_grants
  set status = 'claimed',
      claimed_by = target_user.id,
      claimed_at = now()
  where id = bootstrap_grant.id;
end;
$$;

revoke all on function app_private.apply_associate_bootstrap_to_user(uuid)
  from public, anon, authenticated;

create or replace function app_private.handle_auth_user_associate_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.apply_associate_bootstrap_to_user(new.id);
  return new;
end;
$$;

revoke all on function app_private.handle_auth_user_associate_bootstrap()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_associate_bootstrap on auth.users;

create trigger on_auth_user_associate_bootstrap
after insert or update of email on auth.users
for each row execute function app_private.handle_auth_user_associate_bootstrap();

create or replace function app_private.handle_associate_bootstrap_grant_change()
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
    perform app_private.apply_associate_bootstrap_to_user(existing_user_id);
  end if;

  return new;
end;
$$;

revoke all on function app_private.handle_associate_bootstrap_grant_change()
  from public, anon, authenticated;

drop trigger if exists on_associate_bootstrap_grant_change
  on aajf.associate_bootstrap_grants;

create trigger on_associate_bootstrap_grant_change
after insert or update of email, status on aajf.associate_bootstrap_grants
for each row execute function app_private.handle_associate_bootstrap_grant_change();
