import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SYMPTOM_OPTIONS,
  computeSeverity,
  assessmentEscalatesSeverity,
  SEVERITY_META,
  VITAL_RANGES,
} from "../lib/triage";
import { submitIntake } from "../lib/queue";
import { getDeviceId } from "../lib/deviceId";
import { getCurrentPosition } from "../lib/geolocation";
import { useTranslation, pick } from "../lib/i18n";
import { SettingsComponent } from "../components/SettingsComponent";

const emptyForm = {
  patientName: "",
  age: "",
  address: "",
  complaintHistory: "",
  symptoms: [],
  notes: "",
  systolicBp: "",
  diastolicBp: "",
  pulseRate: "",
  respiratoryRate: "",
  bodyTemperature: "",
  oxygenSaturation: "",
  consciousnessScale: "",
  gcsScore: "",
  avpuLevel: "",
  airwayStatus: "",
  breathingStatus: "",
  circulationStatus: "",
  bleedingTrauma: false,
  bleedingTraumaNotes: "",
  drugAllergies: "",
  comorbidities: "",
  currentMedications: "",
};

const SYMPTOM_GROUPS = [
  {
    severity: "red",
    headingKey: "group_emergency",
    options: SYMPTOM_OPTIONS.filter((o) => o.severity === "red"),
  },
  {
    severity: "yellow",
    headingKey: "group_other",
    options: SYMPTOM_OPTIONS.filter((o) => o.severity === "yellow"),
  },
];

const inputClasses =
  "mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft";

const cardClasses = "rounded-xl border border-line p-4 space-y-4";

const LOCATION_STATUS_KEY = {
  ok: "location_captured",
  denied: "location_denied",
  timeout: "location_timeout",
  unavailable: "location_unavailable",
  unsupported: "location_unavailable",
};

function Card({ title, children }) {
  return (
    <section className={cardClasses}>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  max,
  error,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className={`${inputClasses} ${error ? "!border-tag-red focus:!ring-tag-red-soft" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-tag-red">{error}</p>}
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 2 }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={inputClasses}
      />
    </label>
  );
}

function SegmentedToggle({ label, value, onChange, options }) {
  return (
    <div>
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
      <div
        className={`flex gap-1 bg-paper-dim rounded-lg p-1 ${label ? "mt-1" : ""}`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
              value === opt.value
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PatientInfoSection({ form, setField, t, fieldErrors }) {
  return (
    <Card title={t("section_patient_info")}>
      <TextField
        label={t("patient_name")}
        value={form.patientName}
        onChange={setField("patientName")}
        placeholder={t("optional")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("age")}
          type="number"
          min={VITAL_RANGES.age.min}
          max={VITAL_RANGES.age.max}
          value={form.age}
          onChange={setField("age")}
          error={fieldErrors.age}
        />
        <TextField
          label={t("address")}
          value={form.address}
          onChange={setField("address")}
          placeholder={t("optional")}
        />
      </div>
    </Card>
  );
}

function ComplaintHistorySection({ form, setField, t }) {
  return (
    <Card title={t("section_complaint_history")}>
      <TextAreaField
        label={t("complaint_history_label")}
        value={form.complaintHistory}
        onChange={setField("complaintHistory")}
        placeholder={t("complaint_history_placeholder")}
        rows={3}
      />
    </Card>
  );
}

function SymptomsSection({ form, toggleSymptom, t, lang }) {
  return (
    <Card title={t("symptoms_label")}>
      <div className="space-y-4">
        {SYMPTOM_GROUPS.map((group) => (
          <div
            key={group.severity}
            className={`rounded-lg border-l-4 pl-3 ${SEVERITY_META[group.severity].border}`}
          >
            <p className="text-xs font-semibold text-ink-soft mb-2">
              {t(group.headingKey)}
            </p>
            <div className="space-y-2">
              {group.options.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 cursor-pointer hover:bg-paper-dim"
                >
                  <input
                    type="checkbox"
                    checked={form.symptoms.includes(opt.key)}
                    onChange={() => toggleSymptom(opt.key)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="flex-1 text-sm text-ink">
                    {pick(opt.label, opt.labelId, lang)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotesSection({ form, setField, t }) {
  return (
    <Card title={t("notes")}>
      <TextAreaField
        value={form.notes}
        onChange={setField("notes")}
        placeholder={t("notes_placeholder")}
        rows={3}
        label=""
      />
    </Card>
  );
}

function VitalsSection({ form, setField, t, fieldErrors }) {
  return (
    <Card title={t("section_vitals")}>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("systolic_bp")}
          type="number"
          min={VITAL_RANGES.systolicBp.min}
          max={VITAL_RANGES.systolicBp.max}
          value={form.systolicBp}
          onChange={setField("systolicBp")}
          error={fieldErrors.systolicBp}
        />
        <TextField
          label={t("diastolic_bp")}
          type="number"
          min={VITAL_RANGES.diastolicBp.min}
          max={VITAL_RANGES.diastolicBp.max}
          value={form.diastolicBp}
          onChange={setField("diastolicBp")}
          error={fieldErrors.diastolicBp}
        />
        <TextField
          label={t("pulse_rate")}
          type="number"
          min={VITAL_RANGES.pulseRate.min}
          max={VITAL_RANGES.pulseRate.max}
          value={form.pulseRate}
          onChange={setField("pulseRate")}
          error={fieldErrors.pulseRate}
        />
        <TextField
          label={t("respiratory_rate")}
          type="number"
          min={VITAL_RANGES.respiratoryRate.min}
          max={VITAL_RANGES.respiratoryRate.max}
          value={form.respiratoryRate}
          onChange={setField("respiratoryRate")}
          error={fieldErrors.respiratoryRate}
        />
        <TextField
          label={t("body_temperature")}
          type="number"
          step="0.1"
          min={VITAL_RANGES.bodyTemperature.min}
          max={VITAL_RANGES.bodyTemperature.max}
          value={form.bodyTemperature}
          onChange={setField("bodyTemperature")}
          error={fieldErrors.bodyTemperature}
        />
        <TextField
          label={t("oxygen_saturation")}
          type="number"
          min={VITAL_RANGES.oxygenSaturation.min}
          max={VITAL_RANGES.oxygenSaturation.max}
          value={form.oxygenSaturation}
          onChange={setField("oxygenSaturation")}
          error={fieldErrors.oxygenSaturation}
        />
      </div>
    </Card>
  );
}

function ConsciousnessSection({ form, setField, t, fieldErrors }) {
  return (
    <Card title={t("section_consciousness")}>
      <SegmentedToggle
        label={t("consciousness_scale_label")}
        value={form.consciousnessScale}
        onChange={setField("consciousnessScale")}
        options={[
          { value: "gcs", label: "GCS" },
          { value: "avpu", label: "AVPU" },
        ]}
      />
      {form.consciousnessScale === "gcs" && (
        <TextField
          label={t("gcs_score_label")}
          type="number"
          min={VITAL_RANGES.gcsScore.min}
          max={VITAL_RANGES.gcsScore.max}
          value={form.gcsScore}
          onChange={setField("gcsScore")}
          error={fieldErrors.gcsScore}
        />
      )}
      {form.consciousnessScale === "avpu" && (
        <SegmentedToggle
          label={t("avpu_label")}
          value={form.avpuLevel}
          onChange={setField("avpuLevel")}
          options={[
            { value: "alert", label: t("avpu_alert") },
            { value: "voice", label: t("avpu_voice") },
            { value: "pain", label: t("avpu_pain") },
            { value: "unresponsive", label: t("avpu_unresponsive") },
          ]}
        />
      )}
    </Card>
  );
}

function PrimarySurveySection({ form, setField, t }) {
  const statusOptions = [
    { value: "normal", label: t("status_normal") },
    { value: "compromised", label: t("status_compromised") },
  ];
  return (
    <Card title={t("section_primary_survey")}>
      <SegmentedToggle
        label={t("airway_label")}
        value={form.airwayStatus}
        onChange={setField("airwayStatus")}
        options={statusOptions}
      />
      <SegmentedToggle
        label={t("breathing_label")}
        value={form.breathingStatus}
        onChange={setField("breathingStatus")}
        options={statusOptions}
      />
      <SegmentedToggle
        label={t("circulation_label")}
        value={form.circulationStatus}
        onChange={setField("circulationStatus")}
        options={statusOptions}
      />
      <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 cursor-pointer hover:bg-paper-dim">
        <input
          type="checkbox"
          checked={form.bleedingTrauma}
          onChange={(e) => setField("bleedingTrauma")(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        <span className="flex-1 text-sm text-ink">
          {t("bleeding_trauma_label")}
        </span>
      </label>
      {form.bleedingTrauma && (
        <TextAreaField
          label=""
          value={form.bleedingTraumaNotes}
          onChange={setField("bleedingTraumaNotes")}
          placeholder={t("bleeding_trauma_notes_placeholder")}
        />
      )}
    </Card>
  );
}

function MedicalHistorySection({ form, setField, t }) {
  return (
    <Card title={t("section_medical_history")}>
      <p className="text-xs text-ink-soft -mt-2">{t("family_aware_hint")}</p>
      <TextAreaField
        label={t("drug_allergies")}
        value={form.drugAllergies}
        onChange={setField("drugAllergies")}
      />
      <TextAreaField
        label={t("comorbidities")}
        value={form.comorbidities}
        onChange={setField("comorbidities")}
      />
      <TextAreaField
        label={t("current_medications")}
        value={form.currentMedications}
        onChange={setField("currentMedications")}
      />
    </Card>
  );
}

export function IntakePage({ onSubmitted }) {
  const { t, lang } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleSymptom = (key) => {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(key)
        ? f.symptoms.filter((s) => s !== key)
        : [...f.symptoms, key],
    }));
  };

  // Physiologically-plausible-range check (VITAL_RANGES) -- distinct from
  // assessmentEscalatesSeverity()'s "is this dangerous" thresholds. Native
  // number-input min/max already blocks most of this in-browser; this is a
  // second layer so a value that slips through still gets a clear in-app
  // message instead of a silent DB rejection stuck in the offline queue.
  const validateVitals = () => {
    const errors = {};
    for (const [field, range] of Object.entries(VITAL_RANGES)) {
      const raw = form[field];
      if (raw === "" || raw == null) continue;
      const num = Number(raw);
      if (Number.isNaN(num) || num < range.min || num > range.max) {
        errors[field] = t("value_out_of_range", range.min, range.max);
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateVitals();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const num = (v) => (v === "" || v == null ? null : Number(v));
    const assessment = {
      consciousnessScale: form.consciousnessScale || null,
      gcsScore: num(form.gcsScore),
      avpuLevel: form.avpuLevel || null,
      airwayStatus: form.airwayStatus || null,
      breathingStatus: form.breathingStatus || null,
      circulationStatus: form.circulationStatus || null,
      bleedingTrauma: form.bleedingTrauma,
      oxygenSaturation: num(form.oxygenSaturation),
      respiratoryRate: num(form.respiratoryRate),
      pulseRate: num(form.pulseRate),
      bodyTemperature: num(form.bodyTemperature),
      systolicBp: num(form.systolicBp),
    };
    const severity = assessmentEscalatesSeverity(assessment)
      ? "red"
      : computeSeverity(form.symptoms);
    const position = await getCurrentPosition();

    const payload = {
      device_id: getDeviceId(),
      patient_name: form.patientName || null,
      age: num(form.age),
      address: form.address || null,
      complaint_history: form.complaintHistory || null,
      symptoms: form.symptoms,
      notes: form.notes || null,
      severity,
      latitude: position.latitude,
      longitude: position.longitude,
      systolic_bp: assessment.systolicBp,
      diastolic_bp: num(form.diastolicBp),
      pulse_rate: assessment.pulseRate,
      respiratory_rate: assessment.respiratoryRate,
      body_temperature: assessment.bodyTemperature,
      oxygen_saturation: assessment.oxygenSaturation,
      consciousness_scale: assessment.consciousnessScale,
      gcs_score: assessment.gcsScore,
      avpu_level: assessment.avpuLevel,
      airway_status: assessment.airwayStatus,
      breathing_status: assessment.breathingStatus,
      circulation_status: assessment.circulationStatus,
      bleeding_trauma: assessment.bleedingTrauma,
      bleeding_trauma_notes: form.bleedingTraumaNotes || null,
      drug_allergies: form.drugAllergies || null,
      comorbidities: form.comorbidities || null,
      current_medications: form.currentMedications || null,
    };

    try {
      const { synced } = await submitIntake(payload);
      setLastResult({ severity, synced, locationError: position.error });
      setForm(emptyForm);
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-deep shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">{t("intake_title")}</h1>
          <p className="text-xs text-white/70">{t("intake_subtitle")}</p>
        </div>
        <SettingsComponent triggerClassName="border-transparent text-white hover:bg-white/10" />
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 pb-24">
          {lastResult && (
            <div
              className={`mb-6 rounded-lg p-4 border-l-4 animate-fade-in ${SEVERITY_META[lastResult.severity].border} ${SEVERITY_META[lastResult.severity].soft}`}
            >
              <p className="font-medium text-ink">
                {t("saved")}{" "}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_META[lastResult.severity].badge}`}
                >
                  {pick(
                    SEVERITY_META[lastResult.severity].label,
                    SEVERITY_META[lastResult.severity].labelId,
                    lang,
                  )}
                </span>
              </p>
              <p className="text-sm text-ink-soft mt-1">
                {lastResult.synced ? t("sent_immediately") : t("saved_offline")}
              </p>
              <p className="text-xs text-ink-soft mt-2">
                {t(LOCATION_STATUS_KEY[lastResult.locationError ?? "ok"])}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 md:gap-4 md:items-start space-y-4 md:space-y-0"
          >
            <div className="space-y-4">
              <PatientInfoSection
                form={form}
                setField={setField}
                t={t}
                fieldErrors={fieldErrors}
              />
              <ComplaintHistorySection form={form} setField={setField} t={t} />
              <SymptomsSection
                form={form}
                toggleSymptom={toggleSymptom}
                t={t}
                lang={lang}
              />
              <NotesSection form={form} setField={setField} t={t} />
            </div>

            <div className="space-y-4">
              <VitalsSection
                form={form}
                setField={setField}
                t={t}
                fieldErrors={fieldErrors}
              />
              <ConsciousnessSection
                form={form}
                setField={setField}
                t={t}
                fieldErrors={fieldErrors}
              />
              <PrimarySurveySection form={form} setField={setField} t={t} />
              <MedicalHistorySection form={form} setField={setField} t={t} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 w-full rounded-lg bg-brand text-white font-semibold py-3 transition-colors hover:bg-brand-deep disabled:opacity-50"
            >
              {submitting ? t("saving") : t("submit")}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-ink-soft underline">
              {t("health_worker_login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
