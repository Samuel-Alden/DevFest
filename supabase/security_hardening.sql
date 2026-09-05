-- =====================================================================
-- TriagePeace — security hardening
-- =====================================================================
-- Idempotent. Safe to re-run. Apply after schema.sql, clinical_assessment.sql,
-- feature_additions.sql, vital_ranges.sql, case_audit.sql and
-- push_notifications.sql:
--   npx supabase db query --linked --file supabase/security_hardening.sql
--
-- This file only ADDS constraints/policies/triggers that reject invalid or
-- unauthorised data at the database boundary. It does not change any column,
-- drop data, or alter the intended trust model (anonymous field devices may
-- still submit intake; authenticated health workers still run the queue).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Phase 1 — constrain anonymous (and authenticated) intake INSERT
-- ---------------------------------------------------------------------
-- The React form is the only *intended* client, but RLS previously accepted
-- any shape at all from `anon` (`with check (true)`). These rules are the
-- structural/data-integrity floor the database enforces regardless of client.
-- Value ranges for age / vitals / enums already live in vital_ranges.sql and
-- clinical_assessment.sql as CHECK constraints; this phase adds the pieces
-- that were still unconstrained: free-text length, the `symptoms` array
-- shape, geo bounds, device_id length, and (via RLS) that an anonymous
-- submitter cannot pre-set server-owned columns (status / resolved_at /
-- back-dated created_at).

-- Canonical symptom keys — mirrors SYMPTOM_OPTIONS in src/lib/triage.js.
-- Kept as an IMMUTABLE function so it can be referenced from CHECK constraints.
create or replace function public.triage_symptom_keys()
returns text[]
language sql
immutable
parallel safe
as $$
  select array[
    'chestPain','breathingDifficulty','heavyBleeding','unconscious','stroke',
    'seizure','severeAllergicReaction','poisoning','severeBurn','headInjury',
    'highFever','persistentVomiting','severePain','pregnancyComplication','dehydration',
    'moderateBurn','fracture','animalBite','persistentCough','rash'
  ]::text[]
$$;

-- Structural validity of the `symptoms` payload: a JSON array (empty is fine),
-- bounded length, every element a string drawn from the canonical key set.
create or replace function public.is_valid_symptoms(s jsonb)
returns boolean
language sql
immutable
parallel safe
as $$
  select case
    when s is null then false
    when jsonb_typeof(s) <> 'array' then false
    when jsonb_array_length(s) > 30 then false
    else not exists (
      select 1
      from jsonb_array_elements(s) as e
      where jsonb_typeof(e) <> 'string'
         or (e #>> '{}') <> all (public.triage_symptom_keys())
    )
  end;
$$;

-- Universal CHECK constraints (apply to every insert/update, any role).
-- Postgres has no "add constraint if not exists" — guard on pg_constraint,
-- same idempotent pattern as vital_ranges.sql.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_device_id_len') then
    alter table triage_submissions add constraint triage_submissions_device_id_len
      check (char_length(device_id) between 8 and 128);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_symptoms_valid') then
    alter table triage_submissions add constraint triage_submissions_symptoms_valid
      check (public.is_valid_symptoms(symptoms));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_patient_name_len') then
    alter table triage_submissions add constraint triage_submissions_patient_name_len
      check (patient_name is null or char_length(patient_name) <= 120);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_address_len') then
    alter table triage_submissions add constraint triage_submissions_address_len
      check (address is null or char_length(address) <= 300);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_complaint_history_len') then
    alter table triage_submissions add constraint triage_submissions_complaint_history_len
      check (complaint_history is null or char_length(complaint_history) <= 4000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_notes_len') then
    alter table triage_submissions add constraint triage_submissions_notes_len
      check (notes is null or char_length(notes) <= 4000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_bleeding_notes_len') then
    alter table triage_submissions add constraint triage_submissions_bleeding_notes_len
      check (bleeding_trauma_notes is null or char_length(bleeding_trauma_notes) <= 2000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_drug_allergies_len') then
    alter table triage_submissions add constraint triage_submissions_drug_allergies_len
      check (drug_allergies is null or char_length(drug_allergies) <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_comorbidities_len') then
    alter table triage_submissions add constraint triage_submissions_comorbidities_len
      check (comorbidities is null or char_length(comorbidities) <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_current_medications_len') then
    alter table triage_submissions add constraint triage_submissions_current_medications_len
      check (current_medications is null or char_length(current_medications) <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_latitude_range') then
    alter table triage_submissions add constraint triage_submissions_latitude_range
      check (latitude is null or latitude between -90 and 90);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_longitude_range') then
    alter table triage_submissions add constraint triage_submissions_longitude_range
      check (longitude is null or longitude between -180 and 180);
  end if;
end $$;

-- RLS INSERT policies: role-specific structural rules on top of the universal
-- CHECK constraints above. A new submission is always a fresh, unresolved,
-- "pending" case created ~now — an anonymous device cannot insert a row that
-- is already in_progress/resolved, carries a resolved_at, or is back-dated to
-- forge queue ordering. The React client never sends status / resolved_at /
-- created_at, so legitimate offline submissions are unaffected.
drop policy if exists "anon can insert submissions" on triage_submissions;
create policy "anon can insert submissions"
  on triage_submissions for insert
  to anon
  with check (
    status = 'pending'
    and resolved_at is null
    and created_at <= now() + interval '5 minutes'
    and created_at >= now() - interval '1 day'
    and public.is_valid_symptoms(symptoms)
  );

-- Authenticated health workers submitting from a shared clinic device: same
-- "this is a brand-new pending case" rule. (Their read/update/resolve powers
-- are unchanged and handled by the other policies.)
drop policy if exists "authenticated can insert submissions" on triage_submissions;
create policy "authenticated can insert submissions"
  on triage_submissions for insert
  to authenticated
  with check (
    status = 'pending'
    and resolved_at is null
    and created_at <= now() + interval '5 minutes'
    and created_at >= now() - interval '1 day'
    and public.is_valid_symptoms(symptoms)
  );


-- ---------------------------------------------------------------------
-- Phase 2 — least privilege for authenticated health workers
-- ---------------------------------------------------------------------
-- The dashboard only ever does two things to a submission: change its
-- `status` and set/clear `resolved_at` (DashboardPage.updateStatus /
-- reopenCase). Full-row UPDATE let any health-worker account silently
-- rewrite patient data, severity, device_id or timestamps. Narrow the
-- column grant so PATCHes to anything else are refused at the SQL layer;
-- the row-level policy stays permissive (every worker manages every case,
-- there is no ownership model).
revoke update on triage_submissions from authenticated;
grant update (status, resolved_at) on triage_submissions to authenticated;

-- Keep the existing permissive UPDATE policy (rows), but make its intent
-- explicit: only workflow columns move, and only between the known states.
drop policy if exists "authenticated can update submissions" on triage_submissions;
create policy "authenticated can update submissions"
  on triage_submissions for update
  to authenticated
  using (true)
  with check (status in ('pending', 'in_progress', 'resolved'));

-- DELETE stays available (the UI offers it for resolved cases behind a
-- two-step confirm) but is now gated to resolved rows only: an active or
-- pending case must be resolved before it can be destroyed. This separates
-- day-to-day triage from irreversible removal without adding a role system.
drop policy if exists "authenticated can delete submissions" on triage_submissions;
create policy "authenticated can delete submissions"
  on triage_submissions for delete
  to authenticated
  using (status = 'resolved');


-- ---------------------------------------------------------------------
-- Phase 3 — server-side triage severity integrity
-- ---------------------------------------------------------------------
-- Severity is computed on the client (src/lib/triage.js) for instant/offline
-- UX and that stays. But the stored `severity` is otherwise whatever the
-- client sent -- a tampered client could file `chestPain` as `green` and hide
-- an emergency from the sorted queue and from the red-severity push alerts.
--
-- This is NOT a re-implementation of the clinical logic. It ports only the
-- static symptom -> tag table and computeSeverity()'s worst-tag-wins rule to
-- establish a FLOOR: the stored severity may never rank below what the
-- selected symptoms already imply. The client's assessment-based escalation
-- (vitals / GCS / AVPU / ABC / bleeding) only ever pushes severity UP, so a
-- correct client always satisfies this; the check just removes "push it
-- DOWN" as an option. On a violation we clamp up (not reject), so a bad
-- client can't drop a case out of triage and an offline submission never
-- gets stuck in the device queue.

create or replace function public.severity_rank(sev text)
returns int language sql immutable parallel safe as $$
  select case sev when 'red' then 3 when 'yellow' then 2 when 'green' then 1 else 0 end
$$;

-- Worst-tag-wins over the selected symptom keys. Tags mirror the `severity`
-- field of SYMPTOM_OPTIONS in src/lib/triage.js -- keep the two in sync.
-- Unknown keys contribute nothing (is_valid_symptoms already rejects them).
create or replace function public.symptom_severity_floor(s jsonb)
returns text language sql immutable parallel safe as $$
  select coalesce(
    (
      select case
        when bool_or(m.tag = 'red') then 'red'
        when bool_or(m.tag = 'yellow') then 'yellow'
        else 'green'
      end
      from jsonb_array_elements_text(case when jsonb_typeof(s) = 'array' then s else '[]'::jsonb end) as k(key)
      join (values
        ('chestPain','red'), ('breathingDifficulty','red'), ('heavyBleeding','red'),
        ('unconscious','red'), ('stroke','red'), ('seizure','red'),
        ('severeAllergicReaction','red'), ('poisoning','red'), ('severeBurn','red'),
        ('headInjury','red'),
        ('highFever','yellow'), ('persistentVomiting','yellow'), ('severePain','yellow'),
        ('pregnancyComplication','yellow'), ('dehydration','yellow'), ('moderateBurn','yellow'),
        ('fracture','yellow'), ('animalBite','yellow'), ('persistentCough','yellow'),
        ('rash','yellow')
      ) as m(key, tag) on m.key = k.key
    ),
    'green'
  )
$$;

create or replace function public.enforce_triage_severity()
returns trigger language plpgsql as $$
declare
  floor_sev text := public.symptom_severity_floor(NEW.symptoms);
begin
  -- Only normalise a well-formed severity that sits below the symptom floor.
  -- A value outside the ('red','yellow','green') set is a malformed payload,
  -- not the "downgrade an emergency" threat -- leave it for the CHECK
  -- constraint to reject.
  if NEW.severity in ('red', 'yellow', 'green')
     and public.severity_rank(NEW.severity) < public.severity_rank(floor_sev) then
    NEW.severity := floor_sev;
  end if;
  return NEW;
end;
$$;

drop trigger if exists enforce_triage_severity_trigger on triage_submissions;
create trigger enforce_triage_severity_trigger
  before insert on triage_submissions
  for each row execute function public.enforce_triage_severity();


-- ---------------------------------------------------------------------
-- Phase 4 — offline queue idempotency
-- ---------------------------------------------------------------------
-- The offline queue is at-least-once: if a sync stores the row but the
-- response is lost, the next flush re-sends the same payload and creates a
-- duplicate patient record. Give each queued submission a stable client-side
-- id and a UNIQUE constraint; the client treats the resulting unique
-- violation (SQLSTATE 23505) on a re-send as "already stored -> done".
-- Existing rows get a random id from the default; new inserts supply theirs.
alter table triage_submissions
  add column if not exists client_submission_id uuid not null default gen_random_uuid();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_client_submission_id_key') then
    alter table triage_submissions
      add constraint triage_submissions_client_submission_id_key unique (client_submission_id);
  end if;
end $$;

-- New column: make sure the intake roles can write it (UPDATE is deliberately
-- not granted -- an idempotency key is write-once at insert).
grant insert (client_submission_id) on triage_submissions to anon, authenticated;
