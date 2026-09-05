import { useEffect, useState } from 'react'
import {
  getPushSubscriptionState,
  isPushSupported,
  subscribeToPush,
  getNotifyPreferences,
  updateNotifyPreferences,
} from '../lib/push'
import { SEVERITY_META } from '../lib/triage'

const SEVERITIES = ['red', 'yellow', 'green']

export function PushAlertToggle() {
  const [state, setState] = useState('checking')
  const [selected, setSelected] = useState(['red'])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setState('unsupported')
      return
    }
    getPushSubscriptionState().then(async (s) => {
      setState(s)
      if (s === 'subscribed') {
        const prefs = await getNotifyPreferences()
        if (prefs) setSelected(prefs)
      }
    })
  }, [])

  const handleEnable = async () => {
    setError(null)
    try {
      await subscribeToPush(selected)
      setState('subscribed')
    } catch (err) {
      setError(err.message)
      setState(await getPushSubscriptionState())
    }
  }

  const toggleSeverity = async (key) => {
    const next = selected.includes(key) ? selected.filter((s) => s !== key) : [...selected, key]
    setSelected(next)
    setError(null)

    if (state === 'subscribed') {
      setSaving(true)
      try {
        await updateNotifyPreferences(next)
      } catch (err) {
        setError(err.message)
      } finally {
        setSaving(false)
      }
    }
  }

  if (state === 'unsupported' || state === 'checking') return null

  if (state === 'denied') {
    return <span className="text-xs text-ink-soft">Notifications blocked in browser settings</span>
  }

  return (
    <div className="text-right">
      <p className="text-xs font-medium text-ink mb-1">
        {state === 'subscribed' ? '🔔 Alert me for:' : 'Alert me for:'}
      </p>
      <div className="flex gap-2 justify-end mb-1.5">
        {SEVERITIES.map((key) => (
          <label key={key} className="flex items-center gap-1 text-xs text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={() => toggleSeverity(key)}
              disabled={saving}
              className="h-3.5 w-3.5 accent-brand"
            />
            {SEVERITY_META[key].label}
          </label>
        ))}
      </div>
      {state !== 'subscribed' && (
        <button
          onClick={handleEnable}
          disabled={selected.length === 0}
          className="text-xs px-3 py-1.5 rounded-lg border border-brand text-brand transition-colors hover:bg-brand-soft disabled:opacity-50"
        >
          Enable alerts
        </button>
      )}
      {error && <p className="text-xs text-tag-red mt-1">{error}</p>}
    </div>
  )
}
