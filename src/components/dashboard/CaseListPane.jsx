import { CaseListItem } from './CaseListItem'

export function CaseListPane({ rows, selectedId, onSelect, searchQuery, onSearchChange, loading, className = '' }) {
  return (
    <div className={`${className} flex-col min-h-0`}>
      <div className="p-3 border-b border-neutral-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, symptoms, notes…"
            className="w-full rounded-md border border-neutral-300 pl-8 pr-3 py-2 text-sm"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {loading && <p className="text-neutral-400 text-sm px-1">Loading…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-neutral-400 text-sm text-center mt-16">No matching cases.</p>
        )}
        {rows.map((row) => (
          <CaseListItem key={row.id} row={row} selected={row.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  )
}
