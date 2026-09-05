import { SEVERITY_META, SYMPTOM_OPTIONS } from '../../lib/triage'
import { useTranslation, pick } from '../../lib/i18n'

function symptomSummary(symptoms, lang, t) {
  if (!symptoms?.length) return t('no_symptoms_recorded')
  return symptoms
    .map((k) => {
      const opt = SYMPTOM_OPTIONS.find((o) => o.key === k)
      return opt ? pick(opt.label, opt.labelId, lang) : k
    })
    .join(', ')
}

export function CaseListItem({ row, selected, onSelect }) {
  const { t, lang } = useTranslation()
  const meta = SEVERITY_META[row.severity]
  const initial = row.patient_name?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <li>
      <button
        onClick={() => onSelect(row.id)}
        className={`w-full text-left rounded-lg border-2 p-3 flex gap-3 transition-colors ${meta.border} ${
          selected ? meta.soft : 'bg-paper hover:bg-paper-dim'
        }`}
      >
        <span
          className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold ${meta.badge}`}
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-ink truncate">
              {row.patient_name || t('unnamed_patient')} {row.age ? `(${row.age})` : ''}
            </span>
          </span>
          <span className="block text-xs text-ink-soft truncate">{symptomSummary(row.symptoms, lang, t)}</span>
          {row.notes && <span className="block text-xs text-ink-soft/80 italic truncate">"{row.notes}"</span>}
        </span>
      </button>
    </li>
  )
}
