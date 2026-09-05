import { useTranslation } from '../lib/i18n'

export function LanguageToggle({ className = '' }) {
  const { lang, toggleLang } = useTranslation()

  return (
    <button
      onClick={toggleLang}
      className={`text-xs font-semibold px-2 py-1 rounded-md border border-line text-ink-soft transition-colors hover:bg-paper-dim ${className}`}
    >
      {lang === 'en' ? 'ID' : 'EN'}
    </button>
  )
}
