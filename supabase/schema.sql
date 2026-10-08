-- Supabase: SQL Editor > New query > cole tudo > Run. Pode rodar mais de uma vez.
create table if not exists public.forms (
  id text primary key,
  title text not null,
  open boolean not null default true,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create table if not exists public.responses (
  id bigint generated always as identity primary key,
  form_id text not null references public.forms(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);
-- limpa versões antigas
drop policy if exists "forms_insert_dono" on public.forms;
drop policy if exists "forms_update_dono" on public.forms;
drop policy if exists "forms_delete_dono" on public.forms;
drop policy if exists "resp_leitura_dono" on public.responses;
alter table public.forms drop column if exists owner;

-- token de administrador (guardado numa tabela que a API não consegue ler)
create table if not exists public.admin_secret (token text not null);
alter table public.admin_secret enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.admin_secret s
    where s.token = (current_setting('request.headers', true)::json ->> 'x-admin-token'))
$$;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.forms enable row level security;
alter table public.responses enable row level security;

drop policy if exists "forms_leitura_publica" on public.forms;
create policy "forms_leitura_publica" on public.forms for select to anon, authenticated using (true);
drop policy if exists "forms_admin" on public.forms;
create policy "forms_admin" on public.forms for all to anon, authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "resp_insert_aberto" on public.responses;
create policy "resp_insert_aberto" on public.responses for insert to anon, authenticated
  with check (exists (select 1 from public.forms f where f.id = form_id and f.open));
drop policy if exists "resp_admin" on public.responses;
create policy "resp_admin" on public.responses for all to anon, authenticated using (public.is_admin()) with check (public.is_admin());
