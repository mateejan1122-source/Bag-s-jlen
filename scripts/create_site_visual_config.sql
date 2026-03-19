create table if not exists public.site_visual_config (
  id text primary key,
  config jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_visual_config (id, config)
values ('homepage', '{"content":[],"root":{}}'::jsonb)
on conflict (id) do nothing;

alter table public.site_visual_config enable row level security;

drop policy if exists "site_visual_config_public_select" on public.site_visual_config;
create policy "site_visual_config_public_select"
on public.site_visual_config
for select
to anon, authenticated
using (true);

drop policy if exists "site_visual_config_authenticated_insert" on public.site_visual_config;
create policy "site_visual_config_authenticated_insert"
on public.site_visual_config
for insert
to authenticated
with check (true);

drop policy if exists "site_visual_config_authenticated_update" on public.site_visual_config;
create policy "site_visual_config_authenticated_update"
on public.site_visual_config
for update
to authenticated
using (true)
with check (true);
