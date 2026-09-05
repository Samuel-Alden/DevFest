import { useCallback, useEffect, useState } from 'react'
import { flushQueue, queueSize } from '../lib/queue'

export function useOnlineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const refreshPendingCount = useCallback(async () => {
    setPendingCount(await queueSize())
  }, [])

  const sync = useCallback(async () => {
    if (!navigator.onLine) return
    setIsSyncing(true)
    try {
      await flushQueue()
    } finally {
      setIsSyncing(false)
      await refreshPendingCount()
    }
  }, [refreshPendingCount])

  useEffect(() => {
    refreshPendingCount()

    const handleOnline = () => {
      setIsOnline(true)
      sync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    sync()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [sync, refreshPendingCount])

  return { isOnline, pendingCount, isSyncing, refreshPendingCount, sync }
}
