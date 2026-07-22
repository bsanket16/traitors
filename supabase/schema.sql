-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.app_analytics (
  id integer primary key default 1 check (id = 1),
  villages_created integer not null default 0,
  games_played integer not null default 0,
  completed_games integer not null default 0,
  abandoned_games integer not null default 0,
  total_players_at_start integer not null default 0,
  traitor_wins integer not null default 0,
  citizen_wins integer not null default 0,
  feedback_received integer not null default 0,
  last_updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 80),
  contact text not null default '' check (char_length(contact) <= 160),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.app_analytics enable row level security;
alter table public.feedback enable row level security;

revoke all on table public.app_analytics from anon, authenticated;
revoke all on table public.feedback from anon, authenticated;
grant select, insert, update, delete on table public.app_analytics to service_role;
grant select, insert, update, delete on table public.feedback to service_role;
grant usage, select on sequence public.feedback_id_seq to service_role;

create or replace function public.record_app_activity(
  p_villages_created integer default 0,
  p_games_played integer default 0,
  p_completed_games integer default 0,
  p_abandoned_games integer default 0,
  p_total_players_at_start integer default 0,
  p_traitor_wins integer default 0,
  p_citizen_wins integer default 0,
  p_feedback_received integer default 0
)
returns void
language plpgsql
as $$
begin
  insert into public.app_analytics (
    id, villages_created, games_played, completed_games, abandoned_games,
    total_players_at_start, traitor_wins, citizen_wins, feedback_received, last_updated_at
  ) values (
    1, p_villages_created, p_games_played, p_completed_games, p_abandoned_games,
    p_total_players_at_start, p_traitor_wins, p_citizen_wins, p_feedback_received, now()
  ) on conflict (id) do update set
    villages_created = public.app_analytics.villages_created + excluded.villages_created,
    games_played = public.app_analytics.games_played + excluded.games_played,
    completed_games = public.app_analytics.completed_games + excluded.completed_games,
    abandoned_games = public.app_analytics.abandoned_games + excluded.abandoned_games,
    total_players_at_start = public.app_analytics.total_players_at_start + excluded.total_players_at_start,
    traitor_wins = public.app_analytics.traitor_wins + excluded.traitor_wins,
    citizen_wins = public.app_analytics.citizen_wins + excluded.citizen_wins,
    feedback_received = public.app_analytics.feedback_received + excluded.feedback_received,
    last_updated_at = now();
end;
$$;

revoke all on function public.record_app_activity(integer, integer, integer, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.record_app_activity(integer, integer, integer, integer, integer, integer, integer, integer) to service_role;
