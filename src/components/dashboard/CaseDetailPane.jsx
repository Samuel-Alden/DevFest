import { useState } from 'react'
import { SEVERITY_META, SYMPTOM_OPTIONS } from '../../lib/triage'
import { BackIcon } from '../icons'
import { CaseMap } from './CaseMap'
import { useTranslation, pick } from '../../lib/i18n'

function Stat({ label, value, flagged }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className={`text-sm font-medium ${flagged ? 'text-tag-red' : 'text-ink'}`}>{value}</dd>
    </div>
  )
}

export function CaseDetailPane({ row, mode = 'active', onBack, onUpdateStatus, onReopen, onDelete, className = '' }) {
  const { t, lang } = useTranslation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingForId, setConfirmingForId] = useState(null)

  // Reset the armed delete-confirm state when the selected case changes,
  // without an effect -- this runs during render, so switching cases can't
  // flash the previous case's confirm box for a frame before it clears.
  if (row?.id !== confirmingForId && confirmingDelete) {
    setConfirmingDelete(false)
  }

  if (!row) {
    return (
      <div className={`${className} items-center justify-center text-ink-soft text-sm`}>
        {t('select_case')}
      </div>
    )
  }

  const meta = SEVERITY_META[row.severity]
  const hasLocation = row.latitude != null && row.longitude != null
  const hasVitals =
    row.systolic_bp != null ||
    row.diastolic_bp != null ||
    row.pulse_rate != null ||
    row.respiratory_rate != null ||
    row.body_temperature != null ||
    row.oxygen_saturation != null
  const hasConsciousness =
    (row.consciousness_scale === 'gcs' && row.gcs_score != null) ||
    (row.consciousness_scale === 'avpu' && row.avpu_level != null)
  const hasPrimarySurvey = row.airway_status || row.breathing_status || row.circulation_status || row.bleeding_trauma
  const hasMedicalHistory = row.drug_allergies || row.comorbidities || row.current_medications

  return (
    <div className={`${className} flex-col overflow-y-auto`}>
      <div key={row.id} className="p-4 max-w-xl w-full mx-auto animate-fade-in">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1 text-sm text-ink-soft mb-4"
        >
          <BackIcon className="h-4 w-4" /> {t('back_to_queue')}
        </button>

        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}>
          {pick(meta.label, meta.labelId, lang)}
        </span>
        <h2 className="mt-2 text-xl font-bold text-ink">
          {row.patient_name || t('unnamed_patient')} {row.age ? `(${row.age})` : ''}
        </h2>
        <p className="text-xs text-ink-soft mt-1">{t('submitted_at', new Date(row.created_at).toLocaleString())}</p>
        {mode === 'resolved' && row.resolved_at && (
          <p className="text-xs text-ink-soft">{t('resolved_at_label', new Date(row.resolved_at).toLocaleString())}</p>
        )}
        {row.address && <p className="text-xs text-ink-soft mt-1">{row.address}</p>}

        {row.complaint_history && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-1">{t('complaint_history_label')}</h3>
            <p className="text-sm text-ink-soft">{row.complaint_history}</p>
          </div>
        )}

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-ink mb-2">{t('symptoms_heading')}</h3>
          <ul className="space-y-1">
            {SYMPTOM_OPTIONS.map((opt) => {
              const checked = row.symptoms?.includes(opt.key)
              return (
                <li
                  key={opt.key}
                  className={`flex items-center gap-2 text-sm ${checked ? 'text-ink' : 'text-ink-soft/50'}`}
                >
                  <span className={`h-2 w-2 rounded-full ${checked ? SEVERITY_META[opt.severity].badge : 'bg-line'}`} />
                  {pick(opt.label, opt.labelId, lang)}
                </li>
              )
            })}
          </ul>
        </div>

        {row.notes && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-1">{t('notes_heading')}</h3>
            <p className="text-sm text-ink-soft italic">"{row.notes}"</p>
          </div>
        )}

        {hasVitals && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-2">{t('section_vitals')}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(row.systolic_bp != null || row.diastolic_bp != null) && (
                <Stat label={t('blood_pressure_label')} value={`${row.systolic_bp ?? '—'} / ${row.diastolic_bp ?? '—'}`} />
              )}
              {row.pulse_rate != null && <Stat label={t('pulse_rate')} value={row.pulse_rate} />}
              {row.respiratory_rate != null && <Stat label={t('respiratory_rate')} value={row.respiratory_rate} />}
              {row.body_temperature != null && <Stat label={t('body_temperature')} value={row.body_temperature} />}
              {row.oxygen_saturation != null && <Stat label={t('oxygen_saturation')} value={row.oxygen_saturation} />}
            </dl>
          </div>
        )}

        {hasConsciousness && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-2">{t('section_consciousness')}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {row.consciousness_scale === 'gcs' && <Stat label={t('gcs_score_label')} value={row.gcs_score} />}
              {row.consciousness_scale === 'avpu' && <Stat label={t('avpu_label')} value={t(`avpu_${row.avpu_level}`)} />}
            </dl>
          </div>
        )}

        {hasPrimarySurvey && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-2">{t('section_primary_survey')}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {row.airway_status && (
                <Stat label={t('airway_label')} value={t(`status_${row.airway_status}`)} flagged={row.airway_status === 'compromised'} />
              )}
              {row.breathing_status && (
                <Stat
                  label={t('breathing_label')}
                  value={t(`status_${row.breathing_status}`)}
                  flagged={row.breathing_status === 'compromised'}
                />
              )}
              {row.circulation_status && (
                <Stat
                  label={t('circulation_label')}
                  value={t(`status_${row.circulation_status}`)}
                  flagged={row.circulation_status === 'compromised'}
                />
              )}
            </dl>
            {row.bleeding_trauma && (
              <p className="text-sm text-tag-red mt-3">
                {t('bleeding_trauma_label')}
                {row.bleeding_trauma_notes ? `: ${row.bleeding_trauma_notes}` : ''}
              </p>
            )}
          </div>
        )}

        {hasMedicalHistory && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-2">{t('section_medical_history')}</h3>
            <div className="space-y-2 text-sm text-ink">
              {row.drug_allergies && (
                <p>
                  <span className="text-ink-soft">{t('drug_allergies')}: </span>
                  {row.drug_allergies}
                </p>
              )}
              {row.comorbidities && (
                <p>
                  <span className="text-ink-soft">{t('comorbidities')}: </span>
                  {row.comorbidities}
                </p>
              )}
              {row.current_medications && (
                <p>
                  <span className="text-ink-soft">{t('current_medications')}: </span>
                  {row.current_medications}
                </p>
              )}
            </div>
          </div>
        )}

        {hasLocation && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-2">{t('location_heading')}</h3>
            <div className="h-48 rounded-lg overflow-hidden border border-line">
              <CaseMap rows={[row]} onSelect={() => {}} />
            </div>
          </div>
        )}

        {mode === 'resolved' && confirmingDelete && (
          <div className="mt-6 rounded-lg border border-tag-red bg-tag-red-soft p-3 animate-fade-in">
            <p className="text-sm text-ink">{t('delete_confirm_prompt')}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onDelete(row.id)}
                className="text-sm px-4 py-2 rounded-lg bg-tag-red text-white transition-colors hover:opacity-90"
              >
                {t('confirm_delete')}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {mode === 'resolved' ? (
            <>
              <button
                onClick={() => onReopen(row.id)}
                className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
              >
                {t('reopen_case')}
              </button>
              {!confirmingDelete && (
                <button
                  onClick={() => {
                    setConfirmingForId(row.id)
                    setConfirmingDelete(true)
                  }}
                  className="text-sm px-4 py-2 rounded-lg border border-line text-tag-red transition-colors hover:bg-tag-red-soft"
                >
                  {t('delete_case')}
                </button>
              )}
            </>
          ) : (
            <>
              {row.status !== 'in_progress' && (
                <button
                  onClick={() => onUpdateStatus(row.id, 'in_progress')}
                  className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
                >
                  {t('in_progress')}
                </button>
              )}
              <button
                onClick={() => onUpdateStatus(row.id, 'resolved')}
                className="text-sm px-4 py-2 rounded-lg bg-brand text-white transition-colors hover:bg-brand-deep"
              >
                {t('resolve')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
