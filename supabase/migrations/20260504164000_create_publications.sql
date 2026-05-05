create table if not exists aajf.publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body text not null,
  cover_image_url text,
  status text not null default 'draft',
  featured boolean not null default false,
  category text,
  published_at timestamptz,
  author_name text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publications_status_check
    check (status in ('draft', 'published', 'archived'))
);

create index if not exists publications_status_idx
  on aajf.publications (status);

create index if not exists publications_published_at_idx
  on aajf.publications (published_at desc);

create index if not exists publications_featured_idx
  on aajf.publications (featured desc, published_at desc);

drop trigger if exists set_publications_updated_at on aajf.publications;
create trigger set_publications_updated_at
before update on aajf.publications
for each row execute function aajf.set_updated_at();

alter table aajf.publications enable row level security;

create policy "publications_select_published_public"
on aajf.publications
for select
to anon, authenticated
using (status = 'published');

create policy "publications_insert_admin"
on aajf.publications
for insert
to authenticated
with check (app_private.is_active_admin(auth.uid()));

create policy "publications_update_admin"
on aajf.publications
for update
to authenticated
using (app_private.is_active_admin(auth.uid()))
with check (app_private.is_active_admin(auth.uid()));

create policy "publications_delete_admin"
on aajf.publications
for delete
to authenticated
using (app_private.is_active_admin(auth.uid()));

grant select
  on table aajf.publications
  to anon, authenticated;

grant insert, update, delete
  on table aajf.publications
  to authenticated;
