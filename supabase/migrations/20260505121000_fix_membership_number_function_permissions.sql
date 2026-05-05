create or replace function app_private.next_associate_membership_number()
returns text
language plpgsql
security definer
set search_path = ''
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
security definer
set search_path = ''
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
security definer
set search_path = ''
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
security definer
set search_path = ''
as $$
begin
  if new.membership_number is null or btrim(new.membership_number) = '' then
    new.membership_number := app_private.next_associate_dependent_membership_number();
  end if;

  return new;
end;
$$;

revoke all on function aajf.assign_associate_membership_number()
  from public, anon, authenticated;

revoke all on function aajf.assign_associate_dependent_membership_number()
  from public, anon, authenticated;
