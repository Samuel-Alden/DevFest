-- Full clinical intake fields: address, complaint history, vitals, a
-- GCS-or-AVPU consciousness check, an airway/breathing/circulation primary
-- survey, bleeding/trauma, and background history. Safe to re-run.
alter table triage_submissions add column if not exists address text;
alter table triage_submissions add column if not exists complaint_history text;

alter table triage_submissions add column if not exists systolic_bp int;
alter table triage_submissions add column if not exists diastolic_bp int;
alter table triage_submissions add column if not exists pulse_rate int;
alter table triage_submissions add column if not exists respiratory_rate int;
alter table triage_submissions add column if not exists body_temperature numeric(4,1);
alter table triage_submissions add column if not exists oxygen_saturation int;

alter table triage_submissions add column if not exists consciousness_scale text
  check (consciousness_scale in ('gcs', 'avpu'));
alter table triage_submissions add column if not exists gcs_score int
  check (gcs_score between 3 and 15);
alter table triage_submissions add column if not exists avpu_level text
  check (avpu_level in ('alert', 'voice', 'pain', 'unresponsive'));

alter table triage_submissions add column if not exists airway_status text
  check (airway_status in ('normal', 'compromised'));
alter table triage_submissions add column if not exists breathing_status text
  check (breathing_status in ('normal', 'compromised'));
alter table triage_submissions add column if not exists circulation_status text
  check (circulation_status in ('normal', 'compromised'));
alter table triage_submissions add column if not exists bleeding_trauma boolean not null default false;
alter table triage_submissions add column if not exists bleeding_trauma_notes text;

alter table triage_submissions add column if not exists drug_allergies text;
alter table triage_submissions add column if not exists comorbidities text;
alter table triage_submissions add column if not exists current_medications text;
