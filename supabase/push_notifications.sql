-- Push notification support: subscriptions table + trigger to alert on red cases.
-- Run this after schema.sql, and after the send-red-alert Edge Function is deployed
-- (supabase functions deploy send-red-alert) since the trigger calls it by URL.
-- The Authorization header below uses the publishable anon key, which is already
-- public (it ships in the client bundle) -- RLS is what actually protects data, not
-- this key's secrecy. If you rotate project keys, update the URL/key here to match.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "users manage their own push subscription"
  on push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The edge function reads all subscriptions with the service role key, bypassing RLS.

create extension if not exists pg_net with schema extensions;

create or replace function notify_red_submission()
returns trigger as $$
begin
  if new.severity = 'red' then
    perform net.http_post(
      url := 'https://jnooylfjxefbyozvlaqa.supabase.co/functions/v1/send-red-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer sb_publishable_9QqlcRpdud3NcZx0eRFHLw_2xyyS-NY'
      ),
      body := jsonb_build_object('type', 'INSERT', 'table', 'triage_submissions', 'record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_red_submission
  after insert on triage_submissions
  for each row
  execute function notify_red_submission();
