import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../lib/i18n'
import { LanguageToggle } from '../components/LanguageToggle'
import { BackIcon } from '../components/icons'

export function LoginPage() {
  const { session, loading } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError(error.message)
  }

  return (
    <div className="max-w-sm mx-auto p-4 mt-16">
      <Link to="/" className="flex items-center gap-1 text-sm text-ink-soft mb-6 w-fit">
        <BackIcon className="h-4 w-4" /> {t('back')}
      </Link>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">{t('clinic_login')}</h1>
          <p className="text-sm text-ink-soft">{t('clinic_login_subtitle')}</p>
        </div>
        <LanguageToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">{t('email')}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">{t('password')}</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
        </label>

        {error && <p className="text-sm text-tag-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand text-white font-semibold py-2.5 transition-colors hover:bg-brand-deep disabled:opacity-50"
        >
          {submitting ? t('signing_in') : t('sign_in')}
        </button>
      </form>
    </div>
  )
}
