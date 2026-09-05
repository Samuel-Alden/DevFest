-- Physiologically-possible bounds (safety-margin, not clinical-danger
-- thresholds -- see VITAL_RANGES in src/lib/triage.js) for the numeric
-- vitals that clinical_assessment.sql left unconstrained, plus age. Guarded
-- with a pg_constraint existence check (Postgres has no "add constraint if
-- not exists"), same idempotent pattern as the realtime publication guard
-- in schema.sql, so this file is safe to re-run.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_age_check') then
    alter table triage_submissions add constraint triage_submissions_age_check check (age between 0 and 120);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_systolic_bp_check') then
    alter table triage_submissions add constraint triage_submissions_systolic_bp_check check (systolic_bp between 40 and 300);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_diastolic_bp_check') then
    alter table triage_submissions add constraint triage_submissions_diastolic_bp_check check (diastolic_bp between 20 and 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_pulse_rate_check') then
    alter table triage_submissions add constraint triage_submissions_pulse_rate_check check (pulse_rate between 20 and 300);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_respiratory_rate_check') then
    alter table triage_submissions add constraint triage_submissions_respiratory_rate_check check (respiratory_rate between 4 and 60);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_body_temperature_check') then
    alter table triage_submissions add constraint triage_submissions_body_temperature_check check (body_temperature between 25 and 45);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'triage_submissions_oxygen_saturation_check') then
    alter table triage_submissions add constraint triage_submissions_oxygen_saturation_check check (oxygen_saturation between 0 and 100);
  end if;
end $$;
