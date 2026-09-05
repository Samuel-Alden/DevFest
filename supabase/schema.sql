-- TriageLink schema
create table if not exists triage_submissions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  patient_name text,
  age int,
  symptoms jsonb not null,
  notes text,
  severity text not null check (severity in ('red', 'yellow', 'green')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

alter table triage_submissions enable row level security;

-- Anonymous field devices can submit new intake forms, nothing else.
create policy "anon can insert submissions"
  on triage_submissions for insert
  to anon
  with check (true);

-- Only authenticated health workers can read or triage the queue.
create policy "authenticated can read submissions"
  on triage_submissions for select
  to authenticated
  using (true);

create policy "authenticated can update submissions"
  on triage_submissions for update
  to authenticated
  using (true)
  with check (true);

-- Enable Realtime for the dashboard's live queue.
alter publication supabase_realtime add table triage_submissions;
