-- Grant table privileges required for RLS-protected access from the app.
-- Policies were already in place, but authenticated users still need SQL-level
-- privileges on the tables before RLS can evaluate access.

grant select, insert, update, delete
  on table aajf.admin_memberships
  to authenticated;

grant select, insert, update, delete
  on table aajf.admin_bootstrap_grants
  to authenticated;
