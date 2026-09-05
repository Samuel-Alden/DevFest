import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SYMPTOM_OPTIONS, computeSeverity, SEVERITY_META } from '../lib/triage'
import { submitIntake } from '../lib/queue'
import { getDeviceId } from '../lib/deviceId'
import { getCurrentPosition } from '../lib/geolocation'
import { useTranslation, pick } from '../lib/i18n'
import { SettingsComponent } from '../components/settingsComponent'

const emptyForm = { patientName: '', age: '', notes: '', symptoms: [] }

const SYMPTOM_GROUPS = [
  { severity: 'red', headingKey: 'group_emergency', options: SYMPTOM_OPTIONS.filter((o) => o.severity === 'red') },
  { severity: 'yellow', headingKey: 'group_other', options: SYMPTOM_OPTIONS.filter((o) => o.severity === 'yellow') },
]

const inputClasses =
  'mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft'

const LOCATION_STATUS_KEY = {
  ok: 'location_captured',
  denied: 'location_denied',
  timeout: 'location_timeout',
  unavailable: 'location_unavailable',
  unsupported: 'location_unavailable',
}

export function IntakePage({ onSubmitted }) {
  const { t, lang } = useTranslation()
  const [form, setForm] = useState(emptyForm)
  const [lastResult, setLastResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const toggleSymptom = (key) => {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(key) ? f.symptoms.filter((s) => s !== key) : [...f.symptoms, key],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const severity = computeSeverity(form.symptoms)
    const position = await getCurrentPosition()
    const payload = {
      device_id: getDeviceId(),
      patient_name: form.patientName || null,
      age: form.age ? Number(form.age) : null,
      symptoms: form.symptoms,
      notes: form.notes || null,
      severity,
      latitude: position.latitude,
      longitude: position.longitude,
    }

    try {
      const { synced } = await submitIntake(payload)
      setLastResult({ severity, synced, locationError: position.error })
      setForm(emptyForm)
      onSubmitted?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('intake_title')}</h1>
          <p className="text-sm text-ink-soft mt-1">{t('intake_subtitle')}</p>
        </div>
        <SettingsComponent />
      </header>

      {lastResult && (
        <div
          className={`mb-6 rounded-lg p-4 border-l-4 animate-fade-in ${SEVERITY_META[lastResult.severity].border} ${SEVERITY_META[lastResult.severity].soft}`}
        >
          <p className="font-medium text-ink">
            {t('saved')}{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_META[lastResult.severity].badge}`}>
              {pick(SEVERITY_META[lastResult.severity].label, SEVERITY_META[lastResult.severity].labelId, lang)}
            </span>
          </p>
          <p className="text-sm text-ink-soft mt-1">
            {lastResult.synced ? t('sent_immediately') : t('saved_offline')}
          </p>
          <p className="text-xs text-ink-soft mt-2">{t(LOCATION_STATUS_KEY[lastResult.locationError ?? 'ok'])}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-2 block">
            <span className="text-sm font-medium text-ink">{t('patient_name')}</span>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
              className={inputClasses}
              placeholder={t('optional')}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">{t('age')}</span>
            <input
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              className={inputClasses}
            />
          </label>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-ink mb-1">{t('symptoms_label')}</legend>
          {SYMPTOM_GROUPS.map((group) => (
            <div key={group.severity} className={`rounded-lg border-l-4 pl-3 ${SEVERITY_META[group.severity].border}`}>
              <p className="text-xs font-semibold text-ink-soft mb-2">{t(group.headingKey)}</p>
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
                    <span className="flex-1 text-sm text-ink">{pick(opt.label, opt.labelId, lang)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-ink">{t('notes')}</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={inputClasses}
            rows={3}
            placeholder={t('notes_placeholder')}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand text-white font-semibold py-3 transition-colors hover:bg-brand-deep disabled:opacity-50"
        >
          {submitting ? t('saving') : t('submit')}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-sm text-ink-soft underline">
          {t('health_worker_login')}
        </Link>
      </div>
    </div>
  )
}
