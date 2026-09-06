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

revoke update on triage_submissions from authenticated;
grant update (status, resolved_at) on triage_submissions to authenticated;
drop policy if exists "authenticated can update submissions" on triage_submissions;
create policy "authenticated can update submissions"
  on triage_submissions for update
  to authenticated
  using (true)
  with check (status in ('pending', 'in_progress', 'resolved'));

drop policy if exists "authenticated can delete submissions" on triage_submissions;
create policy "authenticated can delete submissions"
  on triage_submissions for delete
  to authenticated
  using (status = 'resolved');

create or replace function public.severity_rank(sev text)
returns int language sql immutable parallel safe as $$
  select case sev when 'red' then 3 when 'yellow' then 2 when 'green' then 1 else 0 end
$$;

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

alter table triage_submissions
  add column if not exists client_submission_id uuid not null default gen_random_uuid();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_client_submission_id_key') then
    alter table triage_submissions
      add constraint triage_submissions_client_submission_id_key unique (client_submission_id);
  end if;
end $$;

grant insert (client_submission_id) on triage_submissions to anon, authenticated;
