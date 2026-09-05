-- Push notification support: subscriptions table + trigger to alert on new cases.
-- Run this after schema.sql, and after the send-triage-alert Edge Function is deployed
-- (supabase functions deploy send-triage-alert --no-verify-jwt) since the trigger calls
-- it by URL. The Authorization header below uses the publishable anon key, which is
-- already public (it ships in the client bundle) -- RLS is what actually protects
-- data, not this key's secrecy. If you rotate project keys, update the URL/key here.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  -- Which severities this device wants alerts for. Filtered in the Edge Function,
  -- not the trigger, so one insert can fan out differently per subscriber.
  notify_severities text[] not null default array['red'],
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the column if this table already existed from an earlier version.
alter table push_subscriptions add column if not exists notify_severities text[] not null default array['red'];

alter table push_subscriptions enable row level security;

drop policy if exists "users manage their own push subscription" on push_subscriptions;
create policy "users manage their own push subscription"
  on push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The edge function reads all subscriptions with the service role key, bypassing RLS.

create extension if not exists pg_net with schema extensions;

create or replace function notify_triage_submission()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://jnooylfjxefbyozvlaqa.supabase.co/functions/v1/send-triage-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_9QqlcRpdud3NcZx0eRFHLw_2xyyS-NY'
    ),
    body := jsonb_build_object('type', 'INSERT', 'table', 'triage_submissions', 'record', to_jsonb(new))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_red_submission on triage_submissions;
drop function if exists notify_red_submission();

drop trigger if exists on_triage_submission on triage_submissions;
create trigger on_triage_submission
  after insert on triage_submissions
  for each row
  execute function notify_triage_submission();
