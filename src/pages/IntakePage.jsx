import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SYMPTOM_OPTIONS, computeSeverity, SEVERITY_META } from '../lib/triage'
import { submitIntake } from '../lib/queue'
import { getDeviceId } from '../lib/deviceId'

const emptyForm = { patientName: '', age: '', notes: '', symptoms: [] }

export function IntakePage({ onSubmitted }) {
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
    const payload = {
      device_id: getDeviceId(),
      patient_name: form.patientName || null,
      age: form.age ? Number(form.age) : null,
      symptoms: form.symptoms,
      notes: form.notes || null,
      severity,
    }

    try {
      const { synced } = await submitIntake(payload)
      setLastResult({ severity, synced })
      setForm(emptyForm)
      onSubmitted?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Symptom Intake</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Works offline. Submissions sync automatically once you're back online.
        </p>
      </header>

      {lastResult && (
        <div
          className={`mb-6 rounded-lg p-4 border ${
            lastResult.synced ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <p className="font-medium">
            Saved.{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_META[lastResult.severity].badge}`}>
              {SEVERITY_META[lastResult.severity].label}
            </span>
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            {lastResult.synced ? 'Sent to the clinic immediately.' : 'Saved on this device — will sync when online.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-2 block">
            <span className="text-sm font-medium text-neutral-700">Patient name</span>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Age</span>
            <input
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-700 mb-2">Symptoms (select all that apply)</legend>
          <div className="space-y-2">
            {SYMPTOM_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 cursor-pointer hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={form.symptoms.includes(opt.key)}
                  onChange={() => toggleSymptom(opt.key)}
                  className="h-4 w-4"
                />
                <span className="flex-1 text-sm">{opt.label}</span>
                <span className={`h-2 w-2 rounded-full ${opt.severity === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            rows={3}
            placeholder="Anything else the clinic should know"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-red-600 text-white font-semibold py-3 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Submit'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-sm text-neutral-400 underline">
          Health worker login
        </Link>
      </div>
    </div>
  )
}
