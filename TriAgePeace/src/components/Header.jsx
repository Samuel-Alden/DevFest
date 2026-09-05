export default function Header({ tab, onTabChange, activeCount }) {
  return (
    <header className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-bold tracking-wide">
        Triage<span className="text-emerald-400">Peace</span>
      </h1>

      <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-medium">
        <button
          onClick={() => onTabChange('intake')}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === 'intake'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-300'
          }`}
        >
          + Intake
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === 'dashboard'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-300'
          }`}
        >
          Queue ({activeCount})
        </button>
      </div>
    </header>
  )
}
