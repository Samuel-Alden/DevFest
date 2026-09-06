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

drop policy if exists "anon can insert submissions" on triage_submissions;
create policy "anon can insert submissions"
  on triage_submissions for insert
  to anon
  with check (true);

drop policy if exists "authenticated can insert submissions" on triage_submissions;
create policy "authenticated can insert submissions"
  on triage_submissions for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can read submissions" on triage_submissions;
create policy "authenticated can read submissions"
  on triage_submissions for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update submissions" on triage_submissions;
create policy "authenticated can update submissions"
  on triage_submissions for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete submissions" on triage_submissions;
create policy "authenticated can delete submissions"
  on triage_submissions for delete
  to authenticated
  using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'triage_submissions'
  ) then
    alter publication supabase_realtime add table triage_submissions;
  end if;
end $$;
