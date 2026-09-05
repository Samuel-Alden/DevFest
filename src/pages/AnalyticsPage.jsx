import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SEVERITY_META, SEVERITY_HEX, SYMPTOM_OPTIONS } from '../lib/triage'
import { useTranslation, pick } from '../lib/i18n'
import { BackIcon } from '../components/icons'

const WINDOW_DAYS = 14

const axisTick = { fill: 'var(--color-ink-soft)', fontSize: 12 }

function buildVolumeSeries(rows, lang) {
  const counts = new Map()
  for (const row of rows) {
    const key = row.created_at.slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const series = []
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const day = new Date()
    day.setDate(day.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    series.push({
      date: day.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }),
      count: counts.get(key) ?? 0,
    })
  }
  return series
}

function buildSeverityMix(rows) {
  const counts = { red: 0, yellow: 0, green: 0 }
  for (const row of rows) {
    if (counts[row.severity] !== undefined) counts[row.severity] += 1
  }
  return ['red', 'yellow', 'green'].map((severity) => ({ severity, count: counts[severity] }))
}

function buildSymptomFrequency(rows, lang) {
  const counts = new Map()
  for (const row of rows) {
    for (const key of row.symptoms ?? []) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return SYMPTOM_OPTIONS.map((opt) => ({
    label: pick(opt.label, opt.labelId, lang),
    count: counts.get(opt.key) ?? 0,
  })).sort((a, b) => b.count - a.count)
}

export function AnalyticsPage() {
  const { session, loading } = useAuth()
  const { t, lang } = useTranslation()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (!session) return

    async function load() {
      const since = new Date()
      since.setDate(since.getDate() - (WINDOW_DAYS - 1))
      since.setHours(0, 0, 0, 0)
      const { data } = await supabase
        .from('triage_submissions')
        .select('created_at, severity, symptoms')
        .gte('created_at', since.toISOString())
      setRows(data ?? [])
    }

    load()
  }, [session])

  if (!loading && !session) return <Navigate to="/login" replace />

  const hasData = (rows?.length ?? 0) > 0
  const volumeSeries = rows ? buildVolumeSeries(rows, lang) : []
  const severityMix = rows ? buildSeverityMix(rows) : []
  const symptomFrequency = rows ? buildSymptomFrequency(rows, lang) : []

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-ink-soft mb-6 w-fit">
        <BackIcon className="h-4 w-4" /> {t('back')}
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-6">{t('analytics_title')}</h1>

      {rows !== null && !hasData && <p className="text-sm text-ink-soft">{t('no_trend_data')}</p>}

      {hasData && (
        <div className="space-y-6">
          <section className="rounded-xl border border-line p-4">
            <h2 className="text-sm font-semibold text-ink mb-4">{t('case_volume_heading')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeSeries}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="date" tick={axisTick} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={axisTick} width={28} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-ink)' }}
                />
                <Bar dataKey="count" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-xl border border-line p-4">
            <h2 className="text-sm font-semibold text-ink mb-4">{t('severity_mix_heading')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityMix} dataKey="count" nameKey="severity" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {severityMix.map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_HEX[entry.severity]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => pick(SEVERITY_META[value].label, SEVERITY_META[value].labelId, lang)}
                  wrapperStyle={{ color: 'var(--color-ink-soft)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-ink)' }}
                  formatter={(value, name) => [value, pick(SEVERITY_META[name].label, SEVERITY_META[name].labelId, lang)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-xl border border-line p-4">
            <h2 className="text-sm font-semibold text-ink mb-4">{t('symptom_frequency_heading')}</h2>
            <div className="space-y-3">
              {symptomFrequency.map((item) => {
                const max = Math.max(...symptomFrequency.map((s) => s.count), 1)
                const pct = Math.max((item.count / max) * 100, item.count > 0 ? 4 : 0)
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <p className="w-36 shrink-0 text-sm font-semibold text-ink text-left leading-snug">
                      {item.label}
                    </p>
                    <div className="flex-1 h-2.5 rounded-full bg-paper-dim overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-5 shrink-0 text-right text-xs font-medium text-ink-soft">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
