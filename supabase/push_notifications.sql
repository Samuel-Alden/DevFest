create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  notify_severities text[] not null default array['red'],
  created_at timestamptz not null default now()
);

alter table push_subscriptions add column if not exists notify_severities text[] not null default array['red'];

alter table push_subscriptions enable row level security;

drop policy if exists "users manage their own push subscription" on push_subscriptions;
create policy "users manage their own push subscription"
  on push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create extension if not exists pg_net with schema extensions;

create or replace function notify_triage_submission()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://jnooylfjxefbyozvlaqa.supabase.co/functions/v1/send-triage-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_9QqlcRpdud3NcZx0eRFHLw_2xyyS-NY',
      'x-triage-webhook-secret', coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'triage_webhook_secret'),
        ''
      )
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
