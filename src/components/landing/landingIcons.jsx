// Small inline icons for the landing page. Same visual language as
// src/components/icons.jsx (24x24 viewBox, currentColor stroke, round caps)
// so nothing new is introduced to the icon set the rest of the app uses.

function Stroke({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// A quiet monochrome mark: a triage triangle with a care cross knocked out of
// it. Triangle inherits the current text color; the cross uses the paper token
// so it stays legible on the mark in both light and dark themes.
export function BrandMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M15.13 4.6 3.3 25.05A1 1 0 0 0 4.17 26.55h23.66a1 1 0 0 0 .87-1.5L16.87 4.6a1 1 0 0 0-1.74 0Z"
        fill="currentColor"
      />
      <path d="M16 12.2v8.2M11.9 16.3h8.2" stroke="var(--color-paper)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function WifiOffIcon({ className }) {
  return (
    <Stroke className={className}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </Stroke>
  )
}

export function ClipboardListIcon({ className }) {
  return (
    <Stroke className={className}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M8 11h8M8 16h5" />
    </Stroke>
  )
}

export function RefreshIcon({ className }) {
  return (
    <Stroke className={className}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Stroke>
  )
}

export function SaveIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </Stroke>
  )
}

export function SignalIcon({ className }) {
  return (
    <Stroke className={className}>
      <line x1="4" y1="20" x2="4" y2="15" />
      <line x1="10" y1="20" x2="10" y2="11" />
      <line x1="16" y1="20" x2="16" y2="7" />
      <line x1="22" y1="20" x2="22" y2="3" />
    </Stroke>
  )
}

export function CloudCheckIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <polyline points="9 15 11 17 15 13" />
    </Stroke>
  )
}

export function ShieldCheckIcon({ className }) {
  return (
    <Stroke className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </Stroke>
  )
}

export function ArrowDownIcon({ className }) {
  return (
    <Stroke className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </Stroke>
  )
}
