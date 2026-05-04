-- Grant SQL privileges required for associate membership flows.
-- RLS policies already protect row access, but authenticated users still need
-- table-level privileges before policies can be evaluated.

grant select, insert, update
  on table aajf.profiles
  to authenticated;

grant select, insert, update, delete
  on table aajf.associate_memberships
  to authenticated;
