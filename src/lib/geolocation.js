// Best-effort location capture. Bounded so it can never hang the offline-first
// submit flow indefinitely, but long enough for a real fix -- Wi-Fi/IP-based
// lookup (what most desktop browsers and many phones use on a cold request)
// routinely takes several seconds, so anything much shorter than this returns
// null almost every time even with location permission granted.
export function getCurrentPosition({ timeout = 6000 } = {}) {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null)
      return
    }
    const timer = setTimeout(() => resolve(null), timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
      { maximumAge: 60000, timeout },
    )
  })
}
