import { SEVERITY_META, SYMPTOM_OPTIONS } from '../../lib/triage'
import { BackIcon } from '../icons'

export function CaseDetailPane({ row, onBack, onUpdateStatus, className = '' }) {
  if (!row) {
    return (
      <div className={`${className} items-center justify-center text-neutral-400 text-sm`}>
        Select a case to see the full details.
      </div>
    )
  }

  const meta = SEVERITY_META[row.severity]

  return (
    <div className={`${className} flex-col overflow-y-auto`}>
      <div className="p-4 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1 text-sm text-neutral-500 mb-4"
        >
          <BackIcon className="h-4 w-4" /> Back to queue
        </button>

        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}>
          {meta.label}
        </span>
        <h2 className="mt-2 text-xl font-bold text-neutral-900">
          {row.patient_name || 'Unnamed patient'} {row.age ? `(${row.age})` : ''}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">{new Date(row.created_at).toLocaleString()}</p>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Symptoms</h3>
          <ul className="space-y-1">
            {SYMPTOM_OPTIONS.map((opt) => {
              const checked = row.symptoms?.includes(opt.key)
              return (
                <li
                  key={opt.key}
                  className={`flex items-center gap-2 text-sm ${checked ? 'text-neutral-900' : 'text-neutral-300'}`}
                >
                  <span className={`h-2 w-2 rounded-full ${checked ? SEVERITY_META[opt.severity].badge : 'bg-neutral-200'}`} />
                  {opt.label}
                </li>
              )
            })}
          </ul>
        </div>

        {row.notes && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-1">Notes</h3>
            <p className="text-sm text-neutral-600 italic">"{row.notes}"</p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {row.status !== 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(row.id, 'in_progress')}
              className="text-sm px-4 py-2 rounded-md border border-neutral-300 hover:bg-neutral-50"
            >
              In progress
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(row.id, 'resolved')}
            className="text-sm px-4 py-2 rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  )
}
