import { useEffect, useState } from 'react'
import {
  getPushSubscriptionState,
  isPushSupported,
  subscribeToPush,
  getNotifyPreferences,
  updateNotifyPreferences,
} from '../lib/push'
import { SEVERITY_META } from '../lib/triage'
import { useTranslation, pick } from '../lib/i18n'

const SEVERITIES = ['red', 'yellow', 'green']

const CHIP_ACTIVE = {
  red: 'bg-tag-red text-white border-tag-red shadow-sm',
  yellow: 'bg-tag-amber text-white border-tag-amber shadow-sm',
  green: 'bg-tag-green text-white border-tag-green shadow-sm',
}

const CHIP_IDLE = {
  red: 'bg-tag-red-soft text-tag-red border-tag-red/30 hover:border-tag-red/60',
  yellow: 'bg-tag-amber-soft text-tag-amber border-tag-amber/30 hover:border-tag-amber/60',
  green: 'bg-tag-green-soft text-tag-green border-tag-green/30 hover:border-tag-green/60',
}

const DOT_IDLE = {
  red: 'bg-tag-red',
  yellow: 'bg-tag-amber',
  green: 'bg-tag-green',
}

export function PushAlertToggle() {
  const { t, lang } = useTranslation()
  const [state, setState] = useState('checking')
  const [selected, setSelected] = useState(['red'])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [enabling, setEnabling] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setState('unsupported')
      return
    }
    getPushSubscriptionState().then(async (s) => {
      setState(s)
      if (s === 'subscribed') {
        const prefs = await getNotifyPreferences()
        if (prefs?.length) setSelected(prefs)
      }
    })
  }, [])

  const handleEnable = async () => {
    if (selected.length === 0) return
    setError(null)
    setEnabling(true)
    try {
      await subscribeToPush(selected)
      setState('subscribed')
    } catch (err) {
      setError(err.message)
      setState(await getPushSubscriptionState())
    } finally {
      setEnabling(false)
    }
  }

  const toggleSeverity = async (key) => {
    const prev = selected
    const next = selected.includes(key)
      ? selected.filter((s) => s !== key)
      : [...selected, key]
    setSelected(next)
    setError(null)

    if (state === 'subscribed') {
      setSaving(true)
      try {
        await updateNotifyPreferences(next)
      } catch (err) {
        setError(err.message)
        setSelected(prev)
      } finally {
        setSaving(false)
      }
    }
  }

  if (state === 'unsupported' || state === 'checking') return null

  if (state === 'denied') {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-ink">{t('alert_me_for')}</p>
        <p className="text-xs text-tag-red leading-snug">{t('notifications_blocked')}</p>
      </div>
    )
  }

  const isSubscribed = state === 'subscribed'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink tracking-wide">
          {isSubscribed ? t('alert_me_for_on') : t('alert_me_for')}
        </p>
        {isSubscribed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-tag-green-soft px-2 py-0.5 text-[10px] font-medium text-tag-green">
            <span className="h-1.5 w-1.5 rounded-full bg-tag-green" />
            {t('alerts_on')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SEVERITIES.map((key) => {
          const active = selected.includes(key)
          const meta = SEVERITY_META[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSeverity(key)}
              disabled={saving || enabling}
              aria-pressed={active}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1
                text-xs font-medium transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                ${active ? CHIP_ACTIVE[key] : CHIP_IDLE[key]}
              `}
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  active ? 'bg-white/90' : DOT_IDLE[key]
                }`}
              />
              {pick(meta.label, meta.labelId, lang)}
            </button>
          )
        })}
      </div>

      {!isSubscribed && (
        <button
          type="button"
          onClick={handleEnable}
          disabled={selected.length === 0 || enabling}
          className="
            w-full text-xs font-medium px-3 py-2 rounded-lg
            bg-brand text-white
            transition-colors hover:bg-brand-deep
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
          "
        >
          {enabling ? t('enabling_alerts') : t('enable_alerts')}
        </button>
      )}

      {error && (
        <p className="text-xs text-tag-red leading-snug" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
