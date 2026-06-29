-- Run this entire file in your Supabase SQL Editor

-- 1. Game rooms (one per active game)
create table if not exists public.game_rooms (
  id               uuid default gen_random_uuid() primary key,
  room_code        text unique not null,
  host_id          uuid references auth.users(id),
  status           text default 'lobby',           -- lobby | question | reveal | game_over
  current_question jsonb,                          -- question data (no correct during question phase)
  question_idx     int default -1,
  settings         jsonb default '{}',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 2. Players who join via phone/QR
create table if not exists public.room_players (
  id           uuid default gen_random_uuid() primary key,
  room_id      uuid references public.game_rooms(id) on delete cascade,
  name         text not null,
  avatar       text default '⭐',
  score        int default 0,
  streak       int default 0,
  team         text,
  is_connected boolean default true,
  joined_at    timestamptz default now()
);

-- 3. Answers submitted by players
create table if not exists public.player_answers (
  id           uuid default gen_random_uuid() primary key,
  room_id      uuid references public.game_rooms(id) on delete cascade,
  player_id    uuid references public.room_players(id) on delete cascade,
  question_idx int not null,
  answer       text,
  answered_at  timestamptz default now()
);

-- RLS policies (open for now — lock down per player_id in production)
alter table public.game_rooms    enable row level security;
alter table public.room_players  enable row level security;
alter table public.player_answers enable row level security;

create policy "read rooms"    on public.game_rooms    for select using (true);
create policy "insert rooms"  on public.game_rooms    for insert with check (true);
create policy "update rooms"  on public.game_rooms    for update using (true);

create policy "read players"   on public.room_players  for select using (true);
create policy "insert players" on public.room_players  for insert with check (true);
create policy "update players" on public.room_players  for update using (true);

create policy "read answers"   on public.player_answers for select using (true);
create policy "insert answers" on public.player_answers for insert with check (true);

-- Enable Realtime on all three tables
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.player_answers;
