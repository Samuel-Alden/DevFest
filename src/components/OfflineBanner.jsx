import { useTranslation } from '../lib/i18n'

export function OfflineBanner({ isOnline, pendingCount, isSyncing }) {
  const { t } = useTranslation()
  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={`w-full text-center text-sm font-medium py-2 px-4 animate-fade-in ${
        isOnline ? 'bg-brand text-white' : 'bg-ink text-white'
      }`}
    >
      {!isOnline && t('offline_banner')}
      {isOnline && isSyncing && t('syncing')}
      {isOnline && !isSyncing && pendingCount > 0 && t('pending_sync', pendingCount)}
    </div>
  )
}
