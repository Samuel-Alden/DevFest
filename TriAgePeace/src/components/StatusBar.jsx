export default function StatusBar({ isOnline, offlineCount }) {
  return (
    <div
      className={`border-b px-4 py-2 text-xs font-semibold flex justify-between items-center ${
        isOnline
          ? 'bg-emerald-100 border-emerald-200 text-emerald-900'
          : 'bg-sky-100 border-sky-200 text-sky-900'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            isOnline ? 'bg-emerald-500' : 'bg-sky-500'
          }`}
        />
        {isOnline ? 'Live Connection Active' : 'Offline Mode Active'}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full ${
          isOnline ? 'bg-emerald-200' : 'bg-sky-200'
        }`}
      >
        {isOnline ? 'Synced to Cloud' : `${offlineCount} queued for sync`}
      </span>
    </div>
  )
}
