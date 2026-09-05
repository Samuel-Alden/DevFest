import { SEVERITY_META, SYMPTOM_OPTIONS } from '../../lib/triage'
import { BackIcon } from '../icons'

export function CaseDetailPane({ row, onBack, onUpdateStatus, className = '' }) {
  if (!row) {
    return (
      <div className={`${className} items-center justify-center text-ink-soft text-sm`}>
        Select a case to see the full details.
      </div>
    )
  }

  const meta = SEVERITY_META[row.severity]

  return (
    <div className={`${className} flex-col overflow-y-auto`}>
      <div key={row.id} className="p-4 max-w-xl w-full mx-auto animate-fade-in">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1 text-sm text-ink-soft mb-4"
        >
          <BackIcon className="h-4 w-4" /> Back to queue
        </button>

        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}>
          {meta.label}
        </span>
        <h2 className="mt-2 text-xl font-bold text-ink">
          {row.patient_name || 'Unnamed patient'} {row.age ? `(${row.age})` : ''}
        </h2>
        <p className="text-xs text-ink-soft mt-1">{new Date(row.created_at).toLocaleString()}</p>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-ink mb-2">Symptoms</h3>
          <ul className="space-y-1">
            {SYMPTOM_OPTIONS.map((opt) => {
              const checked = row.symptoms?.includes(opt.key)
              return (
                <li
                  key={opt.key}
                  className={`flex items-center gap-2 text-sm ${checked ? 'text-ink' : 'text-ink-soft/50'}`}
                >
                  <span className={`h-2 w-2 rounded-full ${checked ? SEVERITY_META[opt.severity].badge : 'bg-line'}`} />
                  {opt.label}
                </li>
              )
            })}
          </ul>
        </div>

        {row.notes && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink mb-1">Notes</h3>
            <p className="text-sm text-ink-soft italic">"{row.notes}"</p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {row.status !== 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(row.id, 'in_progress')}
              className="text-sm px-4 py-2 rounded-lg border border-line transition-colors hover:bg-paper-dim"
            >
              In progress
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(row.id, 'resolved')}
            className="text-sm px-4 py-2 rounded-lg bg-brand text-white transition-colors hover:bg-brand-deep"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  )
}
