-- Initial access schema for AAJF.
-- Supabase Auth owns identity. These tables own app authorization.

create schema if not exists aajf;

grant usage on schema aajf to authenticated;

create table if not exists aajf.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists aajf.admin_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references aajf.profiles (id) on delete cascade,
  role text not null,
  status text not null default 'active',
  granted_by uuid references aajf.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_memberships_role_check
    check (role in ('super_admin', 'admin')),
  constraint admin_memberships_status_check
    check (status in ('active', 'inactive', 'suspended')),
  constraint admin_memberships_profile_unique unique (profile_id)
);

create table if not exists aajf.associate_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references aajf.profiles (id) on delete cascade,
  status text not null default 'active',
  granted_by uuid references aajf.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint associate_memberships_status_check
    check (status in ('active', 'inactive', 'suspended')),
  constraint associate_memberships_profile_unique unique (profile_id)
);

create table if not exists aajf.supporter_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references aajf.profiles (id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supporter_profiles_status_check
    check (status in ('active', 'inactive', 'suspended')),
  constraint supporter_profiles_profile_unique unique (profile_id)
);

create index if not exists profiles_email_idx
  on aajf.profiles (email);

create index if not exists admin_memberships_profile_status_idx
  on aajf.admin_memberships (profile_id, status);

create index if not exists associate_memberships_profile_status_idx
  on aajf.associate_memberships (profile_id, status);

create index if not exists supporter_profiles_profile_status_idx
  on aajf.supporter_profiles (profile_id, status);

create or replace function aajf.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on aajf.profiles;
create trigger set_profiles_updated_at
before update on aajf.profiles
for each row execute function aajf.set_updated_at();

drop trigger if exists set_admin_memberships_updated_at on aajf.admin_memberships;
create trigger set_admin_memberships_updated_at
before update on aajf.admin_memberships
for each row execute function aajf.set_updated_at();

drop trigger if exists set_associate_memberships_updated_at on aajf.associate_memberships;
create trigger set_associate_memberships_updated_at
before update on aajf.associate_memberships
for each row execute function aajf.set_updated_at();

drop trigger if exists set_supporter_profiles_updated_at on aajf.supporter_profiles;
create trigger set_supporter_profiles_updated_at
before update on aajf.supporter_profiles
for each row execute function aajf.set_updated_at();

alter table aajf.profiles enable row level security;
alter table aajf.admin_memberships enable row level security;
alter table aajf.associate_memberships enable row level security;
alter table aajf.supporter_profiles enable row level security;

create schema if not exists app_private;

revoke all on schema app_private from public;
revoke all on schema app_private from anon;
revoke all on schema app_private from authenticated;

create or replace function app_private.is_active_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = aajf, pg_temp
stable
as $$
  select exists (
    select 1
    from aajf.admin_memberships
    where profile_id = user_id
      and status = 'active'
  );
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_active_admin(uuid) to authenticated;

create policy "profiles_select_own_or_admin"
on aajf.profiles
for select
to authenticated
using (
  id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "profiles_insert_own"
on aajf.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
on aajf.profiles
for update
to authenticated
using (
  id = auth.uid()
  or app_private.is_active_admin(auth.uid())
)
with check (
  id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "admin_memberships_select_own_or_admin"
on aajf.admin_memberships
for select
to authenticated
using (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "admin_memberships_write_admin_only"
on aajf.admin_memberships
for all
to authenticated
using (app_private.is_active_admin(auth.uid()))
with check (app_private.is_active_admin(auth.uid()));

create policy "associate_memberships_select_own_or_admin"
on aajf.associate_memberships
for select
to authenticated
using (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "associate_memberships_write_admin_only"
on aajf.associate_memberships
for all
to authenticated
using (app_private.is_active_admin(auth.uid()))
with check (app_private.is_active_admin(auth.uid()));

create policy "supporter_profiles_select_own_or_admin"
on aajf.supporter_profiles
for select
to authenticated
using (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "supporter_profiles_insert_own"
on aajf.supporter_profiles
for insert
to authenticated
with check (profile_id = auth.uid());

create policy "supporter_profiles_update_own_or_admin"
on aajf.supporter_profiles
for update
to authenticated
using (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
)
with check (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);
