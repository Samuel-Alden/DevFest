import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getCurrentPosition } from '../lib/geolocation'
import { useTranslation } from '../lib/i18n'
import { LanguageToggle } from '../components/LanguageToggle'

export function LandingPage() {
  const { t } = useTranslation()

  // Prime the location-permission prompt here, before the field worker ever
  // reaches the intake form -- it's the one permission /intake depends on,
  // and asking for it on this screen instead means the prompt is already
  // resolved by the time they're filling out a case (see geolocation.js).
  // The result itself is discarded; every submission still fetches a fresh
  // position at submit time.
  useEffect(() => {
    getCurrentPosition()
  }, [])

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <h1 className="text-3xl font-bold text-ink">TriagePeace</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-soft">{t('landing_tagline')}</p>

        <div className="mt-10 w-full max-w-xs space-y-3">
          <Link
            to="/intake"
            className="block w-full rounded-lg bg-brand text-white font-semibold py-3 transition-colors hover:bg-brand-deep"
          >
            {t('start_intake')}
          </Link>
          <Link
            to="/login"
            className="block w-full rounded-lg border border-line text-ink font-semibold py-3 transition-colors hover:bg-paper-dim"
          >
            {t('health_worker_login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
