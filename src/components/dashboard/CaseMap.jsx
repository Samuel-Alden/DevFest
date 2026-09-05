import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from '../../lib/i18n'

const SEVERITY_HEX = { red: '#b3382c', yellow: '#b8791e', green: '#3d7247' }

export function CaseMap({ rows, onSelect }) {
  const { t } = useTranslation()
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = L.map(containerRef.current, { zoomControl: true }).setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const located = rows.filter((r) => r.latitude != null && r.longitude != null)

    for (const row of located) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:9999px;background:${SEVERITY_HEX[row.severity]};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25)"></div>`,
        iconSize: [16, 16],
      })
      const marker = L.marker([row.latitude, row.longitude], { icon }).addTo(map)
      marker.on('click', () => onSelect(row.id))
      markersRef.current.push(marker)
    }

    if (located.length > 0) {
      map.fitBounds(
        L.latLngBounds(located.map((r) => [r.latitude, r.longitude])),
        { padding: [30, 30], maxZoom: 14 },
      )
    }
  }, [rows, onSelect])

  const locatedCount = rows.filter((r) => r.latitude != null && r.longitude != null).length

  return (
    <div className="flex-1 min-h-0 h-full relative">
      <div ref={containerRef} className="absolute inset-0" />
      {locatedCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/80 text-sm text-ink-soft pointer-events-none">
          {t('no_located_cases')}
        </div>
      )}
    </div>
  )
}
