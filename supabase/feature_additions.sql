alter table triage_submissions add column if not exists resolved_at timestamptz;
alter table triage_submissions add column if not exists latitude double precision;
alter table triage_submissions add column if not exists longitude double precision;
