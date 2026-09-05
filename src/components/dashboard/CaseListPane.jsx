import { CaseListItem } from './CaseListItem'
import { CaseMap } from './CaseMap'
import { useTranslation } from '../../lib/i18n'

function ListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-lg bg-paper-dim" />
      ))}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
        active ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function CaseListPane({
  rows,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  loading,
  viewMode,
  onViewModeChange,
  displayMode,
  onDisplayModeChange,
  className = '',
}) {
  const { t } = useTranslation()

  return (
    <div className={`${className} flex-col min-h-0`}>
      <div className="p-3 border-b border-line space-y-2">
        <div className="flex gap-1 bg-paper-dim rounded-lg p-1">
          <TabButton active={viewMode === 'active'} onClick={() => onViewModeChange('active')}>
            {t('tab_active')}
          </TabButton>
          <TabButton active={viewMode === 'resolved'} onClick={() => onViewModeChange('resolved')}>
            {t('tab_resolved')}
          </TabButton>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
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

        {viewMode === 'active' && (
          <div className="flex gap-1 bg-paper-dim rounded-lg p-1">
            <TabButton active={displayMode === 'list'} onClick={() => onDisplayModeChange('list')}>
              {t('tab_list')}
            </TabButton>
            <TabButton active={displayMode === 'map'} onClick={() => onDisplayModeChange('map')}>
              {t('tab_map')}
            </TabButton>
          </div>
        )}
      </div>

      {viewMode === 'active' && displayMode === 'map' ? (
        <CaseMap rows={rows} onSelect={onSelect} />
      ) : (
        <ul className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
          {loading && <ListSkeleton />}
          {!loading && rows.length === 0 && (
            <p className="text-ink-soft text-sm text-center mt-16">
              {viewMode === 'resolved' ? t('no_resolved_cases') : t('no_matching_cases')}
            </p>
          )}
          {rows.map((row) => (
            <CaseListItem key={row.id} row={row} selected={row.id === selectedId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </div>
  )
}
