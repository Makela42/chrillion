-- Chrillion: run this once in Supabase → SQL Editor → New query → Run.
-- It stores one score per player per daily dive so the results screen can show
-- "better than X% of today's players". Players can add scores but can't read or edit rows.

create table if not exists public.daily_scores (
  id         bigint generated always as identity primary key,
  day        int  not null check (day between 1 and 100000),
  score      int  not null check (score between 0 and 700),
  player     text not null check (char_length(player) between 6 and 40),
  created_at timestamptz not null default now(),
  unique (day, player)
);

alter table public.daily_scores enable row level security;

drop policy if exists "players can submit scores" on public.daily_scores;
create policy "players can submit scores"
  on public.daily_scores for insert
  to anon
  with check (true);

-- Returns how many players scored in each 25-point bucket for a day (no personal data).
create or replace function public.daily_histogram(p_day int)
returns table (bucket int, n bigint)
language sql
security definer
set search_path = public
as $$
  select least(score / 25, 27) as bucket, count(*) as n
  from public.daily_scores
  where day = p_day
  group by 1
  order by 1;
$$;

grant execute on function public.daily_histogram(int) to anon;

-- Feedback from the in-game form. Players can send it but can't read anyone's feedback.
-- Read it in Supabase → Table Editor → feedback.
create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  message    text not null check (char_length(message) between 3 and 2000),
  email      text check (email is null or char_length(email) <= 200),
  context    text check (context is null or char_length(context) <= 500),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "players can send feedback" on public.feedback;
create policy "players can send feedback"
  on public.feedback for insert
  to anon
  with check (true);
