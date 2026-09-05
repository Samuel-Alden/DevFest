import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  let payload = { title: 'TriagePeace', body: 'New case in the triage queue.' }
  if (event.data) {
    try {
      payload = event.data.json()
    } catch {
      payload.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: payload.tag || 'triagepeace-alert',
      data: { url: payload.url || '/dashboard' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    }),
  )
})
