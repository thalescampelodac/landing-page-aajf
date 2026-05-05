create policy "publications_select_admin"
on aajf.publications
for select
to authenticated
using (app_private.is_active_admin(auth.uid()));
