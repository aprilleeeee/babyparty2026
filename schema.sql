-- Run this entire script in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.pool_settings (
  id integer primary key check (id = 1),
  voting_open boolean not null default true,
  revealed boolean not null default false,
  actual_gender text check (actual_gender in ('Boy','Girl') or actual_gender is null)
);
insert into public.pool_settings(id) values (1) on conflict (id) do nothing;

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  vote_code text unique not null,
  voter_name text not null check (char_length(voter_name) between 1 and 80),
  gender_vote text not null check (gender_vote in ('Boy','Girl')),
  amount integer not null default 10 check (amount = 10),
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;
alter table public.pool_settings enable row level security;

create or replace function public.submit_vote(p_name text, p_gender text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
begin
  if not exists (select 1 from pool_settings where id=1 and voting_open) then
    raise exception 'Voting is closed';
  end if;
  if p_gender not in ('Boy','Girl') then raise exception 'Invalid vote'; end if;
  loop
    code := 'VOTE-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,6));
    exit when not exists(select 1 from votes where vote_code=code);
  end loop;
  insert into votes(vote_code,voter_name,gender_vote) values(code,trim(p_name),p_gender);
  return code;
end $$;

-- Public users can see the leaderboard and settings, but cannot insert/update/delete directly.
create policy "public read votes" on public.votes for select to anon, authenticated using (true);
create policy "public read settings" on public.pool_settings for select to anon, authenticated using (true);

-- Admin writes are controlled by authenticated users. For a single-family private event,
-- create only your organiser account in Supabase Auth.
create policy "authenticated update votes" on public.votes for update to authenticated using (true) with check (true);
create policy "authenticated delete votes" on public.votes for delete to authenticated using (true);
create policy "authenticated update settings" on public.pool_settings for update to authenticated using (true) with check (true);

grant select on public.votes, public.pool_settings to anon, authenticated;
grant execute on function public.submit_vote(text,text) to anon, authenticated;
grant update,delete on public.votes to authenticated;
grant update on public.pool_settings to authenticated;
