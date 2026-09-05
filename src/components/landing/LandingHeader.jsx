import { Link } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { LanguageToggle } from '../LanguageToggle'
import { BrandMark } from './landingIcons'

export function LandingHeader() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          to="/"
          aria-label="TriagePeace"
          className="flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <BrandMark className="h-7 w-7 text-ink" />
          <span className="text-base font-bold tracking-tight text-ink">TriagePeace</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <Link
            to="/login"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span className="sm:hidden">{t('lp_login_short')}</span>
            <span className="hidden sm:inline">{t('health_worker_login')}</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
