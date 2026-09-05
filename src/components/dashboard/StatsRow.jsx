import { SEVERITY_META } from '../../lib/triage'
import { useTranslation, pick } from '../../lib/i18n'

export function StatsRow({ rows }) {
  const { lang } = useTranslation()
  const counts = { red: 0, yellow: 0, green: 0 }
  for (const row of rows) {
    if (counts[row.severity] !== undefined) counts[row.severity] += 1
  }

  return (
    <div className="flex gap-2 px-4 py-3 border-b border-line bg-paper">
      {['red', 'yellow', 'green'].map((severity) => (
        <div key={severity} className={`flex-1 rounded-lg px-3 py-2 ${SEVERITY_META[severity].soft}`}>
          <p className="text-xl font-bold text-ink">{counts[severity]}</p>
          <p className="text-xs text-ink-soft">{pick(SEVERITY_META[severity].label, SEVERITY_META[severity].labelId, lang)}</p>
        </div>
      ))}
    </div>
  )
}
