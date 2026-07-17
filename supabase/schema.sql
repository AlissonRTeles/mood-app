-- ============================================================
--  MindMood · Schema Supabase
--  Rode este SQL no painel: Supabase -> SQL Editor -> New query
-- ============================================================

-- Tabela de perfis (opcional, espelha auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Tabela de registros de emoção / humor
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emotion text not null,          -- happy | calm | angry | excited | anxious | tired
  emoji text,
  note text,                      -- reflexão diária (opcional)
  created_at timestamptz default now()
);

create index if not exists moods_user_created_idx
  on public.moods (user_id, created_at desc);

-- ------------------------------------------------------------
--  Row Level Security: cada usuário só acessa os próprios dados
-- ------------------------------------------------------------
alter table public.moods    enable row level security;
alter table public.profiles enable row level security;

-- moods
drop policy if exists "moods_select_own" on public.moods;
create policy "moods_select_own" on public.moods
  for select using (auth.uid() = user_id);

drop policy if exists "moods_insert_own" on public.moods;
create policy "moods_insert_own" on public.moods
  for insert with check (auth.uid() = user_id);

drop policy if exists "moods_delete_own" on public.moods;
create policy "moods_delete_own" on public.moods
  for delete using (auth.uid() = user_id);

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ------------------------------------------------------------
--  Trigger: cria um profile automaticamente ao cadastrar
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
