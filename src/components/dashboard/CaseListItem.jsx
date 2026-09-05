import { SEVERITY_META, SYMPTOM_OPTIONS } from '../../lib/triage'

function symptomSummary(symptoms) {
  if (!symptoms?.length) return 'No symptoms recorded'
  return symptoms.map((k) => SYMPTOM_OPTIONS.find((o) => o.key === k)?.label ?? k).join(', ')
}

export function CaseListItem({ row, selected, onSelect }) {
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
              {row.patient_name || 'Unnamed patient'} {row.age ? `(${row.age})` : ''}
            </span>
          </span>
          <span className="block text-xs text-ink-soft truncate">{symptomSummary(row.symptoms)}</span>
          {row.notes && <span className="block text-xs text-ink-soft/80 italic truncate">"{row.notes}"</span>}
        </span>
      </button>
    </li>
  )
}
