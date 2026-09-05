// Best-effort location capture. Bounded so it can never hang the offline-first
// submit flow indefinitely, but long enough for a real fix -- Wi-Fi/IP-based
// lookup (what most desktop browsers and many phones use on a cold request)
// routinely takes several seconds, so anything much shorter than this returns
// null almost every time even with location permission granted.
//
// Resolves { latitude, longitude, error: null } on success, or
// { latitude: null, longitude: null, error } on failure, where error is one
// of 'unsupported' | 'denied' | 'unavailable' | 'timeout' -- surfaced to the
// UI so a missing pin on the map is diagnosable instead of a silent no-op.
export function getCurrentPosition({ timeout = 6000 } = {}) {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ latitude: null, longitude: null, error: 'unsupported' })
      return
    }
    const timer = setTimeout(() => {
      resolve({ latitude: null, longitude: null, error: 'timeout' })
    }, timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, error: null })
      },
      (err) => {
        clearTimeout(timer)
        // GeolocationPositionError codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        const error = err?.code === 1 ? 'denied' : err?.code === 3 ? 'timeout' : 'unavailable'
        resolve({ latitude: null, longitude: null, error })
      },
      { maximumAge: 60000, timeout },
    )
  })
}
