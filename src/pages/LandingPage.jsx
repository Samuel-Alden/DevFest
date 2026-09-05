import { Link } from 'react-router-dom'
import { useTranslation } from '../lib/i18n'
import { LandingHeader } from '../components/landing/LandingHeader'
import { CasePreview } from '../components/landing/CasePreview'
import { OfflineSyncFlow } from '../components/landing/OfflineSyncFlow'
import { WifiOffIcon, ClipboardListIcon, RefreshIcon, ShieldCheckIcon, BrandMark } from '../components/landing/landingIcons'

const FEATURES = [
  { key: 'offline', Icon: WifiOffIcon, title: 'lp_feature_offline_title', body: 'lp_feature_offline_body' },
  { key: 'triage', Icon: ClipboardListIcon, title: 'lp_feature_triage_title', body: 'lp_feature_triage_body' },
  { key: 'sync', Icon: RefreshIcon, title: 'lp_feature_sync_title', body: 'lp_feature_sync_body' },
]

const STEPS = ['capture', 'triage', 'save', 'sync', 'respond']

function CtaButtons({ t, onBrand = false }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${onBrand ? 'sm:justify-center' : ''}`}>
      <Link
        to="/intake"
        className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          onBrand
            ? 'bg-white text-brand hover:bg-paper-dim focus-visible:outline-white'
            : 'bg-brand text-white hover:bg-brand-deep focus-visible:outline-ink'
        }`}
      >
        {t('start_intake')}
      </Link>
      <Link
        to="/login"
        className={`inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          onBrand
            ? 'border-white/35 text-white hover:bg-white/10 focus-visible:outline-white'
            : 'border-line text-ink hover:bg-paper-dim focus-visible:outline-ink'
        }`}
      >
        {t('health_worker_login')}
      </Link>
    </div>
  )
}

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_27rem] lg:items-center lg:gap-14 lg:py-24">
            <div className="lg:border-l lg:border-line lg:pl-10">
              <p className="text-sm font-medium text-ink-soft">{t('lp_hero_eyebrow')}</p>
              <h1 className="mt-4 max-w-[16ch] text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-ink text-balance sm:text-[2.5rem] lg:text-[2.75rem]">
                {t('lp_hero_title')}
              </h1>
              <p className="mt-5 max-w-[38rem] text-[1.0625rem] leading-[1.65] text-ink-soft">{t('lp_hero_subtitle')}</p>
              <div className="mt-8">
                <CtaButtons t={t} />
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
                <WifiOffIcon className="h-4 w-4 shrink-0" />
                {t('lp_hero_note')}
              </p>
            </div>
            <CasePreview />
          </div>
        </section>

        {/* Product value */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="max-w-[20ch] text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[1.9rem]">
            {t('lp_value_heading')}
          </h2>
          <p className="mt-4 max-w-[40rem] text-[0.9375rem] leading-[1.65] text-ink-soft">{t('lp_value_subtitle')}</p>

          <div className="mt-12 grid gap-px border-y border-line bg-line sm:grid-cols-3">
            {FEATURES.map(({ key, Icon, title, body }) => (
              <div key={key} className="bg-paper py-6 sm:px-6 sm:py-7 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px] shrink-0 text-ink" />
                  <h3 className="text-[0.9375rem] font-semibold text-ink">{t(title)}</h3>
                </div>
                <p className="mt-2.5 max-w-[22rem] text-[0.9375rem] leading-[1.6] text-ink-soft">{t(body)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow — a genuine sequence, shown as a timeline */}
        <section className="border-y border-line bg-paper-dim">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[22rem_1fr] lg:gap-16 lg:py-28">
            <div>
              <h2 className="max-w-[18ch] text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[1.9rem]">
                {t('lp_workflow_heading')}
              </h2>
              <p className="mt-4 max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink-soft">
                {t('lp_workflow_subtitle')}
              </p>
            </div>
            <ol className="mt-10 lg:mt-1">
              {STEPS.map((step, i) => (
                <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span aria-hidden="true" className="absolute bottom-1 left-4 top-9 w-px bg-line" />
                  )}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-[0.8125rem] font-semibold tabular-nums text-ink">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{t(`lp_step_${step}_title`)}</h3>
                    <p className="mt-1 max-w-[30rem] text-[0.9375rem] leading-[1.55] text-ink-soft">
                      {t(`lp_step_${step}_body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Offline-first highlight */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
            <div>
              <h2 className="max-w-[16ch] text-[1.6rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[1.9rem]">
                {t('lp_offline_heading')}
              </h2>
              <p className="mt-4 max-w-[40rem] text-[0.9375rem] leading-[1.65] text-ink-soft">{t('lp_offline_body')}</p>
            </div>
            <OfflineSyncFlow />
          </div>
        </section>

        {/* Responsibility — a standalone declaration, so it is set apart and centered */}
        <section className="border-y border-line">
          <div className="mx-auto max-w-[38rem] px-5 py-20 text-center sm:px-8 lg:py-24">
            <ShieldCheckIcon className="mx-auto h-6 w-6 text-ink-soft" />
            <h2 className="mt-5 text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.01em] text-ink sm:text-[1.75rem]">
              {t('lp_trust_heading')}
            </h2>
            <p className="mx-auto mt-4 max-w-[34rem] text-[0.9375rem] leading-[1.7] text-ink-soft">{t('lp_trust_body')}</p>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="rounded-2xl bg-brand px-6 py-14 text-center sm:px-12 lg:py-16">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-white sm:text-[1.75rem]">
              {t('lp_final_heading')}
            </h2>
            <p className="mx-auto mt-3 max-w-[30rem] text-[0.9375rem] leading-[1.6] text-white/85">{t('lp_final_body')}</p>
            <div className="mt-8">
              <CtaButtons t={t} onBrand />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="max-w-[24rem]">
            <div className="flex items-center gap-2">
              <BrandMark className="h-5 w-5 text-ink" />
              <span className="font-semibold text-ink">TriagePeace</span>
            </div>
            <p className="mt-2 text-sm leading-[1.6] text-ink-soft">{t('landing_tagline')}</p>
          </div>
          <p className="text-sm text-ink-soft">© {new Date().getFullYear()} TriagePeace</p>
        </div>
      </footer>
    </div>
  )
}
