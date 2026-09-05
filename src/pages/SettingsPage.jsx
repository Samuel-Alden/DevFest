import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useTranslation } from '../lib/i18n'
import { useTheme } from '../lib/theme'
import { BackIcon, SunIcon, MoonIcon, LogoutIcon } from '../components/icons'

export function SettingsPage() {
  const { session, loading } = useAuth()
  const { t, lang, toggleLang } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  if (!loading && !session) return <Navigate to="/login" replace />

  return (
    <div className="max-w-sm mx-auto p-4 mt-8 pb-16">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-ink-soft mb-6 w-fit">
        <BackIcon className="h-4 w-4" /> {t('back_to_queue')}
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-6">{t('settings_title')}</h1>

      <div className="rounded-xl border border-line divide-y divide-line overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-ink">{t('language_label')}</p>
            <p className="text-xs text-ink-soft mt-0.5">{lang === 'en' ? 'English' : 'Bahasa Indonesia'}</p>
          </div>
          <button
            onClick={toggleLang}
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-line text-ink-soft transition-colors hover:bg-paper-dim"
          >
            {lang === 'en' ? 'ID' : 'EN'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-ink">{t('appearance_label')}</p>
            <p className="text-xs text-ink-soft mt-0.5">{theme === 'dark' ? t('dark_mode') : t('light_mode')}</p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={t('appearance_label')}
            className="p-2 rounded-lg border border-line text-ink-soft transition-colors hover:bg-paper-dim"
          >
            {theme === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-tag-red text-white transition-colors hover:opacity-90"
          >
            <LogoutIcon className="h-4 w-4" /> {t('sign_out')}
          </button>
        </div>
      </div>
    </div>
  )
}
