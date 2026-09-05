import { useEffect, useState } from 'react'
import { getPushSubscriptionState, isPushSupported, subscribeToPush } from '../lib/push'

export function PushAlertToggle() {
  const [state, setState] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isPushSupported()) {
      setState('unsupported')
      return
    }
    getPushSubscriptionState().then(setState)
  }, [])

  const handleEnable = async () => {
    setError(null)
    try {
      await subscribeToPush()
      setState('subscribed')
    } catch (err) {
      setError(err.message)
      setState(await getPushSubscriptionState())
    }
  }

  if (state === 'unsupported' || state === 'checking') return null

  if (state === 'subscribed') {
    return <span className="text-xs text-green-700 font-medium">🔔 Emergency alerts on</span>
  }

  if (state === 'denied') {
    return <span className="text-xs text-neutral-400">Notifications blocked in browser settings</span>
  }

  return (
    <div className="text-right">
      <button
        onClick={handleEnable}
        className="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
      >
        Enable emergency alerts
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
