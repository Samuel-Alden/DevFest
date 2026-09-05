export function OfflineBanner({ isOnline, pendingCount, isSyncing }) {
  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={`w-full text-center text-sm font-medium py-2 px-4 animate-fade-in ${
        isOnline ? 'bg-brand text-white' : 'bg-ink text-white'
      }`}
    >
      {!isOnline && "You're offline — submissions are being saved on this device."}
      {isOnline && isSyncing && 'Syncing saved submissions…'}
      {isOnline && !isSyncing && pendingCount > 0 && `${pendingCount} submission(s) waiting to sync…`}
    </div>
  )
}
