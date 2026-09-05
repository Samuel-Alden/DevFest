create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null,
  event_type text not null check (event_type in ('status_change', 'deleted')),
  from_status text,
  to_status text,
  actor_email text,
  created_at timestamptz not null default now()
);

alter table case_events enable row level security;

drop policy if exists "authenticated can read case events" on case_events;
create policy "authenticated can read case events"
  on case_events for select
  to authenticated
  using (true);

create or replace function log_case_event() returns trigger as $$
begin
  if TG_OP = 'UPDATE' and OLD.status is distinct from NEW.status then
    insert into case_events (submission_id, event_type, from_status, to_status, actor_email)
    values (NEW.id, 'status_change', OLD.status, NEW.status, auth.jwt() ->> 'email');
  elsif TG_OP = 'DELETE' then
    insert into case_events (submission_id, event_type, from_status, actor_email)
    values (OLD.id, 'deleted', OLD.status, auth.jwt() ->> 'email');
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists log_case_event_trigger on triage_submissions;
create trigger log_case_event_trigger
  after update or delete on triage_submissions
  for each row execute function log_case_event();
