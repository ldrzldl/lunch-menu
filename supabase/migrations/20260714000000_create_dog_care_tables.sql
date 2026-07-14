-- Dog care simulation schema
-- Requires Supabase Auth users. Run this migration in the Supabase SQL Editor
-- or through the Supabase CLI.

create extension if not exists pgcrypto;

do $$
begin
  create type public.session_status as enum (
    'active', 'paused', 'completed', 'abandoned'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.care_type as enum (
    'walk', 'feed', 'water', 'waste', 'check'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.request_status as enum (
    'pending', 'deferred', 'completed', 'missed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_state as enum (
    'not-sent', 'sent', 'denied', 'missed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.session_status not null default 'active',
  seed text not null,
  scenario_version text not null,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_end_time_check
    check (ended_at is null or ended_at >= started_at)
);

create index if not exists sessions_user_id_idx
  on public.sessions(user_id);

create index if not exists sessions_user_status_idx
  on public.sessions(user_id, status);

create table if not exists public.care_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  client_request_id text not null,
  request_order integer not null,
  type public.care_type not null,
  due_at timestamptz not null,
  deadline_at timestamptz not null,
  status public.request_status not null default 'pending',
  status_changed_at timestamptz,
  completed_at timestamptz,
  estimated_minutes integer not null,
  notification_state public.notification_state not null default 'not-sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint care_requests_deadline_check
    check (deadline_at > due_at),
  constraint care_requests_estimated_minutes_check
    check (estimated_minutes > 0),
  constraint care_requests_order_check
    check (request_order >= 0),
  constraint care_requests_completed_time_check
    check (status = 'completed' or completed_at is null),
  unique (session_id, client_request_id),
  unique (session_id, request_order)
);

create index if not exists care_requests_session_id_idx
  on public.care_requests(session_id);

create index if not exists care_requests_session_status_idx
  on public.care_requests(session_id, status);

create index if not exists care_requests_deadline_idx
  on public.care_requests(deadline_at);

create table if not exists public.care_records (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.care_requests(id) on delete cascade,
  from_status public.request_status not null,
  to_status public.request_status not null,
  changed_at timestamptz not null default now(),
  elapsed_minutes numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint care_records_elapsed_check
    check (elapsed_minutes >= 0)
);

create index if not exists care_records_request_id_idx
  on public.care_records(request_id);

create index if not exists care_records_changed_at_idx
  on public.care_records(changed_at);

create unique index if not exists care_records_one_completion_idx
  on public.care_records(request_id)
  where to_status = 'completed';

alter table public.sessions enable row level security;
alter table public.care_requests enable row level security;
alter table public.care_records enable row level security;

grant select, insert, update, delete
on public.sessions, public.care_requests, public.care_records
to authenticated;

drop policy if exists "users can view own sessions" on public.sessions;
create policy "users can view own sessions"
on public.sessions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can create own sessions" on public.sessions;
create policy "users can create own sessions"
on public.sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own sessions" on public.sessions;
create policy "users can update own sessions"
on public.sessions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own sessions" on public.sessions;
create policy "users can delete own sessions"
on public.sessions for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can view own care requests" on public.care_requests;
create policy "users can view own care requests"
on public.care_requests for select to authenticated
using (
  exists (
    select 1 from public.sessions s
    where s.id = care_requests.session_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "users can create own care requests" on public.care_requests;
create policy "users can create own care requests"
on public.care_requests for insert to authenticated
with check (
  exists (
    select 1 from public.sessions s
    where s.id = care_requests.session_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "users can update own care requests" on public.care_requests;
create policy "users can update own care requests"
on public.care_requests for update to authenticated
using (
  exists (
    select 1 from public.sessions s
    where s.id = care_requests.session_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.sessions s
    where s.id = care_requests.session_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "users can view own care records" on public.care_records;
create policy "users can view own care records"
on public.care_records for select to authenticated
using (
  exists (
    select 1
    from public.care_requests r
    join public.sessions s on s.id = r.session_id
    where r.id = care_records.request_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "users can create own care records" on public.care_records;
create policy "users can create own care records"
on public.care_records for insert to authenticated
with check (
  exists (
    select 1
    from public.care_requests r
    join public.sessions s on s.id = r.session_id
    where r.id = care_records.request_id
      and s.user_id = (select auth.uid())
  )
);
