import { useEffect, useState } from 'react'
import { useTranslation, pick } from '../../lib/i18n'
import { SEVERITY_META } from '../../lib/triage'
import { WifiOffIcon, RefreshIcon } from './landingIcons'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The page's one orchestrated moment: a real case sits held on the device while
// offline, then completes to "synced" once, on load. Everything the animation
// touches also has a correct resting state, and reduced-motion users start at
// the end. It reuses the app's own SEVERITY_META so the badge matches the
// dashboard, and is announced to assistive tech as a single summarising label.
export function CasePreview() {
  const { t, lang } = useTranslation()
  const red = SEVERITY_META.red
  const [synced, setSynced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (synced) return
    const id = setTimeout(() => setSynced(true), 1100)
    return () => clearTimeout(id)
  }, [synced])

  return (
    <div
      role="img"
      aria-label={t('lp_hero_preview_label')}
      className="mx-auto w-full max-w-md rounded-2xl border border-line bg-paper p-5 shadow-[0_1px_2px_rgba(32,31,28,0.04),0_12px_32px_-12px_rgba(32,31,28,0.14)]"
    >
      <div aria-hidden="true">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-ink-soft">{t('lp_preview_caption')}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-500 ${
              synced ? 'bg-tag-green-soft text-tag-green' : 'bg-tag-amber-soft text-tag-amber'
            }`}
          >
            {synced ? <RefreshIcon className="h-3.5 w-3.5" /> : <WifiOffIcon className="h-3.5 w-3.5" />}
            {synced ? t('lp_preview_status_synced') : t('lp_preview_status_offline')}
          </span>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base font-semibold text-ink">{t('lp_preview_case')}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${red.badge}`}>
              {pick(red.label, red.labelId, lang)}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{t('lp_preview_patient')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink">
            <span className="text-ink-soft">{t('lp_preview_reported')}</span>
            <span>{t('lp_preview_symptom_1')}</span>
            <span className="text-line" aria-hidden="true">/</span>
            <span>{t('lp_preview_symptom_2')}</span>
          </div>
        </div>

        <ol className="mt-4 border-t border-line pt-4">
          <LifecycleRow tone="bg-brand" done label={t('lp_preview_step_captured')} meta={t('lp_preview_time_captured')} />
          <LifecycleRow tone="bg-tag-amber" done label={t('lp_preview_step_queued')} />
          <LifecycleRow
            tone="bg-tag-green"
            done={synced}
            connectorDone={synced}
            label={t('lp_preview_step_synced')}
            meta={synced ? t('lp_preview_time_synced') : ''}
            last
          />
        </ol>

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
          <span className="text-sm text-ink-soft">{t('lp_preview_queue')}</span>
          <span
            className={`text-sm font-medium transition-colors duration-500 ${synced ? 'text-tag-green' : 'text-ink-soft'}`}
          >
            {synced ? t('lp_preview_queue_item') : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function LifecycleRow({ tone, done, connectorDone, label, meta, last }) {
  return (
    <li className="flex gap-3">
      <span className="flex flex-col items-center">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors duration-500 ${
            done ? tone : 'ring-1 ring-line ring-inset bg-paper'
          }`}
        />
        {!last && (
          <span
            className={`mt-1 w-px flex-1 transition-colors duration-500 ${connectorDone ? 'bg-tag-green' : 'bg-line'}`}
          />
        )}
      </span>
      <span className="flex flex-1 items-baseline justify-between gap-2 pb-3">
        <span className={`text-sm transition-colors duration-500 ${done ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
        {meta ? <span className="shrink-0 text-xs tabular-nums text-ink-soft">{meta}</span> : null}
      </span>
    </li>
  )
}
