import { CaseListItem } from './CaseListItem'

function ListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-lg bg-paper-dim" />
      ))}
    </div>
  )
}

export function CaseListPane({ rows, selectedId, onSelect, searchQuery, onSearchChange, loading, className = '' }) {
  return (
    <div className={`${className} flex-col min-h-0`}>
      <div className="p-3 border-b border-line">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, symptoms, notes…"
            className="w-full rounded-lg border border-line pl-8 pr-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {loading && <ListSkeleton />}
        {!loading && rows.length === 0 && (
          <p className="text-ink-soft text-sm text-center mt-16">No matching cases.</p>
        )}
        {rows.map((row) => (
          <CaseListItem key={row.id} row={row} selected={row.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  )
}
