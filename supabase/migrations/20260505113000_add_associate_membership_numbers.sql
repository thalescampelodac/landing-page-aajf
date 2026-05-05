alter table aajf.associate_profiles
  add column if not exists membership_number text;

alter table aajf.associate_dependents
  add column if not exists membership_number text;

create sequence if not exists aajf.associate_membership_number_seq
  start with 1
  increment by 1
  minvalue 1;

create sequence if not exists aajf.associate_dependent_membership_number_seq
  start with 1
  increment by 1
  minvalue 1;

create or replace function app_private.next_associate_membership_number()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('aajf.associate_membership_number_seq');
  return lpad(next_number::text, 6, '0');
end;
$$;

create or replace function app_private.next_associate_dependent_membership_number()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('aajf.associate_dependent_membership_number_seq');
  return 'D' || lpad(next_number::text, 6, '0');
end;
$$;

revoke all on function app_private.next_associate_membership_number()
  from public, anon, authenticated;

revoke all on function app_private.next_associate_dependent_membership_number()
  from public, anon, authenticated;

create or replace function aajf.assign_associate_membership_number()
returns trigger
language plpgsql
as $$
begin
  if new.membership_number is null or btrim(new.membership_number) = '' then
    new.membership_number := app_private.next_associate_membership_number();
  end if;

  return new;
end;
$$;

create or replace function aajf.assign_associate_dependent_membership_number()
returns trigger
language plpgsql
as $$
begin
  if new.membership_number is null or btrim(new.membership_number) = '' then
    new.membership_number := app_private.next_associate_dependent_membership_number();
  end if;

  return new;
end;
$$;

drop trigger if exists set_associate_membership_number
  on aajf.associate_profiles;

create trigger set_associate_membership_number
before insert on aajf.associate_profiles
for each row execute function aajf.assign_associate_membership_number();

drop trigger if exists set_associate_dependent_membership_number
  on aajf.associate_dependents;

create trigger set_associate_dependent_membership_number
before insert on aajf.associate_dependents
for each row execute function aajf.assign_associate_dependent_membership_number();

select setval(
  'aajf.associate_membership_number_seq',
  coalesce(
    (
      select max(membership_number::bigint)
      from aajf.associate_profiles
      where membership_number ~ '^\d{6}$'
    ),
    1
  ),
  exists (
    select 1
    from aajf.associate_profiles
    where membership_number ~ '^\d{6}$'
  )
);

with ordered_profiles as (
  select id
  from aajf.associate_profiles
  where membership_number is null or btrim(membership_number) = ''
  order by created_at, id
)
update aajf.associate_profiles as profile
set membership_number = app_private.next_associate_membership_number()
from ordered_profiles
where profile.id = ordered_profiles.id;

select setval(
  'aajf.associate_dependent_membership_number_seq',
  coalesce(
    (
      select max(substring(membership_number from 2)::bigint)
      from aajf.associate_dependents
      where membership_number ~ '^D\d{6}$'
    ),
    1
  ),
  exists (
    select 1
    from aajf.associate_dependents
    where membership_number ~ '^D\d{6}$'
  )
);

with ordered_dependents as (
  select id
  from aajf.associate_dependents
  where membership_number is null or btrim(membership_number) = ''
  order by created_at, id
)
update aajf.associate_dependents as dependent
set membership_number = app_private.next_associate_dependent_membership_number()
from ordered_dependents
where dependent.id = ordered_dependents.id;

alter table aajf.associate_profiles
  alter column membership_number set not null;

alter table aajf.associate_dependents
  alter column membership_number set not null;

create unique index if not exists associate_profiles_membership_number_key
  on aajf.associate_profiles (membership_number);

create unique index if not exists associate_dependents_membership_number_key
  on aajf.associate_dependents (membership_number);
