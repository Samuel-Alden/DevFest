import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { SEVERITY_META, SYMPTOM_OPTIONS } from "../../lib/triage";
import { BackIcon } from "../icons";
import { CaseMap } from "./CaseMap";
import { useTranslation, pick } from "../../lib/i18n";

function Stat({ label, value, flagged }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd
        className={`text-sm font-medium ${flagged ? "text-tag-red" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}

const STATUS_LABEL_KEY = {
  pending: "status_pending",
  in_progress: "in_progress",
  resolved: "status_resolved_label",
};

export function CaseDetailPane({
  row,
  mode = "active",
  onBack,
  onUpdateStatus,
  onReopen,
  onDelete,
  className = "",
}) {
  const { t, lang } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingForId, setConfirmingForId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyEvents, setHistoryEvents] = useState([]);

  // Reset the armed delete-confirm state when the selected case changes,
  // without an effect -- this runs during render, so switching cases can't
  // flash the previous case's confirm box for a frame before it clears.
  if (row?.id !== confirmingForId && confirmingDelete) {
    setConfirmingDelete(false);
  }

  useEffect(() => {
    setShowHistory(false);
    setHistoryEvents([]);
    if (!row) return;
    let cancelled = false;
    supabase
      .from("case_events")
      .select("*")
      .eq("submission_id", row.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled) setHistoryEvents(data ?? []);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id]);

  if (!row) {
    return (
      <div
        className={`${className} items-center justify-center text-ink-soft text-sm`}
      >
        {t("select_case")}
      </div>
    );
  }

  const meta = SEVERITY_META[row.severity];
  const hasLocation = row.latitude != null && row.longitude != null;
  const hasVitals =
    row.systolic_bp != null ||
    row.diastolic_bp != null ||
    row.pulse_rate != null ||
    row.respiratory_rate != null ||
    row.body_temperature != null ||
    row.oxygen_saturation != null;
  const hasConsciousness =
    (row.consciousness_scale === "gcs" && row.gcs_score != null) ||
    (row.consciousness_scale === "avpu" && row.avpu_level != null);
  const hasPrimarySurvey =
    row.airway_status ||
    row.breathing_status ||
    row.circulation_status ||
    row.bleeding_trauma;
  const hasMedicalHistory =
    row.drug_allergies || row.comorbidities || row.current_medications;

  return (
    <div className={`${className} flex-col overflow-hidden`}>
      <div
        key={row.id}
        className="h-full w-full p-5 animate-fade-in flex flex-col min-h-0"
      >
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1 text-sm text-ink-soft mb-4"
        >
          <BackIcon className="h-4 w-4" />
          {t("back_to_queue")}
        </button>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 overflow-hidden">
          <div className="min-h-0 flex flex-col">
            <div>
              <span
                className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${meta.badge}`}
              >
                {pick(meta.label, meta.labelId, lang)}
              </span>

              <h2 className="mt-2 text-2xl font-bold text-ink leading-tight">
                {row.patient_name || t("unnamed_patient")}
                {row.age ? ` (${row.age})` : ""}
              </h2>

              <p className="text-sm text-ink-soft mt-1">
                {t("submitted_at", new Date(row.created_at).toLocaleString())}
              </p>

              {row.address && (
                <p className="text-sm text-ink-soft mt-1">{row.address}</p>
              )}
            </div>

            {/* Selected Symptoms ONLY */}
            <div className="mt-5">
              <h3 className="text-base font-semibold text-ink mb-2">
                {t("symptoms_heading")}
              </h3>

              <div className="space-y-2">
                {(row.symptoms ?? [])
                  .map((key) => SYMPTOM_OPTIONS.find((opt) => opt.key === key))
                  .filter(Boolean)
                  .map((opt) => (
                    <div
                      key={opt.key}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          SEVERITY_META[opt.severity].badge
                        }`}
                      />

                      <span>{pick(opt.label, opt.labelId, lang)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* MAP */}
            {hasLocation && (
              <div className="mt-5 min-h-0 flex flex-col">
                <h3 className="text-base font-semibold text-ink mb-2">
                  {t("location_heading")}
                </h3>

                <div className="h-[260px] rounded-xl overflow-hidden border border-line">
                  <CaseMap rows={[row]} onSelect={() => {}} />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-4 pt-3 flex gap-2 shrink-0 border-t border-line">
              {mode === "resolved" ? (
                <>
                  <button
                    onClick={() => onReopen(row.id)}
                    className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
                  >
                    {t("reopen_case")}
                  </button>

                  {!confirmingDelete && (
                    <button
                      onClick={() => {
                        setConfirmingForId(row.id);
                        setConfirmingDelete(true);
                      }}
                      className="text-sm px-4 py-2 rounded-lg border border-line text-tag-red transition-colors hover:bg-tag-red-soft"
                    >
                      {t("delete_case")}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {row.status !== "in_progress" && (
                    <button
                      onClick={() => onUpdateStatus(row.id, "in_progress")}
                      className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
                    >
                      {t("in_progress")}
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateStatus(row.id, "resolved")}
                    className="text-sm px-4 py-2 rounded-lg bg-brand text-white transition-colors hover:bg-brand-deep"
                  >
                    {t("resolve")}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="min-h-0 overflow-hidden flex flex-col">
            {/* Consciousness */}
            {hasConsciousness && (
              <section>
                <h3 className="text-lg font-semibold text-ink mb-4">
                  {t("section_consciousness")}
                </h3>

                <div className="space-y-3">
                  {row.consciousness_scale === "avpu" && (
                    <div>
                      <p className="text-sm text-ink-soft">{t("avpu_label")}</p>

                      <p className="text-lg font-semibold text-ink">
                        {t(`avpu_${row.avpu_level}`)}
                      </p>
                    </div>
                  )}

                  {row.consciousness_scale === "gcs" && (
                    <div>
                      <p className="text-sm text-ink-soft">
                        {t("gcs_score_label")}
                      </p>

                      <p className="text-lg font-semibold text-ink">
                        {row.gcs_score}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Primary Survey */}
            {hasPrimarySurvey && (
              <section className="mt-8">
                <h3 className="text-lg font-semibold text-ink mb-4">
                  {t("section_primary_survey")}
                </h3>

                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {row.airway_status && (
                    <div>
                      <p className="text-sm text-ink-soft">
                        {t("airway_label")}
                      </p>

                      <p
                        className={`text-lg font-semibold ${
                          row.airway_status === "compromised"
                            ? "text-tag-red"
                            : "text-ink"
                        }`}
                      >
                        {t(`status_${row.airway_status}`)}
                      </p>
                    </div>
                  )}

                  {row.breathing_status && (
                    <div>
                      <p className="text-sm text-ink-soft">
                        {t("breathing_label")}
                      </p>

                      <p
                        className={`text-lg font-semibold ${
                          row.breathing_status === "compromised"
                            ? "text-tag-red"
                            : "text-ink"
                        }`}
                      >
                        {t(`status_${row.breathing_status}`)}
                      </p>
                    </div>
                  )}

                  {row.circulation_status && (
                    <div>
                      <p className="text-sm text-ink-soft">
                        {t("circulation_label")}
                      </p>

                      <p
                        className={`text-lg font-semibold ${
                          row.circulation_status === "compromised"
                            ? "text-tag-red"
                            : "text-ink"
                        }`}
                      >
                        {t(`status_${row.circulation_status}`)}
                      </p>
                    </div>
                  )}
                </div>

                {row.bleeding_trauma && (
                  <p className="text-sm text-tag-red mt-5">
                    {t("bleeding_trauma_label")}
                    {row.bleeding_trauma_notes
                      ? `: ${row.bleeding_trauma_notes}`
                      : ""}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>

        {mode === "resolved" && confirmingDelete && (
          <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-tag-red bg-tag-red-soft p-3 animate-fade-in">
            <p className="text-sm text-ink">{t("delete_confirm_prompt")}</p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onDelete(row.id)}
                className="text-sm px-4 py-2 rounded-lg bg-tag-red text-white transition-colors hover:opacity-90"
              >
                {t("confirm_delete")}
              </button>

              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
