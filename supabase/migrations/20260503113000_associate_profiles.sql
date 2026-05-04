-- Associate profile data for AAJF.
-- Keeps associate-facing profile details separate from generic auth profiles
-- and from administrative memberships.

create table if not exists aajf.associate_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references aajf.profiles (id) on delete cascade,
  photo_url text,
  full_name text,
  category text,
  cpf text,
  rg text,
  phone text,
  birth_date date,
  nationality text,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  observation text,
  term_accepted boolean not null default false,
  term_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint associate_profiles_profile_unique unique (profile_id),
  constraint associate_profiles_category_check
    check (category is null or category in ('Kleine Kinder', 'Gosse Kinder', 'Heimweh'))
);

create table if not exists aajf.associate_dependents (
  id uuid primary key default gen_random_uuid(),
  associate_profile_id uuid not null references aajf.associate_profiles (id) on delete cascade,
  full_name text not null,
  category text,
  cpf text,
  rg text,
  birth_date date,
  nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint associate_dependents_category_check
    check (category is null or category in ('Kleine Kinder', 'Gosse Kinder', 'Heimweh'))
);

create index if not exists associate_profiles_profile_idx
  on aajf.associate_profiles (profile_id);

create index if not exists associate_dependents_profile_idx
  on aajf.associate_dependents (associate_profile_id);

drop trigger if exists set_associate_profiles_updated_at on aajf.associate_profiles;
create trigger set_associate_profiles_updated_at
before update on aajf.associate_profiles
for each row execute function aajf.set_updated_at();

drop trigger if exists set_associate_dependents_updated_at on aajf.associate_dependents;
create trigger set_associate_dependents_updated_at
before update on aajf.associate_dependents
for each row execute function aajf.set_updated_at();

alter table aajf.associate_profiles enable row level security;
alter table aajf.associate_dependents enable row level security;

create policy "associate_profiles_select_own_or_admin"
on aajf.associate_profiles
for select
to authenticated
using (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "associate_profiles_insert_own_or_admin"
on aajf.associate_profiles
for insert
to authenticated
with check (
  profile_id = auth.uid()
  or app_private.is_active_admin(auth.uid())
);

create policy "associate_profiles_update_own_or_admin"
on aajf.associate_profiles
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

create policy "associate_dependents_select_own_or_admin"
on aajf.associate_dependents
for select
to authenticated
using (
  exists (
    select 1
    from aajf.associate_profiles
    where associate_profiles.id = associate_dependents.associate_profile_id
      and (
        associate_profiles.profile_id = auth.uid()
        or app_private.is_active_admin(auth.uid())
      )
  )
);

create policy "associate_dependents_insert_own_or_admin"
on aajf.associate_dependents
for insert
to authenticated
with check (
  exists (
    select 1
    from aajf.associate_profiles
    where associate_profiles.id = associate_dependents.associate_profile_id
      and (
        associate_profiles.profile_id = auth.uid()
        or app_private.is_active_admin(auth.uid())
      )
  )
);

create policy "associate_dependents_update_own_or_admin"
on aajf.associate_dependents
for update
to authenticated
using (
  exists (
    select 1
    from aajf.associate_profiles
    where associate_profiles.id = associate_dependents.associate_profile_id
      and (
        associate_profiles.profile_id = auth.uid()
        or app_private.is_active_admin(auth.uid())
      )
  )
)
with check (
  exists (
    select 1
    from aajf.associate_profiles
    where associate_profiles.id = associate_dependents.associate_profile_id
      and (
        associate_profiles.profile_id = auth.uid()
        or app_private.is_active_admin(auth.uid())
      )
  )
);

create policy "associate_dependents_delete_own_or_admin"
on aajf.associate_dependents
for delete
to authenticated
using (
  exists (
    select 1
    from aajf.associate_profiles
    where associate_profiles.id = associate_dependents.associate_profile_id
      and (
        associate_profiles.profile_id = auth.uid()
        or app_private.is_active_admin(auth.uid())
      )
  )
);

grant select, insert, update
  on table aajf.associate_profiles
  to authenticated;

grant select, insert, update, delete
  on table aajf.associate_dependents
  to authenticated;
